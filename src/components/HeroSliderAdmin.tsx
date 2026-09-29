import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Copy, GripVertical, ImagePlus,
  LayoutTemplate, MoveDown, Plus, Save, Settings2, Trash2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveHeroConfig, uploadHeroImage, type HeroBenefitConfig, type HeroConfig, type HeroSlideConfig } from "@/lib/heroConfig";
import { cn } from "@/lib/utils";

const ICONS = [
  ["ShieldCheck", "حماية"], ["Settings2", "اختيارات"], ["Gem", "ستايل"], ["Truck", "شحن"],
  ["Sparkles", "مميز"], ["BadgeCheck", "موثوق"], ["Heart", "حب"], ["Star", "نجمة"],
  ["Zap", "سريع"], ["Gift", "هدية"], ["ShoppingBag", "تسوق"], ["Headphones", "دعم"],
  ["Smartphone", "موبايل"], ["CreditCard", "دفع"], ["PackageCheck", "طلب"], ["Clock3", "سرعة"],
] as const;

const ICON_NAMES = new Set(ICONS.map(([name]) => name));

function text(ar = "", en = "") { return { ar, en }; }
function uid() { return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

export function createDefaultHeroConfig(images: string[]): HeroConfig {
  const copy = (ar: string, en: string): { ar: string; en: string } => ({ ar, en });
  const benefits = [
    { icon: "ShieldCheck", ar: "حماية تقدر تعتمد عليها", en: "Protection you can trust", ars: "جرابات مختارة عشان تحافظ على موبايلك", ens: "Cases selected to help protect your phone", side: "left", vertical: "top" },
    { icon: "Settings2", ar: "اختيارات على مزاجك", en: "Picked for your style", ars: "شكل حلو واستخدام مريح كل يوم", ens: "Good looks and everyday comfort", side: "left", vertical: "bottom" },
    { icon: "Gem", ar: "ستايل يبان", en: "A look that stands out", ars: "لمسة مختلفة تكمل شكل موبايلك", ens: "A distinctive touch that completes your phone", side: "right", vertical: "top" },
    { icon: "Truck", ar: "يوصلك لحد بابك", en: "Delivered to your door", ars: "شحن لمختلف المحافظات", ens: "Shipping across Egypt", side: "right", vertical: "bottom" },
  ];
  const baseBenefits = benefits.map((b, i): HeroBenefitConfig => ({ id: `benefit-${i + 1}`, icon: b.icon, title: copy(b.ar, b.en), description: copy(b.ars, b.ens), side: b.side as "left" | "right", vertical: b.vertical as "top" | "bottom", enabled: true }));
  const data = [
    ["1", images[0] || "", "جراب يكمّل ستايلك", "A case that completes your style", "حماية شيك… تليق بموبايلك", "Smart protection, made for your phone", "جرابات مختارة بعناية، تجمع بين الشكل الحلو والحماية اللي تقدر تعتمد عليها كل يوم.", "Carefully selected cases that bring together a clean look and protection you can count on every day.", "شوف الجرابات", "Shop Cases", "cases"],
    ["2", images[1] || "", "اشحن وكمّل يومك", "Charge and keep going", "شحن سريع… من غير ما يعطّل يومك", "Fast charging, without slowing you down", "شواحن وكابلات عملية لكل مشاويرك، عشان تفضل جاهز من أول اليوم لآخره.", "Practical chargers and cables for every part of your day, so you stay ready from morning to night.", "شوف الشواحن", "Shop Chargers", "chargers"],
    ["3", images[2] || "", "الشحن على السريع", "Wireless, made easy", "حط موبايلك… وسيب الباقي علينا", "Drop your phone. Let charging do the rest.", "شحن لاسلكي عملي يخلي مكانك أرتب وروتينك أسهل، من غير كابلات متشابكة.", "Practical wireless charging that keeps your setup cleaner and your routine easier, without tangled cables.", "شوف الشحن اللاسلكي", "Shop Wireless", "wireless-charging"],
  ];
  return { version: 1, duration: 6500, slides: data.map((d, i) => ({ id: `slide-${d[0]}`, enabled: true, image: d[1], label: copy(d[2], d[3]), title: copy(d[4], d[5]), description: copy(d[6], d[7]), cta: copy(d[8], d[9]), cta2: copy("عرض كل المنتجات", "View all products"), link: d[10], contentPosition: "top", textAlign: "center", overlay: 0, benefits: baseBenefits.map((b) => ({ ...b, id: `${b.id}-${i}` })) })) };
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("space-y-2 text-sm", className)}><span className="block font-semibold text-slate-700">{label}</span>{children}</label>;
}

