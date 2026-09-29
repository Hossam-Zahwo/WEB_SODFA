import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Copy, GripVertical, ImagePlus,
  LayoutTemplate, MoveDown, Plus, Save, Settings2, Trash2, Upload, Smartphone as SmartphoneIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultHeroBenefitTextStyles, defaultHeroMobileBenefitConfig, defaultHeroMobileConfig, defaultHeroSpacingConfig, defaultHeroTextStyles, saveHeroConfig, uploadHeroImage, type HeroBenefitTextStyles, type HeroBenefitConfig, type HeroConfig, type HeroSlideConfig, type HeroTextStyle, type HeroTextStyles, type HeroSpacingConfig } from "@/lib/heroConfig";
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
  const baseBenefits = benefits.map((b, i): HeroBenefitConfig => ({
    id: `benefit-${i + 1}`,
    icon: b.icon,
    title: copy(b.ar, b.en),
    description: copy(b.ars, b.ens),
    side: b.side as "left" | "right",
    vertical: b.vertical as "top" | "bottom",
    enabled: true,
    spacing: defaultHeroSpacingConfig(),
    mobile: { ...defaultHeroMobileBenefitConfig({ side: b.side as "left" | "right", vertical: b.vertical as "top" | "bottom" }), enabled: i < 3, spacing: defaultHeroSpacingConfig() },
  }));
  const data = [
    ["1", images[0] || "", "جراب يكمّل ستايلك", "A case that completes your style", "حماية شيك… تليق بموبايلك", "Smart protection, made for your phone", "جرابات مختارة بعناية، تجمع بين الشكل الحلو والحماية اللي تقدر تعتمد عليها كل يوم.", "Carefully selected cases that bring together a clean look and protection you can count on every day.", "شوف الجرابات", "Shop Cases", "cases"],
    ["2", images[1] || "", "اشحن وكمّل يومك", "Charge and keep going", "شحن سريع… من غير ما يعطّل يومك", "Fast charging, without slowing you down", "شواحن وكابلات عملية لكل مشاويرك، عشان تفضل جاهز من أول اليوم لآخره.", "Practical chargers and cables for every part of your day, so you stay ready from morning to night.", "شوف الشواحن", "Shop Chargers", "chargers"],
    ["3", images[2] || "", "الشحن على السريع", "Wireless, made easy", "حط موبايلك… وسيب الباقي علينا", "Drop your phone. Let charging do the rest.", "شحن لاسلكي عملي يخلي مكانك أرتب وروتينك أسهل، من غير كابلات متشابكة.", "Practical wireless charging that keeps your setup cleaner and your routine easier, without tangled cables.", "شوف الشحن اللاسلكي", "Shop Wireless", "wireless-charging"],
  ];
  return {
    version: 1,
    duration: 6500,
    mobileHeader: { heroLogo: "/Asset%202.png", scrolledLogo: "/Asset%202.png" },
    slides: data.map((d, i) => ({
      id: `slide-${d[0]}`,
      enabled: true,
      image: d[1],
      mobileImage: d[1],
      label: copy(d[2], d[3]),
      title: copy(d[4], d[5]),
      description: copy(d[6], d[7]),
      cta: copy(d[8], d[9]),
      cta2: copy("عرض كل المنتجات", "View all products"),
      link: d[10],
      contentPosition: "top",
      textAlign: "center",
      overlay: 0,
      spacing: defaultHeroSpacingConfig(),
      mobile: {
        ...defaultHeroMobileConfig(),
        imageFit: "contain",
        imagePosition: "center center",
        contentVertical: "top",
        contentHorizontal: 50,
        contentWidth: 88,
        titleSize: 8,
        descriptionSize: 9.5,
        contentGap: 4,
      },
      benefits: baseBenefits.map((b) => ({ ...structuredClone(b), id: `${b.id}-${i}`, mobile: structuredClone(b.mobile) })),
    })),
  };
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("space-y-1 text-sm", className)}><span className="block font-semibold text-white">{label}</span>{children}</label>;
}

