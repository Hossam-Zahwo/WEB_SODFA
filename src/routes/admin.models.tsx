import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, Pencil, Upload, X, Boxes } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminPage } from "@/components/AdminShell";
import { supabase } from "@/lib/supabase";
import { listModels, type DbModel } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/models")({ component: ModelsAdmin });
const BUCKET = "product-model-images";
function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""); }

type ModelForm = { slug: string; name_ar: string; name_en: string; image_url: string };
const empty: ModelForm = { slug: "", name_ar: "", name_en: "", image_url: "" };

function ModelsAdmin() {
  const [items, setItems] = useState<DbModel[]>([]);
  const [form, setForm] = useState<ModelForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async () => { try { setError(""); setItems(await listModels()); } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل الموديلات. تأكد من تنفيذ ملف SQL."); } };
  useEffect(() => { void load(); }, []);
  const chooseImage = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("اختر ملف صورة صالحًا."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("حجم الصورة يجب ألا يتجاوز 8MB."); return; }
    setError(""); setImageFile(file); setRemoveCurrentImage(false); setForm((f) => ({ ...f, image_url: URL.createObjectURL(file) }));
  };
  const uploadImage = async (id: string, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${id}/${crypto.randomUUID()}.${/^[a-z0-9]+$/.test(ext) ? ext : "jpg"}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || "image/jpeg", cacheControl: "31536000" });
    if (error) throw error;
    return { path, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const slug = slugify(form.slug || form.name_en);
      if (!slug || !form.name_ar.trim() || !form.name_en.trim()) throw new Error("الاسم العربي والإنجليزي مطلوبان، مع Slug إن لم يتوفر اسم إنجليزي.");
      const payload = { slug, name_ar: form.name_ar.trim(), name_en: form.name_en.trim() };
      let id = editing;
      if (editing) { const r = await supabase.from("product_models").update(payload).eq("id", editing).select("id").single(); if (r.error) throw r.error; id = r.data.id; }
      else { const r = await supabase.from("product_models").insert(payload).select("id").single(); if (r.error) throw r.error; id = r.data.id; }
      if (imageFile && id) {
        const uploaded = await uploadImage(id, imageFile);
        const r = await supabase.from("product_models").update({ image_url: uploaded.url, storage_path: uploaded.path }).eq("id", id);
        if (r.error) { await supabase.storage.from(BUCKET).remove([uploaded.path]); throw r.error; }
        const oldPath = items.find((m) => m.id === id)?.storage_path;
        if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
      } else if (removeCurrentImage && id) {
        const r = await supabase.from("product_models").update({ image_url: null, storage_path: null }).eq("id", id);
        if (r.error) throw r.error;
        const oldPath = items.find((m) => m.id === id)?.storage_path;
        if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
      }
      setShow(false); setEditing(null); setForm(empty); setImageFile(null); setRemoveCurrentImage(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ الموديل."); } finally { setSaving(false); }
  };
  const openNew = () => { setEditing(null); setForm(empty); setImageFile(null); setRemoveCurrentImage(false); setShow(true); setError(""); };
  const openEdit = (m: DbModel) => { setEditing(m.id); setForm({ slug: m.slug, name_ar: m.name_ar, name_en: m.name_en, image_url: m.image_url || "" }); setImageFile(null); setRemoveCurrentImage(false); setShow(true); setError(""); };
  const clearImage = () => { setImageFile(null); setRemoveCurrentImage(true); setForm((f) => ({ ...f, image_url: "" })); if (fileRef.current) fileRef.current.value = ""; };
  const remove = async (m: DbModel) => {
    if (!confirm("حذف الموديل؟ لن يتم حذف المنتجات المرتبطة به، لكن سيتم فك ارتباطها به.")) return;
    const r = await supabase.from("product_models").delete().eq("id", m.id);
    if (r.error) setError(r.error.message); else { if (m.storage_path) await supabase.storage.from(BUCKET).remove([m.storage_path]); await load(); }
  };
  return <AdminGuard><AdminPage>
    <div className="mb-6 flex items-center justify-between gap-3"><div><h1 className="text-3xl font-extrabold">الموديلات</h1><p className="text-slate-500">أضف الموديل باللغتين وارفع صورته لاستخدامه في المنتجات.</p></div><Button onClick={openNew}><Plus size={17}/> إضافة موديل</Button></div>
    {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
    {show && <Card className="mb-6 border-border bg-card"><CardContent className="p-6"><form onSubmit={save} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 text-sm"><span className="block font-semibold">اسم الموديل بالعربي</span><Input required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="آيفون 17 برو ماكس"/></label>
      <label className="space-y-2 text-sm"><span className="block font-semibold">Model name in English</span><Input required value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="iPhone 17 Pro Max"/></label>
      <label className="space-y-2 text-sm md:col-span-2"><span className="block font-semibold">Slug</span><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="iphone-17-pro-max"/></label>
      <div className="md:col-span-2"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ImagePlus size={17}/> صورة الموديل</div><div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); chooseImage(e.dataTransfer.files?.[0]); }} onClick={() => fileRef.current?.click()} className={`relative flex min-h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => chooseImage(e.target.files?.[0])}/>{form.image_url ? <><img src={form.image_url} alt="" className="h-40 w-full object-contain p-3"/><button type="button" onClick={(e) => { e.stopPropagation(); clearImage(); }} className="absolute end-3 top-3 rounded-full bg-white p-2 shadow"><X size={16}/></button></> : <div className="text-center text-sm text-subtle"><Upload className="mx-auto mb-2 text-primary" size={26}/>اسحب الصورة هنا أو اخترها من جهازك <span className="block text-xs">JPG, PNG, WEBP — حتى 8MB</span></div>}</div></div>
      <div className="flex gap-2 md:col-span-2"><Button disabled={saving} type="submit">{saving ? "جاري الحفظ..." : editing ? "حفظ التعديل" : "إضافة الموديل"}</Button><Button type="button" variant="outline" onClick={() => setShow(false)}>إلغاء</Button></div>
    </form></CardContent></Card>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((m) => <Card key={m.id} className="overflow-hidden"><CardContent className="p-0"><div className="flex h-40 items-center justify-center bg-muted/30"><img src={m.image_url || "/placeholder.svg"} alt={m.name_en} className="h-full w-full object-contain p-3"/></div><div className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{m.name_ar}</h3><p className="truncate text-sm text-muted-foreground">{m.name_en} · /{m.slug}</p></div><Button type="button" variant="outline" onClick={() => openEdit(m)}><Pencil size={16}/></Button><Button type="button" variant="destructive" onClick={() => void remove(m)}><Trash2 size={16}/></Button></div></CardContent></Card>)}</div>
  </AdminPage></AdminGuard>;
}
