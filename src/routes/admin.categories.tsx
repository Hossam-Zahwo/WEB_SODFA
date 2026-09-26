import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, Pencil, Upload, X } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminPage } from "@/components/AdminShell";
import { supabase } from "@/lib/supabase";
import { listCategories, type DbCategory } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesAdmin });

const CATEGORY_BUCKET = "category-images";

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function CategoriesAdmin() {
  const [items, setItems] = useState<DbCategory[]>([]);
  const [form, setForm] = useState({ slug: "", name_ar: "", name_en: "", image_url: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    try { setError(""); setItems(await listCategories()); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل الأقسام"); }
  };

  useEffect(() => { void load(); }, []);

  const chooseImage = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("اختر ملف صورة صالحًا."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("حجم صورة القسم يجب ألا يتجاوز 8MB."); return; }
    setError("");
    setImageFile(file);
    setForm((current) => ({ ...current, image_url: URL.createObjectURL(file) }));
  };

  const uploadImage = async (categoryId: string, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${categoryId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(CATEGORY_BUCKET).upload(path, file, { upsert: false, cacheControl: "31536000" });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(CATEGORY_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const slug = slugify(form.slug || form.name_en);
      if (!slug) throw new Error("اكتب الاسم الإنجليزي أو الـ Slug أولًا.");
      if (!form.name_ar.trim() || !form.name_en.trim()) throw new Error("الاسم العربي والإنجليزي مطلوبان.");

      const basePayload = { slug, name_ar: form.name_ar.trim(), name_en: form.name_en.trim() };
      let categoryId = editing;

      if (editing) {
        const result = await supabase.from("categories").update(basePayload).eq("id", editing).select("id").single();
        if (result.error) throw result.error;
        categoryId = result.data.id;
      } else {
        const result = await supabase.from("categories").insert(basePayload).select("id").single();
        if (result.error) throw result.error;
        categoryId = result.data.id;
      }

      if (imageFile && categoryId) {
        const publicUrl = await uploadImage(categoryId, imageFile);
        const imageResult = await supabase.from("categories").update({ image_url: publicUrl }).eq("id", categoryId);
        if (imageResult.error) throw imageResult.error;
      }

      setShow(false);
      setEditing(null);
      setImageFile(null);
      setForm({ slug: "", name_ar: "", name_en: "", image_url: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ القسم");
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف التصنيف؟ المنتجات المرتبطة به قد تتأثر حسب قيود قاعدة البيانات.")) return;
    const result = await supabase.from("categories").delete().eq("id", id);
    if (result.error) setError(result.error.message); else await load();
  };

  const openNew = () => {
    setEditing(null); setImageFile(null); setForm({ slug: "", name_ar: "", name_en: "", image_url: "" }); setShow(true); setError("");
  };

  const openEdit = (c: DbCategory) => {
    setEditing(c.id); setImageFile(null); setForm({ slug: c.slug, name_ar: c.name_ar, name_en: c.name_en, image_url: c.image_url ?? "" }); setShow(true); setError("");
  };

  const clearImage = () => { setImageFile(null); setForm((current) => ({ ...current, image_url: "" })); if (fileRef.current) fileRef.current.value = ""; };

  return <AdminGuard><AdminPage>
    <div className="mb-6 flex items-center justify-between gap-3"><div><h1 className="text-3xl font-extrabold">التصنيفات</h1><p className="text-slate-500">أضف اسم القسم بالعربي والإنجليزي وصورة تظهر مباشرة في واجهة المتجر.</p></div><Button onClick={openNew}><Plus size={17}/>إضافة تصنيف</Button></div>
    {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

    {show && <Card className="mb-6 border-border bg-card shadow-sm"><CardContent className="p-6"><form onSubmit={save} className="grid gap-5 md:grid-cols-2">
      <Field label="الاسم بالعربي"><Input required value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })}/></Field>
      <Field label="English name"><Input required value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })}/></Field>
      <Field label="Slug"><Input value={form.slug} placeholder="phone-cases" onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}/></Field>

      <div className="md:col-span-2">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ImagePlus size={17} className="text-primary"/> صورة القسم</div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); chooseImage(e.dataTransfer.files?.[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`relative flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"}`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => chooseImage(e.target.files?.[0])}/>
          {form.image_url ? (
            <>
              <img src={form.image_url} alt="" className="h-44 w-full object-contain p-3" />
              <button type="button" onClick={(e) => { e.stopPropagation(); clearImage(); }} className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md"><X size={16}/></button>
            </>
          ) : (
            <div className="text-center text-sm text-subtle"><Upload className="mx-auto mb-2 text-primary" size={26}/><div className="font-semibold">اسحب الصورة هنا أو اخترها من جهازك</div><div className="mt-1 text-xs">JPG, PNG, WEBP — حتى 8MB</div></div>
          )}
        </div>
      </div>

      <div className="flex gap-2 md:col-span-2"><Button disabled={saving} type="submit">{saving ? "جاري الحفظ..." : editing ? "حفظ التعديل" : "إضافة"}</Button><Button type="button" variant="outline" onClick={() => setShow(false)}>إلغاء</Button></div>
    </form></CardContent></Card>}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(c => <Card key={c.id} className="overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"><CardContent className="p-0">
      <div className="relative h-36 overflow-hidden bg-muted/40"><img src={c.image_url || "/placeholder.svg"} alt={c.name_en} className="h-full w-full object-contain p-3 transition-transform duration-500 hover:-translate-y-1" /></div>
      <div className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{c.name_ar}</h3><p className="truncate text-sm text-muted-foreground">{c.name_en} · /category/{c.slug}</p></div><Button type="button" variant="outline" onClick={() => openEdit(c)}><Pencil size={16}/></Button><Button type="button" variant="destructive" onClick={() => remove(c.id)}><Trash2 size={16}/></Button></div>
    </CardContent></Card>)}</div>
  </AdminPage></AdminGuard>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2 text-sm"><span className="block font-semibold">{label}</span>{children}</label>; }