function LangFields({ value, onChange, arLabel, enLabel, multiline = false }: { value: { ar: string; en: string }; onChange: (next: { ar: string; en: string }) => void; arLabel: string; enLabel: string; multiline?: boolean }) {
  const common = "w-full border-slate-200 bg-white text-slate-900";
  return <div className="grid gap-2 sm:grid-cols-2">
    <Field label={`${arLabel} — عربي`}>{multiline ? <textarea rows={3} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={`${common} rounded-xl border p-3 outline-none focus:border-violet-400`} /> : <Input value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={common} />}</Field>
    <Field label={`${enLabel} — English`}>{multiline ? <textarea rows={3} dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={`${common} rounded-xl border p-3 outline-none focus:border-violet-400`} /> : <Input dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={common} />}</Field>
  </div>;
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400">{children}</select>;
}

function TextStyleEditor({ label, value, onChange }: { label: string; value: HeroTextStyle; onChange: (next: HeroTextStyle) => void }) {
  const v = { ...value };
  const update = (patch: Partial<HeroTextStyle>) => onChange({ ...v, ...patch });
  return <div className="rounded-xl border border-violet-100 bg-slate-900/95 p-3">
    <div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-bold text-white">{label}</span><Select value={v.mode} onChange={(mode) => update({ mode: mode as HeroTextStyle["mode"] })}><option value="solid">لون ثابت</option><option value="gradient">Gradient</option></Select></div>
    {v.mode === "solid" ? <div className="grid grid-cols-[48px_1fr] items-center gap-2"><input type="color" value={v.color} onChange={(e) => update({ color: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"/><Input value={v.color} onChange={(e) => update({ color: e.target.value })} className="border-white/15 bg-white text-slate-900" placeholder="#ffffff"/></div> : <div className="grid gap-2 sm:grid-cols-3">
      <div className="grid grid-cols-[42px_1fr] items-center gap-2"><input type="color" value={v.gradientFrom} onChange={(e) => update({ gradientFrom: e.target.value })} className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"/><Input value={v.gradientFrom} onChange={(e) => update({ gradientFrom: e.target.value })} className="border-white/15 bg-white text-slate-900" placeholder="#ffffff"/></div>
      <div className="grid grid-cols-[42px_1fr] items-center gap-2"><input type="color" value={v.gradientTo} onChange={(e) => update({ gradientTo: e.target.value })} className="h-10 w-10 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"/><Input value={v.gradientTo} onChange={(e) => update({ gradientTo: e.target.value })} className="border-white/15 bg-white text-slate-900" placeholder="#7c3aed"/></div>
      <Input type="number" min="0" max="360" value={v.gradientAngle} onChange={(e) => update({ gradientAngle: Number(e.target.value || 90) })} className="border-white/15 bg-white text-slate-900" placeholder="Angle"/>
    </div>}
  </div>;
}

function TextStylesEditor({ value, onChange, title = "ألوان النصوص" }: { value: HeroTextStyles; onChange: (next: HeroTextStyles) => void; title?: string }) {
  const styles = { ...defaultHeroTextStyles(), ...(value || {}) };
  const set = (key: keyof HeroTextStyles, next: HeroTextStyle) => onChange({ ...styles, [key]: next });
  return <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
    <div className="mb-3 font-extrabold text-slate-900">{title}</div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <TextStyleEditor label="Label" value={styles.label} onChange={(v) => set("label", v)} />
      <TextStyleEditor label="العنوان / Title" value={styles.title} onChange={(v) => set("title", v)} />
      <TextStyleEditor label="الوصف / Description" value={styles.description} onChange={(v) => set("description", v)} />
      <TextStyleEditor label="الزر الأساسي / Primary" value={styles.cta} onChange={(v) => set("cta", v)} />
      <TextStyleEditor label="الزر الثاني / Secondary" value={styles.cta2} onChange={(v) => set("cta2", v)} />
    </div>
  </div>;
}

function SpacingEditor({ value, onChange, title = "المسافات والـPadding" }: { value: HeroSpacingConfig; onChange: (next: HeroSpacingConfig) => void; title?: string }) {
  const v = { ...defaultHeroSpacingConfig(), ...(value || {}) };
  const set = (key: keyof HeroSpacingConfig, raw: string) => onChange({ ...v, [key]: Number(raw || 0) });
  const fields: Array<[keyof HeroSpacingConfig, string, number]> = [
    ["contentPaddingTop", "Padding أعلى المحتوى", 100], ["contentPaddingRight", "Padding يمين المحتوى", 100],
    ["contentPaddingBottom", "Padding أسفل المحتوى", 100], ["contentPaddingLeft", "Padding يسار المحتوى", 100],
    ["labelTitle", "المسافة Label ↔ العنوان", 100], ["titleDescription", "المسافة العنوان ↔ الوصف", 100],
    ["descriptionButtons", "المسافة الوصف ↔ الأزرار", 100], ["buttonGap", "المسافة بين الأزرار", 100],
    ["benefitIconTitle", "المسافة الأيقونة ↔ عنوان الميزة", 100], ["benefitTitleDescription", "المسافة عنوان الميزة ↔ الوصف", 100],
  ];
  return <div className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
    <div className="mb-3 font-extrabold text-slate-900">{title}</div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map(([key, label, max]) => <Field key={key} label={`${label} (px)`}>
        <Input type="number" min="0" max={max} step="1" value={v[key]} onChange={(e) => set(key, e.target.value)} />
      </Field>)}
    </div>
  </div>;
}

function BenefitTextStylesEditor({ value, onChange, title }: { value: HeroBenefitTextStyles; onChange: (next: HeroBenefitTextStyles) => void; title: string }) {
  const styles = { ...defaultHeroBenefitTextStyles(), ...(value || {}) };
  return <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/70 p-3">
    <div className="mb-2 text-xs font-extrabold text-slate-900">{title}</div>
    <div className="grid gap-2 sm:grid-cols-2">
      <TextStyleEditor label="عنوان الميزة" value={styles.title} onChange={(v) => onChange({ ...styles, title: v })} />
      <TextStyleEditor label="وصف الميزة" value={styles.description} onChange={(v) => onChange({ ...styles, description: v })} />
    </div>
  </div>;
}

export function HeroSliderAdmin({ initialImages }: { initialImages: string[] }) {
  const [config, setConfig] = useState<HeroConfig>(() => createDefaultHeroConfig(initialImages));
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editorMode, setEditorMode] = useState<"desktop" | "mobile">("mobile");

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
  const updateMobile = (slideId: string, patch: Partial<NonNullable<HeroSlideConfig["mobile"]>>) => setConfig((prev) => ({ ...prev, slides: prev.slides.map((s) => s.id === slideId ? { ...s, mobile: { ...defaultHeroMobileConfig(), ...(s.mobile || {}), ...patch } } : s) }));
  const updateMobileBenefit = (slideId: string, benefitId: string, patch: Partial<NonNullable<HeroBenefitConfig["mobile"]>>) => setConfig((prev) => ({ ...prev, slides: prev.slides.map((s) => s.id === slideId ? { ...s, benefits: s.benefits.map((b) => b.id === benefitId ? { ...b, mobile: { ...defaultHeroMobileBenefitConfig(b), ...(b.mobile || {}), ...patch } } : b) } : s) }));

  const addSlide = () => {
    const base = config.slides[config.slides.length - 1] || createDefaultHeroConfig(initialImages).slides[0];
    const next: HeroSlideConfig = { ...structuredClone(base), id: uid(), enabled: true, image: "", mobileImage: "", mobile: structuredClone(base.mobile || defaultHeroMobileConfig()), label: text("سلايد جديد", "New slide"), title: text("عنوان السلايد", "Slide title"), description: text("وصف السلايد", "Slide description"), cta: text("اكتشف الآن", "Discover now"), cta2: text("عرض الكل", "View all"), link: "categories", benefits: base.benefits.map((b) => ({ ...structuredClone(b), id: uid(), mobile: structuredClone(b.mobile || defaultHeroMobileBenefitConfig(b)) })) };
    setConfig((prev) => ({ ...prev, slides: [...prev.slides, next] }));
    setOpenId(next.id);
  };

  const duplicateSlide = (slide: HeroSlideConfig) => {
    const next: HeroSlideConfig = { ...structuredClone(slide), id: uid(), mobile: structuredClone(slide.mobile || defaultHeroMobileConfig()), benefits: slide.benefits.map((b) => ({ ...structuredClone(b), id: uid(), mobile: structuredClone(b.mobile || defaultHeroMobileBenefitConfig(b)) })) };
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

  const uploadMobileImage = async (slide: HeroSlideConfig, file?: File) => {
    if (!file) return; setUploading(`${slide.id}:mobile`); setError("");
    try { const result = await uploadHeroImage(file, `${slide.id}-mobile`); updateSlide(slide.id, { mobileImage: result.url }); setMessage("تم رفع صورة الموبايل."); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر رفع صورة الموبايل."); }
    finally { setUploading(null); }
  };

  const uploadMobileHeaderLogo = async (slot: "heroLogo" | "scrolledLogo", file?: File) => {
    if (!file) return; setUploading(`header:${slot}`); setError("");
    try {
      const result = await uploadHeroImage(file, `mobile-header-${slot}`);
      setConfig((prev) => ({ ...prev, mobileHeader: { ...prev.mobileHeader, [slot]: result.url } }));
      setMessage(slot === "heroLogo" ? "تم حفظ لوجو الهيرو للموبايل." : "تم حفظ لوجو الهيدر بعد النزول.");
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر رفع اللوجو."); }
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
    <div className="mb-4 grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <Field label="وضع التحكم في الـHero">
          <Select value={editorMode} onChange={(v) => setEditorMode(v as "desktop" | "mobile")}>
            <option value="mobile">📱 الموبايل فقط</option>
            <option value="desktop">🖥️ الديسكتوب فقط</option>
          </Select>
        </Field>
        <p className="mt-2 text-xs leading-5 text-violet-800">التعديل في وضع الموبايل منفصل عن إعدادات الديسكتوب ولا يغيّرها.</p>
      </div>
      <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/70 p-4">
        <div className="mb-3 flex items-center gap-2 font-bold text-slate-900"><SmartphoneIcon size={18}/> لوجو الهيدر على الموبايل</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["heroLogo", "اللوجو أثناء الـHero", config.mobileHeader.heroLogo],
            ["scrolledLogo", "اللوجو بعد النزول", config.mobileHeader.scrolledLogo],
          ].map(([slot, label, url]) => (
            <div key={slot} className="rounded-xl border border-fuchsia-100 bg-white p-3">
              <div className="mb-2 text-xs font-bold text-slate-700">{label}</div>
              <div className="mb-2 flex h-12 items-center justify-center rounded-lg bg-slate-50 p-2">{url ? <img src={url} alt="" className="max-h-8 max-w-[150px] object-contain"/> : <ImagePlus size={20} className="text-slate-400"/>}</div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white">
                <Upload size={14}/> رفع صورة
                <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => void uploadMobileHeaderLogo(slot as "heroLogo" | "scrolledLogo", e.target.files?.[0])}/>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
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
              <TextStylesEditor title={editorMode === "mobile" ? "ألوان نصوص الموبايل" : "ألوان نصوص الديسكتوب"} value={{ ...defaultHeroTextStyles(), ...((editorMode === "mobile" ? slide.mobile?.textStyles : slide.textStyles) || {}) }} onChange={(textStyles) => editorMode === "mobile" ? updateMobile(slide.id, { textStyles }) : updateSlide(slide.id, { textStyles })} />
              <SpacingEditor title={editorMode === "mobile" ? "المسافات والـPadding — الموبايل" : "المسافات والـPadding — الديسكتوب"} value={{ ...defaultHeroSpacingConfig(), ...((editorMode === "mobile" ? slide.mobile?.spacing : slide.spacing) || {}) }} onChange={(spacing) => editorMode === "mobile" ? updateMobile(slide.id, { spacing }) : updateSlide(slide.id, { spacing })} />
              <div className="grid gap-3 sm:grid-cols-2"><LangFields value={slide.cta} onChange={(cta) => updateSlide(slide.id, { cta })} arLabel="الزر الأساسي" enLabel="Primary CTA" /><LangFields value={slide.cta2} onChange={(cta2) => updateSlide(slide.id, { cta2 })} arLabel="الزر الثاني" enLabel="Secondary CTA" /></div>
              <Field label="الرابط عند الضغط على الزر الأساسي"><Input value={slide.link} onChange={(e) => updateSlide(slide.id, { link: e.target.value.replace(/^\//, "") })} placeholder="categories أو category/cases" className="border-slate-200" /></Field>
            </div>
          </div>

          {editorMode === "desktop" && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="mb-4 flex items-center gap-2 font-bold text-slate-900"><MoveDown size={18}/>توزيع محتوى السلايد — الديسكتوب</div><div className="grid gap-4 sm:grid-cols-4">
            <Field label="مكان المحتوى رأسيًا"><Select value={slide.contentPosition} onChange={(v) => updateSlide(slide.id, { contentPosition: v as HeroSlideConfig["contentPosition"] })}><option value="top">أعلى</option><option value="center">منتصف</option><option value="bottom">أسفل</option></Select></Field>
            <Field label="محاذاة النص"><Select value={slide.textAlign} onChange={(v) => updateSlide(slide.id, { textAlign: v as HeroSlideConfig["textAlign"] })}><option value="center">وسط</option><option value="right">يمين</option><option value="left">يسار</option></Select></Field>
            <Field label="تعتيم الصورة"><div className="flex h-10 items-center gap-2"><input type="range" min="0" max="0.55" step="0.05" value={slide.overlay} onChange={(e) => updateSlide(slide.id, { overlay: Number(e.target.value) })} className="w-full"/><span className="w-10 text-xs">{Math.round(slide.overlay * 100)}%</span></div></Field>
            <Field label="ظهور السلايد"><Select value={slide.enabled ? "true" : "false"} onChange={(v) => updateSlide(slide.id, { enabled: v === "true" })}><option value="true">نشط</option><option value="false">مخفي</option></Select></Field>
          </div></div>}

          {editorMode === "mobile" && <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/60 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 font-bold text-slate-900"><SmartphoneIcon/> إعدادات شاشة الموبايل فقط</div>
            <p className="mb-4 text-xs text-slate-500">الصورة، المقاسات، أماكن النصوص وإظهار كل جزء هنا مستقلة تمامًا عن الديسكتوب.</p>

            <div className="mb-5 grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="rounded-2xl border border-fuchsia-100 bg-white p-3">
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-slate-100">
                  <img src={slide.mobileImage || slide.image} alt="" className="h-full w-full object-contain"/>
                  <label className="absolute inset-x-2 bottom-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-black/75 px-2 py-2 text-xs font-bold text-white backdrop-blur">
                    <Upload size={14}/>{uploading === `${slide.id}:mobile` ? "جاري الرفع..." : "رفع صورة الموبايل"}
                    <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => void uploadMobileImage(slide, e.target.files?.[0])}/>
                  </label>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">يفضل صورة عمودية 9:16. ستظهر كاملة بدون قص.</p>
              </div>

              {(() => { const m = { ...defaultHeroMobileConfig(), ...(slide.mobile || {}) }; return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="طريقة عرض الصورة"><Select value={m.imageFit} onChange={(v) => updateMobile(slide.id, { imageFit: v as "contain" | "cover" })}><option value="contain">كاملة — بدون قص</option><option value="cover">ملء المساحة — قد تقص</option></Select></Field>
                <Field label="موضع الصورة"><Select value={m.imagePosition} onChange={(v) => updateMobile(slide.id, { imagePosition: v })}><option value="center center">منتصف</option><option value="center top">أعلى</option><option value="center bottom">أسفل</option><option value="left center">يسار</option><option value="right center">يمين</option></Select></Field>
                <Field label="محاذاة النص"><Select value={m.textAlign} onChange={(v) => updateMobile(slide.id, { textAlign: v as HeroSlideConfig["textAlign"] })}><option value="center">وسط</option><option value="right">يمين</option><option value="left">يسار</option></Select></Field>
                <Field label="مركز المحتوى أفقيًا (%)"><Input type="number" min="10" max="90" value={m.contentHorizontal} onChange={(e) => updateMobile(slide.id, { contentHorizontal: Math.min(90, Math.max(10, Number(e.target.value || 50))) })}/></Field>
                <Field label="عرض المحتوى (%)"><Input type="number" min="55" max="96" value={m.contentWidth} onChange={(e) => updateMobile(slide.id, { contentWidth: Math.min(96, Math.max(55, Number(e.target.value || 88))) })}/></Field>
                <Field label="حجم الـLabel"><Input type="number" min="6" max="14" step="0.5" value={m.labelSize} onChange={(e) => updateMobile(slide.id, { labelSize: Number(e.target.value || 9) })}/></Field>
                <Field label="حجم العنوان"><Input type="number" min="5" max="12" step="0.25" value={m.titleSize} onChange={(e) => updateMobile(slide.id, { titleSize: Number(e.target.value || 8) })}/></Field>
                <Field label="حجم الوصف"><Input type="number" min="7" max="14" step="0.5" value={m.descriptionSize} onChange={(e) => updateMobile(slide.id, { descriptionSize: Number(e.target.value || 9.5) })}/></Field>
                <Field label="حجم الأزرار"><Input type="number" min="0.75" max="1.3" step="0.05" value={m.buttonScale} onChange={(e) => updateMobile(slide.id, { buttonScale: Number(e.target.value || 1) })}/></Field>
                <Field label="تعتيم الصورة"><div className="flex h-10 items-center gap-2"><input type="range" min="0" max="0.4" step="0.05" value={m.overlay} onChange={(e) => updateMobile(slide.id, { overlay: Number(e.target.value) })} className="w-full"/><span className="w-10 text-xs">{Math.round(m.overlay * 100)}%</span></div></Field>
                <Field label="المسافة قبل الأزرار"><Input type="number" min="1" max="12" step="0.5" value={m.contentGap} onChange={(e) => updateMobile(slide.id, { contentGap: Number(e.target.value || 4) })}/></Field>
                <Field label="مكان المحتوى"><Select value={m.contentVertical} onChange={(v) => updateMobile(slide.id, { contentVertical: v as NonNullable<HeroSlideConfig["mobile"]>["contentVertical"] })}><option value="top">أعلى</option><option value="center">منتصف</option><option value="bottom">أسفل</option></Select></Field>
              </div>; })()}
            </div>

            {(() => { const m = { ...defaultHeroMobileConfig(), ...(slide.mobile || {}) }; return <div className="grid gap-2 sm:grid-cols-5">
              {([["showLabel", "إظهار الـLabel"], ["showTitle", "إظهار العنوان"], ["showDescription", "إظهار الوصف"], ["showButtons", "إظهار الأزرار"], ["showBenefits", "إظهار الأيقونات"]] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-xl border border-fuchsia-100 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                  <input type="checkbox" checked={m[key]} onChange={(e) => updateMobile(slide.id, { [key]: e.target.checked } as Partial<NonNullable<HeroSlideConfig["mobile"]>>)} />
                  {label}
                </label>
              ))}
            </div>; })()}
          </div>}

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900">الأيقونات والمميزات داخل السلايد</h3>
                <p className="mt-1 text-xs text-slate-500">اختار الأيقونة، النص، مكانها يمين/يسار وأعلى/أسفل لكل سلايد.</p>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {slide.benefits.map((benefit, bi) => {
                const m = { ...defaultHeroMobileBenefitConfig(benefit), ...(benefit.mobile || {}) };
                return (
                  <div key={benefit.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">ميزة {bi + 1}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={benefit.enabled} onChange={(e) => updateBenefit(slide.id, benefit.id, { enabled: e.target.checked })}/> ديسكتوب</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={m.enabled} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { enabled: e.target.checked })}/> موبايل</label>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                      <Field label="الأيقونة">
                        <Select value={ICON_NAMES.has(benefit.icon) ? benefit.icon : "ShieldCheck"} onChange={(icon) => updateBenefit(slide.id, benefit.id, { icon })}>
                          {ICONS.map(([name, label]) => <option key={name} value={name}>{label} — {name}</option>)}
                        </Select>
                      </Field>
                      <div className="space-y-3">
                        <LangFields value={benefit.title} onChange={(title) => updateBenefit(slide.id, benefit.id, { title })} arLabel="العنوان" enLabel="Title" />
                        <LangFields value={benefit.description} onChange={(description) => updateBenefit(slide.id, benefit.id, { description })} arLabel="الوصف" enLabel="Description" />
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Field label="الجانب"><Select value={benefit.side} onChange={(side) => updateBenefit(slide.id, benefit.id, { side: side as HeroBenefitConfig["side"] })}><option value="left">يسار</option><option value="right">يمين</option></Select></Field>
                      <Field label="الارتفاع"><Select value={benefit.vertical} onChange={(vertical) => updateBenefit(slide.id, benefit.id, { vertical: vertical as HeroBenefitConfig["vertical"] })}><option value="top">أعلى</option><option value="bottom">أسفل</option></Select></Field>
                    </div>
                    <BenefitTextStylesEditor title="ألوان نصوص الميزة — الديسكتوب" value={{ ...defaultHeroBenefitTextStyles(), ...(benefit.textStyles || {}) }} onChange={(textStyles) => updateBenefit(slide.id, benefit.id, { textStyles })} />
                    <SpacingEditor title="المسافات والـPadding — الميزة على الديسكتوب" value={{ ...defaultHeroSpacingConfig(), ...(benefit.spacing || {}) }} onChange={(spacing) => updateBenefit(slide.id, benefit.id, { spacing })} />
                    <div className="mt-3 rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-3">
                      <div className="mb-3 text-xs font-bold text-fuchsia-900">إعدادات هذه الميزة على الموبايل فقط</div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="الجانب"><Select value={m.side} onChange={(v) => updateMobileBenefit(slide.id, benefit.id, { side: v as "left" | "right" })}><option value="left">يسار</option><option value="right">يمين</option></Select></Field>
                        <Field label="الارتفاع"><Select value={m.vertical} onChange={(v) => updateMobileBenefit(slide.id, benefit.id, { vertical: v as "top" | "center" | "bottom" })}><option value="top">أعلى</option><option value="center">منتصف</option><option value="bottom">أسفل</option></Select></Field>
                        <Field label="إزاحة أفقية %"><Input type="number" min="0" max="15" value={m.offsetX} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { offsetX: Number(e.target.value || 0) })}/></Field>
                        <Field label="إزاحة رأسية %"><Input type="number" min="0" max="20" value={m.offsetY} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { offsetY: Number(e.target.value || 0) })}/></Field>
                        <Field label="عرض الميزة %"><Input type="number" min="18" max="42" value={m.width} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { width: Number(e.target.value || 29) })}/></Field>
                        <Field label="حجم الأيقونة"><Input type="number" min="24" max="64" value={m.iconSize} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { iconSize: Number(e.target.value || 40) })}/></Field>
                        <Field label="حجم عنوان الميزة"><Input type="number" min="6" max="13" step="0.5" value={m.titleSize} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { titleSize: Number(e.target.value || 9) })}/></Field>
                        <Field label="حجم وصف الميزة"><Input type="number" min="5" max="10" step="0.5" value={m.descriptionSize} onChange={(e) => updateMobileBenefit(slide.id, benefit.id, { descriptionSize: Number(e.target.value || 7) })}/></Field>
                      </div>
                      <BenefitTextStylesEditor title="ألوان نصوص الميزة — الموبايل" value={{ ...defaultHeroBenefitTextStyles(), ...(m.textStyles || {}) }} onChange={(textStyles) => updateMobileBenefit(slide.id, benefit.id, { textStyles })} />
                      <SpacingEditor title="المسافات والـPadding — الميزة على الموبايل" value={{ ...defaultHeroSpacingConfig(), ...(m.spacing || {}) }} onChange={(spacing) => updateMobileBenefit(slide.id, benefit.id, { spacing })} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>}
      </Card>)}
    </div>
  </section>;
}