function LangFields({ value, onChange, arLabel, enLabel, multiline = false }: { value: { ar: string; en: string }; onChange: (next: { ar: string; en: string }) => void; arLabel: string; enLabel: string; multiline?: boolean }) {
  const common = "w-full border-slate-200 bg-white text-slate-900";
  return <div className="grid gap-3 sm:grid-cols-2">
    <Field label={`${arLabel} — عربي`}>{multiline ? <textarea rows={3} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={`${common} rounded-xl border p-3 outline-none focus:border-violet-400`} /> : <Input value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={common} />}</Field>
    <Field label={`${enLabel} — English`}>{multiline ? <textarea rows={3} dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={`${common} rounded-xl border p-3 outline-none focus:border-violet-400`} /> : <Input dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={common} />}</Field>
  </div>;
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400">{children}</select>;
}

export function HeroSliderAdmin({ initialImages }: { initialImages: string[] }) {
  const [config, setConfig] = useState<HeroConfig>(() => createDefaultHeroConfig(initialImages));
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const { loadHeroConfig } = await import("@/lib/heroConfig");
        const saved = await loadHeroConfig();
        if (saved?.slides?.length) setConfig(saved);
      } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل إعدادات الهيرو."); }
      finally { setLoading(false); }
    })();
  }, []);

  const activeCount = useMemo(() => config.slides.filter((s) => s.enabled).length, [config.slides]);

  const updateSlide = (id: string, patch: Partial<HeroSlideConfig>) => setConfig((prev) => ({ ...prev, slides: prev.slides.map((s) => s.id === id ? { ...s, ...patch } : s) }));
  const updateBenefit = (slideId: string, benefitId: string, patch: Partial<HeroBenefitConfig>) => setConfig((prev) => ({ ...prev, slides: prev.slides.map((s) => s.id === slideId ? { ...s, benefits: s.benefits.map((b) => b.id === benefitId ? { ...b, ...patch } : b) } : s) }));

  const addSlide = () => {
    const base = config.slides[config.slides.length - 1] || createDefaultHeroConfig(initialImages).slides[0];
    const next: HeroSlideConfig = { ...structuredClone(base), id: uid(), enabled: true, image: "", label: text("سلايد جديد", "New slide"), title: text("عنوان السلايد", "Slide title"), description: text("وصف السلايد", "Slide description"), cta: text("اكتشف الآن", "Discover now"), cta2: text("عرض الكل", "View all"), link: "categories", benefits: base.benefits.map((b) => ({ ...structuredClone(b), id: uid() })) };
    setConfig((prev) => ({ ...prev, slides: [...prev.slides, next] }));
    setOpenId(next.id);
  };

  const duplicateSlide = (slide: HeroSlideConfig) => {
    const next: HeroSlideConfig = { ...structuredClone(slide), id: uid(), benefits: slide.benefits.map((b) => ({ ...structuredClone(b), id: uid() })) };
    setConfig((prev) => ({ ...prev, slides: [...prev.slides, next] }));
    setOpenId(next.id);
  };

  const removeSlide = (id: string) => {
    if (config.slides.length <= 1) return;
    if (!confirm("حذف هذا السلايد؟")) return;
    setConfig((prev) => ({ ...prev, slides: prev.slides.filter((s) => s.id !== id) }));
    setOpenId(null);
  };

  const moveSlide = (id: string, direction: -1 | 1) => setConfig((prev) => {
    const index = prev.slides.findIndex((s) => s.id === id); const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= prev.slides.length) return prev;
    const slides = [...prev.slides]; [slides[index], slides[nextIndex]] = [slides[nextIndex], slides[index]]; return { ...prev, slides };
  });

  const uploadImage = async (slide: HeroSlideConfig, file?: File) => {
    if (!file) return; setUploading(slide.id); setError("");
    try { const result = await uploadHeroImage(file, slide.id); updateSlide(slide.id, { image: result.url }); setMessage("تم رفع صورة السلايد."); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر رفع الصورة."); }
    finally { setUploading(null); }
  };

  const save = async () => {
    setSaving(true); setError(""); setMessage("");
    try { await saveHeroConfig({ ...config, slides: config.slides.filter((s) => s.image && s.title.ar.trim()) }); setMessage("تم حفظ إعدادات الهيرو بنجاح. التغييرات ستظهر للزوار بعد تحديث الموقع."); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ إعدادات الهيرو. تأكد من صلاحيات Storage."); }
    finally { setSaving(false); }
  };

  return <section className="mt-10" id="hero-slider-settings">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div><div className="flex items-center gap-2"><Settings2 className="text-violet-600" size={22}/><h2 className="text-2xl font-extrabold">إدارة Hero Slider</h2></div><p className="mt-1 text-sm text-slate-500">أضف واحذف ورتّب السلايدات وتحكم في الصور والمحتوى والأيقونات وتوزيع العناصر بدون تغيير SQL.</p></div>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={addSlide}><Plus size={16}/>إضافة سلايد</Button><Button type="button" disabled={saving || loading} onClick={save}><Save size={16}/>{saving ? "جاري الحفظ..." : "حفظ كل التعديلات"}</Button></div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-900"><LayoutTemplate size={18}/><span>السلايدات الفعالة الآن: <strong>{activeCount}</strong></span><span className="text-violet-300">•</span><span>مدة الانتقال: <strong>{(config.duration / 1000).toFixed(1)} ث</strong></span><label className="mr-auto flex items-center gap-2"><span>المدة</span><Input type="number" min={2} max={30} step={0.5} value={config.duration / 1000} onChange={(e) => setConfig((p) => ({ ...p, duration: Math.max(2000, Number(e.target.value || 6.5) * 1000) }))} className="h-9 w-24 border-violet-200 bg-white" /></label></div>
    {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {message && <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><Check size={17}/>{message}</div>}
    <div className="space-y-4">
      {config.slides.map((slide, index) => <Card key={slide.id} className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <GripVertical className="text-slate-300" size={18}/><div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">{index + 1}</div>
          <button type="button" className="min-w-0 flex-1 text-right" onClick={() => setOpenId(openId === slide.id ? null : slide.id)}><div className="truncate font-bold text-slate-900">{slide.title.ar || "بدون عنوان"}</div><div className="truncate text-xs text-slate-400">{slide.title.en || "No English title"}</div></button>
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold", slide.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{slide.enabled ? "نشط" : "مخفي"}</span>
          <Button size="sm" variant="outline" onClick={() => moveSlide(slide.id, -1)} disabled={index === 0} title="تحريك لأعلى"><ArrowUp size={15}/></Button><Button size="sm" variant="outline" onClick={() => moveSlide(slide.id, 1)} disabled={index === config.slides.length - 1} title="تحريك لأسفل"><ArrowDown size={15}/></Button>
          <Button size="sm" variant="outline" onClick={() => duplicateSlide(slide)} title="نسخ"><Copy size={15}/></Button><Button size="sm" variant="outline" onClick={() => removeSlide(slide.id)} disabled={config.slides.length <= 1} title="حذف"><Trash2 size={15}/></Button>
          <Button size="sm" variant="ghost" onClick={() => setOpenId(openId === slide.id ? null : slide.id)}>{openId === slide.id ? <ChevronUp/> : <ChevronDown/>}</Button>
        </div>
        {openId === slide.id && <CardContent className="space-y-6 p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div><div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">{slide.image ? <img src={slide.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-400"><ImagePlus size={34}/></div>}<label className="absolute inset-x-3 bottom-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black/75 px-3 py-2 text-sm font-bold text-white backdrop-blur"><Upload size={15}/>{uploading === slide.id ? "جاري الرفع..." : "اختيار صورة"}<input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => void uploadImage(slide, e.target.files?.[0])}/></label></div><p className="mt-2 text-xs text-slate-400">يفضل صورة Hero بنفس النسبة الحالية للحفاظ على الشكل.</p></div>
            <div className="space-y-4">
              <LangFields value={slide.label} onChange={(label) => updateSlide(slide.id, { label })} arLabel="Label" enLabel="Label" />
              <LangFields value={slide.title} onChange={(title) => updateSlide(slide.id, { title })} arLabel="العنوان" enLabel="Title" />
              <LangFields value={slide.description} onChange={(description) => updateSlide(slide.id, { description })} arLabel="الوصف" enLabel="Description" multiline />
              <div className="grid gap-3 sm:grid-cols-2"><LangFields value={slide.cta} onChange={(cta) => updateSlide(slide.id, { cta })} arLabel="الزر الأساسي" enLabel="Primary CTA" /><LangFields value={slide.cta2} onChange={(cta2) => updateSlide(slide.id, { cta2 })} arLabel="الزر الثاني" enLabel="Secondary CTA" /></div>
              <Field label="الرابط عند الضغط على الزر الأساسي"><Input value={slide.link} onChange={(e) => updateSlide(slide.id, { link: e.target.value.replace(/^\//, "") })} placeholder="categories أو category/cases" className="border-slate-200" /></Field>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="mb-4 flex items-center gap-2 font-bold text-slate-900"><MoveDown size={18}/>توزيع محتوى السلايد</div><div className="grid gap-4 sm:grid-cols-4">
            <Field label="مكان المحتوى رأسيًا"><Select value={slide.contentPosition} onChange={(v) => updateSlide(slide.id, { contentPosition: v as HeroSlideConfig["contentPosition"] })}><option value="top">أعلى</option><option value="center">منتصف</option><option value="bottom">أسفل</option></Select></Field>
            <Field label="محاذاة النص"><Select value={slide.textAlign} onChange={(v) => updateSlide(slide.id, { textAlign: v as HeroSlideConfig["textAlign"] })}><option value="center">وسط</option><option value="right">يمين</option><option value="left">يسار</option></Select></Field>
            <Field label="تعتيم الصورة"><div className="flex h-10 items-center gap-2"><input type="range" min="0" max="0.55" step="0.05" value={slide.overlay} onChange={(e) => updateSlide(slide.id, { overlay: Number(e.target.value) })} className="w-full"/><span className="w-10 text-xs">{Math.round(slide.overlay * 100)}%</span></div></Field>
            <Field label="ظهور السلايد"><Select value={slide.enabled ? "true" : "false"} onChange={(v) => updateSlide(slide.id, { enabled: v === "true" })}><option value="true">نشط</option><option value="false">مخفي</option></Select></Field>
          </div></div>

          <div><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-extrabold text-slate-900">الأيقونات والمميزات داخل السلايد</h3><p className="mt-1 text-xs text-slate-500">اختار الأيقونة، النص، مكانها يمين/يسار وأعلى/أسفل لكل سلايد.</p></div></div><div className="grid gap-3 lg:grid-cols-2">{slide.benefits.map((benefit, bi) => <div key={benefit.id} className="rounded-2xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-slate-400">ميزة {bi + 1}</span><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={benefit.enabled} onChange={(e) => updateBenefit(slide.id, benefit.id, { enabled: e.target.checked })}/> تظهر</label></div><div className="grid gap-3 sm:grid-cols-[150px_1fr]">
            <Field label="الأيقونة"><Select value={ICON_NAMES.has(benefit.icon) ? benefit.icon : "ShieldCheck"} onChange={(icon) => updateBenefit(slide.id, benefit.id, { icon })}>{ICONS.map(([name,label]) => <option key={name} value={name}>{label} — {name}</option>)}</Select></Field>
            <div className="space-y-3"><LangFields value={benefit.title} onChange={(title) => updateBenefit(slide.id, benefit.id, { title })} arLabel="العنوان" enLabel="Title" /><LangFields value={benefit.description} onChange={(description) => updateBenefit(slide.id, benefit.id, { description })} arLabel="الوصف" enLabel="Description" /></div>
          </div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="الجانب"><Select value={benefit.side} onChange={(side) => updateBenefit(slide.id, benefit.id, { side: side as HeroBenefitConfig["side"] })}><option value="left">يسار</option><option value="right">يمين</option></Select></Field><Field label="الارتفاع"><Select value={benefit.vertical} onChange={(vertical) => updateBenefit(slide.id, benefit.id, { vertical: vertical as HeroBenefitConfig["vertical"] })}><option value="top">أعلى</option><option value="bottom">أسفل</option></Select></Field></div></div>)}</div></div>
        </CardContent>}
      </Card>)}
    </div>
  </section>;
}
