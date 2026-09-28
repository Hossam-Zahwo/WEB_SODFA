import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Layers, Pencil, Plus, Trash2, Upload, X, Save } from "lucide-react";
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
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  const load = async () => { try { const rows = await listSeries(); setItems(rows); setOrderDirty(false); return true; } catch (e) { setError(`تعذر تحميل السلاسل: ${e instanceof Error ? e.message : String(e)}`); return false; } };
  useEffect(() => { void load(); }, []);

  const moveSeries = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    if (!items.length || !orderDirty) return;
    setOrderSaving(true);
    setError("");
    try {
      const results = await Promise.all(
        items.map((item, index) =>
          supabase.from("product_series").update({ display_order: index }).eq("id", item.id),
        ),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      setItems((current) => current.map((item, index) => ({ ...item, display_order: index })));
      setOrderDirty(false);
    } catch (e) {
      setError(`تعذر حفظ ترتيب السلاسل: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setOrderSaving(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (!form.name_ar.trim() || !form.name_en.trim()) throw new Error("الاسم العربي والإنجليزي مطلوبان.");
      const slug = slugify(form.slug || form.name_en); if (!slug) throw new Error("تعذر إنشاء slug صالح.");
      const payload = { slug, name_ar: form.name_ar.trim(), name_en: form.name_en.trim() };
      let id = editing;

      if (editing) {
        const r = await supabase.from("product_series").update(payload).eq("id", editing);
        if (r.error) throw r.error;
      } else {
        // Generate the UUID client-side so saving does not depend on a post-insert SELECT policy.
        id = crypto.randomUUID();
        const nextOrder = items.length ? Math.max(...items.map((item) => Number(item.display_order ?? 0))) + 1 : 0;
        const r = await supabase.from("product_series").insert({ id, ...payload, display_order: nextOrder });
        if (r.error) throw r.error;
      }

      // The series itself is already saved. Image upload is a separate optional step so
      // a missing bucket/storage policy cannot make the user think the series was not saved.
      if (file && id) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${id}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || "image/jpeg", cacheControl: "31536000" });
        if (up.error) {
          setError(`تم حفظ السلسلة، لكن تعذر رفع الصورة: ${up.error.message}`);
        } else {
          const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          const r = await supabase.from("product_series").update({ image_url: url, storage_path: path }).eq("id", id);
          if (r.error) {
            await supabase.storage.from(BUCKET).remove([path]);
            setError(`تم حفظ السلسلة، لكن تعذر حفظ الصورة: ${r.error.message}`);
          } else {
            const old = items.find(x => x.id === id)?.storage_path;
            if (old) await supabase.storage.from(BUCKET).remove([old]);
          }
        }
      } else if (removeImage && id) {
        const old = items.find(x => x.id === id)?.storage_path;
        const r = await supabase.from("product_series").update({ image_url: null, storage_path: null }).eq("id", id);
        if (r.error) throw r.error;
        if (old) await supabase.storage.from(BUCKET).remove([old]);
      }

      setForm(empty); setFile(null); setRemoveImage(false); setEditing(null);
      const reloaded = await load();
      if (!reloaded && !error) setError("تم حفظ السلسلة، لكن تعذر تحديث قائمة السلاسل. أعد تحميل الصفحة.");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(`تعذر حفظ السلسلة: ${message}`);
    } finally { setSaving(false); }
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
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white">
      <div><div className="font-black">ترتيب ظهور السلاسل</div><p className="mt-1 text-xs text-slate-400">استخدم الأسهم لتحديد ترتيب العرض للعميل، ثم اضغط حفظ الترتيب.</p></div>
      <Button type="button" disabled={!orderDirty || orderSaving} onClick={() => void saveOrder()} className="bg-white text-slate-950 hover:bg-slate-100">
        <Save size={16}/>{orderSaving ? "جاري حفظ الترتيب..." : "حفظ الترتيب"}
      </Button>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => <Card key={item.id} className="overflow-hidden border-slate-200 bg-white text-black">
        <div className="aspect-square bg-slate-50"><img src={item.image_url || "/placeholder.svg"} alt={item.name_ar} className="h-full w-full object-contain p-5"/></div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div><div className="mb-1 text-[10px] font-black uppercase tracking-wider text-violet-600">ترتيب #{index + 1}</div><h3 className="font-bold">{item.name_ar}</h3><p className="text-xs text-slate-500">{item.name_en}</p></div>
            <Layers size={18} className="text-slate-400"/>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="outline" title="تحريك لأعلى" disabled={index === 0 || orderSaving} onClick={() => moveSeries(index, -1)}><ArrowUp size={14}/></Button>
              <Button type="button" size="sm" variant="outline" title="تحريك لأسفل" disabled={index === items.length - 1 || orderSaving} onClick={() => moveSeries(index, 1)}><ArrowDown size={14}/></Button>
            </div>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(item)}><Pencil size={14}/>تعديل</Button><Button size="sm" variant="destructive" onClick={() => void remove(item)}><Trash2 size={14}/>حذف</Button></div>
          </div>
        </CardContent>
      </Card>)}
    </div>
  </AdminPage></AdminGuard>;
}
