import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Layers, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminPage } from "@/components/AdminShell";
import { supabase } from "@/lib/supabase";
import { listSeries, type DbSeries } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/series")({ component: SeriesAdmin });
const BUCKET = "product-series-images";
const empty = { slug: "", name_ar: "", name_en: "", image_url: "" };
function slugify(v: string) { return v.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""); }

function SeriesAdmin() {
  const [items, setItems] = useState<DbSeries[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  const load = async () => { try { setItems(await listSeries()); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل السلاسل"); } };
  useEffect(() => { void load(); }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (!form.name_ar.trim() || !form.name_en.trim()) throw new Error("الاسم العربي والإنجليزي مطلوبان.");
      const slug = slugify(form.slug || form.name_en); if (!slug) throw new Error("تعذر إنشاء slug صالح.");
      const payload = { slug, name_ar: form.name_ar.trim(), name_en: form.name_en.trim() };
      let id = editing;
      if (editing) { const r = await supabase.from("product_series").update(payload).eq("id", editing).select("id").single(); if (r.error) throw r.error; id = r.data.id; }
      else { const r = await supabase.from("product_series").insert(payload).select("id").single(); if (r.error) throw r.error; id = r.data.id; }
      if (file && id) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${id}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || "image/jpeg", cacheControl: "31536000" });
        if (up.error) throw up.error;
        const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        const r = await supabase.from("product_series").update({ image_url: url, storage_path: path }).eq("id", id);
        if (r.error) { await supabase.storage.from(BUCKET).remove([path]); throw r.error; }
        const old = items.find(x => x.id === id)?.storage_path; if (old) await supabase.storage.from(BUCKET).remove([old]);
      } else if (removeImage && id) {
        const old = items.find(x => x.id === id)?.storage_path;
        const r = await supabase.from("product_series").update({ image_url: null, storage_path: null }).eq("id", id); if (r.error) throw r.error;
        if (old) await supabase.storage.from(BUCKET).remove([old]);
      }
      setForm(empty); setFile(null); setRemoveImage(false); setEditing(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ السلسلة"); } finally { setSaving(false); }
  };
  const edit = (item: DbSeries) => { setEditing(item.id); setForm({ slug: item.slug, name_ar: item.name_ar, name_en: item.name_en, image_url: item.image_url || "" }); setFile(null); setRemoveImage(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (item: DbSeries) => { if (!confirm(`حذف السلسلة «${item.name_ar}»؟ يجب ألا تكون مرتبطة بموديلات.`)) return; const r = await supabase.from("product_series").delete().eq("id", item.id); if (r.error) setError(r.error.message); else { if (item.storage_path) await supabase.storage.from(BUCKET).remove([item.storage_path]); await load(); } };
  return <AdminGuard><AdminPage>
    <div className="mb-7 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-extrabold">السلاسل</h1><p className="mt-1 text-slate-400">أنشئ السلسلة أولًا، ثم اربط بها الموديلات من صفحة الموديلات.</p></div><Button onClick={() => { setForm(empty); setEditing(null); setFile(null); setRemoveImage(false); }}><Plus size={17}/>سلسلة جديدة</Button></div>
    {error && <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}
    <Card className="border-slate-200 bg-white text-black"><CardContent className="p-5 sm:p-6"><form onSubmit={save} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 text-sm"><span>الاسم بالعربي *</span><Input required value={form.name_ar} onChange={e => setForm({...form,name_ar:e.target.value})} placeholder="آيفون 17"/></label>
      <label className="space-y-2 text-sm"><span>الاسم بالإنجليزي *</span><Input required value={form.name_en} onChange={e => setForm({...form,name_en:e.target.value})} placeholder="iPhone 17"/></label>
      <label className="space-y-2 text-sm"><span>Slug اختياري</span><Input value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} placeholder="iphone-17"/></label>
      <label className="space-y-2 text-sm"><span>صورة السلسلة</span><div className="flex gap-2"><input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]||null; setFile(f); if(f) setForm({...form,image_url:URL.createObjectURL(f)}); }} /><Button type="button" variant="outline" onClick={() => ref.current?.click()}><Upload size={16}/>اختيار صورة</Button>{(form.image_url || file) && <Button type="button" variant="outline" onClick={() => { setForm({...form,image_url:""}); setFile(null); setRemoveImage(Boolean(editing)); }}><X size={16}/>إزالة</Button>}</div></label>
      <div className="flex items-end gap-2 md:col-span-2"><Button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : editing ? "حفظ التعديل" : "إضافة السلسلة"}</Button>{editing && <Button type="button" variant="outline" onClick={() => {setEditing(null);setForm(empty);setFile(null);setRemoveImage(false)}}>إلغاء</Button>}</div>
    </form></CardContent></Card>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(item => <Card key={item.id} className="overflow-hidden border-slate-200 bg-white text-black"><div className="aspect-square bg-slate-50"><img src={item.image_url || "/placeholder.svg"} alt={item.name_ar} className="h-full w-full object-contain p-5"/></div><CardContent className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold">{item.name_ar}</h3><p className="text-xs text-slate-500">{item.name_en}</p></div><Layers size={18} className="text-slate-400"/></div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(item)}><Pencil size={14}/>تعديل</Button><Button size="sm" variant="destructive" onClick={() => void remove(item)}><Trash2 size={14}/>حذف</Button></div></CardContent></Card>)}</div>
  </AdminPage></AdminGuard>;
}
