import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock3, CreditCard, Gem, Gift, Headphones, Heart, PackageCheck, Settings2, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Star, Truck, Zap } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import { useLang } from "@/lib/i18n";
import { defaultHeroBenefitTextStyles, defaultHeroMobileBenefitConfig, defaultHeroMobileConfig, defaultHeroSpacingConfig, defaultHeroTextStyles, loadHeroConfig, type HeroBenefitConfig, type HeroConfig, type HeroSlideConfig, type HeroTextStyle } from "@/lib/heroConfig";
import { cn } from "@/lib/utils";

const iconMap = {
  ShieldCheck, Settings2, Gem, Truck, Sparkles, BadgeCheck, Heart, Star, Zap, Gift,
  ShoppingBag, Headphones, Smartphone, CreditCard, PackageCheck, Clock3,
} as const;

type IconName = keyof typeof iconMap;

const defaultBenefits: HeroBenefitConfig[] = [
  { id: "benefit-1", icon: "ShieldCheck", title: { ar: "حماية تقدر تعتمد عليها", en: "Protection you can trust" }, description: { ar: "جرابات مختارة عشان تحافظ على موبايلك", en: "Cases selected to help protect your phone" }, side: "left", vertical: "top", enabled: true, spacing: defaultHeroSpacingConfig() },
  { id: "benefit-2", icon: "Settings2", title: { ar: "اختيارات على مزاجك", en: "Picked for your style" }, description: { ar: "شكل حلو واستخدام مريح كل يوم", en: "Good looks and everyday comfort" }, side: "left", vertical: "bottom", enabled: true },
  { id: "benefit-3", icon: "Gem", title: { ar: "ستايل يبان", en: "A look that stands out" }, description: { ar: "لمسة مختلفة تكمل شكل موبايلك", en: "A distinctive touch that completes your phone" }, side: "right", vertical: "top", enabled: true, spacing: defaultHeroSpacingConfig() },
  { id: "benefit-4", icon: "Truck", title: { ar: "يوصلك لحد بابك", en: "Delivered to your door" }, description: { ar: "شحن لمختلف المحافظات", en: "Shipping across Egypt" }, side: "right", vertical: "bottom", enabled: true },
];

function fallbackConfig(): HeroConfig {
  return {
    version: 1,
    duration: 6500,
    mobileHeader: { heroLogo: "/Asset%202.png", scrolledLogo: "/Asset%202.png" },
    slides: [
      { id: "slide-1", enabled: true, image: hero1, label: { ar: "جراب يكمّل ستايلك", en: "A case that completes your style" }, title: { ar: "حماية شيك… تليق بموبايلك", en: "Smart protection, made for your phone" }, description: { ar: "جرابات مختارة بعناية، تجمع بين الشكل الحلو والحماية اللي تقدر تعتمد عليها كل يوم.", en: "Carefully selected cases that bring together a clean look and protection you can count on every day." }, cta: { ar: "شوف الجرابات", en: "Shop Cases" }, cta2: { ar: "عرض كل المنتجات", en: "View all products" }, link: "cases", contentPosition: "top", textAlign: "center", overlay: 0, spacing: defaultHeroSpacingConfig(), benefits: defaultBenefits.map((b, bi) => ({ ...b, mobile: { ...defaultHeroMobileBenefitConfig(b), enabled: bi < 3 } })) },
      { id: "slide-2", enabled: true, image: hero2, label: { ar: "اشحن وكمّل يومك", en: "Charge and keep going" }, title: { ar: "شحن سريع… من غير ما يعطّل يومك", en: "Fast charging, without slowing you down" }, description: { ar: "شواحن وكابلات عملية لكل مشاويرك، عشان تفضل جاهز من أول اليوم لآخره.", en: "Practical chargers and cables for every part of your day, so you stay ready from morning to night." }, cta: { ar: "شوف الشواحن", en: "Shop Chargers" }, cta2: { ar: "عرض كل المنتجات", en: "View all products" }, link: "chargers", contentPosition: "top", textAlign: "center", overlay: 0, spacing: defaultHeroSpacingConfig(), benefits: defaultBenefits.map((b, bi) => ({ ...b, mobile: { ...defaultHeroMobileBenefitConfig(b), enabled: bi < 3 } })) },
      { id: "slide-3", enabled: true, image: hero3, label: { ar: "الشحن على السريع", en: "Wireless, made easy" }, title: { ar: "حط موبايلك… وسيب الباقي علينا", en: "Drop your phone. Let charging do the rest." }, description: { ar: "شحن لاسلكي عملي يخلي مكانك أرتب وروتينك أسهل، من غير كابلات متشابكة.", en: "Practical wireless charging that keeps your setup cleaner and your routine easier, without tangled cables." }, cta: { ar: "شوف الشحن اللاسلكي", en: "Shop Wireless" }, cta2: { ar: "عرض كل المنتجات", en: "View all products" }, link: "wireless-charging", contentPosition: "top", textAlign: "center", overlay: 0, spacing: defaultHeroSpacingConfig(), benefits: defaultBenefits.map((b, bi) => ({ ...b, mobile: { ...defaultHeroMobileBenefitConfig(b), enabled: bi < 3 } })) },
    ],
  };
}


function textStyleCss(style: HeroTextStyle) {
  if (style.mode === "gradient") {
    return {
      backgroundImage: `linear-gradient(${style.gradientAngle}deg, ${style.gradientFrom}, ${style.gradientTo})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      WebkitTextFillColor: "transparent",
    } as React.CSSProperties;
  }
  return { color: style.color };
}

function textStyleWithFallback(style: HeroTextStyle | undefined, fallback: string) {
  return style || { mode: "solid", color: fallback, gradientFrom: fallback, gradientTo: fallback, gradientAngle: 90 };
}

function BenefitArrow({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return <svg aria-hidden="true" className={cn("pointer-events-none absolute hidden h-[120px] w-[160px] lg:block", isLeft ? "right-[-80px] top-0" : "left-[-80px] top-0")} viewBox="0 0 128 92" fill="none">
    <path d={isLeft ? "M8 10C43 17 71 34 99 72" : "M120 10C85 17 57 34 29 72"} stroke="#a779ef" strokeOpacity="0.75" strokeWidth="4" strokeLinecap="round" />
    <path d={isLeft ? "M91 65L100 73L96 61" : "M37 65L28 73L32 61"} stroke="#a779ef" strokeOpacity="0.75" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function HeroAction({ to, children, primary, textStyle }: { to: string; children: React.ReactNode; primary?: boolean; textStyle?: HeroTextStyle }) {
  const className = primary
    ? "inline-flex h-[clamp(42px,4.1vw,68px)] min-w-[clamp(150px,12.7vw,212px)] items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#4f1fc4] via-[#7429ca] to-[#be42ce] px-[clamp(18px,1.7vw,30px)] text-[clamp(12px,1.05vw,18px)] font-bold text-white shadow-[0_13px_35px_rgba(117,45,202,.25)] transition-transform duration-300 hover:-translate-y-0.5"
    : "inline-flex h-[clamp(42px,4.1vw,68px)] min-w-[clamp(150px,12.7vw,212px)] items-center justify-center rounded-full border-[1.5px] border-[#9b5de0] bg-white/55 px-[clamp(18px,1.7vw,30px)] text-[clamp(12px,1.05vw,18px)] font-bold text-[#6830c5] shadow-[0_8px_25px_rgba(106,49,180,.08)] backdrop-blur-[2px] transition-transform duration-300 hover:-translate-y-0.5";
  if (to === "categories") return <Link to="/categories" className={className} style={textStyle ? textStyleCss(textStyle) : undefined}>{children}</Link>;
  return <Link to="/category/$slug" params={{ slug: to }} className={className} style={textStyle ? textStyleCss(textStyle) : undefined}>{children}</Link>;
}

function contentPositionClass(position: HeroSlideConfig["contentPosition"]) {
  if (position === "center") return "top-1/2 -translate-y-1/2";
  if (position === "bottom") return "bottom-[8%]";
  return "top-[6.2%]";
}

function benefitDesktopPosition(benefit: HeroBenefitConfig) {
  return benefit.side === "left"
    ? benefit.vertical === "top" ? { left: "7%", top: "26.2%" } : { left: "3.2%", top: "53.5%" }
    : benefit.vertical === "top" ? { right: "7%", top: "26.2%" } : { right: "3.2%", top: "53.5%" };
}

export function HeroSlider() {
  const { lang, dir } = useLang();
  const [config, setConfig] = useState<HeroConfig>(fallbackConfig);
  const [index, setIndex] = useState(0);

  useEffect(() => { void loadHeroConfig().then((saved) => { if (saved?.slides?.length) setConfig(saved); }); }, []);

  const slides = useMemo(() => {
    const enabled = config.slides.filter((slide) => slide.enabled && slide.image);
    return enabled.length ? enabled : fallbackConfig().slides;
  }, [config.slides]);

  useEffect(() => { setIndex((current) => Math.min(current, Math.max(0, slides.length - 1))); }, [slides.length]);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), config.duration || 6500);
    return () => window.clearInterval(id);
  }, [slides.length, config.duration]);

  const slide = slides[index] || slides[0];
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const desktopTextStyles = { ...defaultHeroTextStyles(), ...(slide.textStyles || {}) };
  const desktopSpacing = { ...defaultHeroSpacingConfig(), ...(slide.spacing || {}) };
  const textAlign = slide.textAlign === "right" ? "text-right" : slide.textAlign === "left" ? "text-left" : "text-center";
  const justify = slide.textAlign === "right" ? "justify-end" : slide.textAlign === "left" ? "justify-start" : "justify-center";

  return <section id="sodfa-hero" className="relative w-full overflow-hidden bg-white text-[#17134f]">
    <div className="relative mx-auto hidden w-full max-w-[1667px] aspect-[1667/943] min-h-[620px] sm:min-h-0 lg:block">
      {slides.map((s, i) => <img key={s.id} src={s.image} alt="" aria-hidden={i !== index} loading={i === index ? "eager" : "lazy"} decoding="async" className={cn("absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1000ms] ease-out", i === index ? "opacity-100" : "pointer-events-none opacity-0")} />)}
      {slide.overlay > 0 && <div className="absolute inset-0 bg-white" style={{ opacity: slide.overlay }} />}
      <div key={slide.id} className="absolute inset-0">
        <div className={cn("absolute left-1/2 w-[64%] -translate-x-1/2", contentPositionClass(slide.contentPosition), textAlign)} style={{ paddingTop: desktopSpacing.contentPaddingTop, paddingRight: desktopSpacing.contentPaddingRight, paddingBottom: desktopSpacing.contentPaddingBottom, paddingLeft: desktopSpacing.contentPaddingLeft }} dir="rtl">
          <div className={cn("hero-reference-label mx-auto flex items-center gap-[18px] text-[clamp(11px,1.05vw,18px)] font-semibold leading-none", justify)} style={textStyleCss(textStyleWithFallback(desktopTextStyles.label, "#432493"))}><span className="h-[2px] w-[clamp(28px,3vw,49px)] rounded-full bg-[#7135d5]" /><span>{lang === "ar" ? slide.label.ar : slide.label.en}</span><span className="h-[2px] w-[clamp(28px,3vw,49px)] rounded-full bg-[#7135d5]" /></div>
          <h1 className="mx-auto max-w-[1100px] text-[clamp(32px,4.25vw,71px)] font-black leading-[1.16] tracking-[-0.045em]" style={{ ...textStyleCss(textStyleWithFallback(desktopTextStyles.title, "#17134f")), marginTop: desktopSpacing.labelTitle }}>{lang === "ar" ? slide.title.ar : slide.title.en}</h1>
          <p className="mx-auto max-w-[850px] text-[clamp(12px,1.12vw,19px)] font-medium leading-[1.8]" style={{ ...textStyleCss(textStyleWithFallback(desktopTextStyles.description, "#655d91")), marginTop: desktopSpacing.titleDescription }}>{lang === "ar" ? slide.description.ar : slide.description.en}</p>
          <div className={cn("flex items-center", justify)} style={{ marginTop: desktopSpacing.descriptionButtons, gap: desktopSpacing.buttonGap }} dir="rtl"><HeroAction to={slide.link} primary textStyle={textStyleWithFallback(desktopTextStyles.cta, "#ffffff")}>{lang === "ar" ? slide.cta.ar : slide.cta.en}<Arrow className="h-[clamp(15px,1.2vw,20px)] w-[clamp(15px,1.2vw,20px)]" /></HeroAction><HeroAction to="categories" textStyle={textStyleWithFallback(desktopTextStyles.cta2, "#6830c5")}>{lang === "ar" ? slide.cta2.ar : slide.cta2.en}</HeroAction></div>
        </div>
        {slide.benefits.filter((b) => b.enabled).map((b, i) => {
          const Icon = iconMap[(b.icon as IconName)] || ShieldCheck;
          const pos = benefitDesktopPosition(b);
          const benefitStyles = { ...defaultHeroBenefitTextStyles(), ...(b.textStyles || {}) };
          const benefitSpacing = { ...defaultHeroSpacingConfig(), ...(b.spacing || {}) };
          return <div key={b.id} className="hero-reference-benefit absolute hidden w-[16%] text-center lg:block" style={{ ...pos, animationDelay: `${140 + i * 90}ms` }} dir="rtl">
            <div className="relative mx-auto w-fit"><BenefitArrow side={b.side}/><span className="relative z-10 grid h-[clamp(50px,4.25vw,72px)] w-[clamp(50px,4.25vw,72px)] place-items-center rounded-full bg-[rgba(212,194,255,.62)] text-[#4820ae] shadow-[0_8px_24px_rgba(113,53,213,.08)] backdrop-blur-[2px]"><Icon className="h-[clamp(25px,1.75vw,31px)] w-[clamp(25px,1.75vw,31px)] stroke-[2]" /></span></div>
            <span className="block text-[clamp(13px,1.15vw,19px)] font-bold leading-[1.35]" style={{ ...textStyleCss(textStyleWithFallback(benefitStyles.title, "#17134f")), marginTop: benefitSpacing.benefitIconTitle }}>{lang === "ar" ? b.title.ar : b.title.en}</span><span className="mx-auto block max-w-[190px] text-[clamp(10px,.88vw,15px)] font-medium leading-[1.65]" style={{ ...textStyleCss(textStyleWithFallback(benefitStyles.description, "#665e90")), marginTop: benefitSpacing.benefitTitleDescription }}>{lang === "ar" ? b.description.ar : b.description.en}</span>
          </div>;
        })}
        <div className="absolute bottom-[7.5%] left-1/2 flex -translate-x-1/2 items-center gap-[12px]">{slides.map((s, i) => <button key={s.id} type="button" onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className={cn("h-[6px] rounded-full transition-all duration-500", i === index ? "w-[74px] bg-[#7135d5] shadow-[0_0_14px_rgba(113,53,213,.25)]" : "w-[34px] bg-[#d5cdea] hover:bg-[#bcb0d9]")} />)}</div>
      </div>
    </div>

    {(() => {
      const mobile = { ...defaultHeroMobileConfig(), ...(slide.mobile || {}) };
      const mobileTextStyles = { ...defaultHeroTextStyles(), ...(mobile.textStyles || {}) };
      const mobileSpacing = { ...defaultHeroSpacingConfig(), ...(mobile.spacing || {}) };
      const mobileTextAlign = mobile.textAlign === "right" ? "text-right" : mobile.textAlign === "left" ? "text-left" : "text-center";
      const mobileImage = slide.mobileImage || slide.image;
      const mobileContentPosition = mobile.contentVertical === "center"
        ? { left: `${mobile.contentHorizontal}%`, top: "42%", transform: "translate(-50%, -50%)" }
        : mobile.contentVertical === "bottom"
          ? { left: `${mobile.contentHorizontal}%`, bottom: "18%", transform: "translateX(-50%)" }
          : { left: `${mobile.contentHorizontal}%`, top: "8.5%", transform: "translateX(-50%)" };
      const mobileBenefits = slide.benefits.filter((b) => {
        const m = { ...defaultHeroMobileBenefitConfig(b), ...(b.mobile || {}) };
        return b.enabled && m.enabled;
      });

      return <div
        id="sodfa-mobile-hero"
        className="relative mx-auto min-h-[650px] w-full overflow-hidden bg-[#fbfaff] lg:hidden"
        style={{ aspectRatio: "9 / 16" }}
      >
        {/* The top of the mobile hero carries the soft purple wash; the product area stays crisp. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[48%] bg-gradient-to-b from-[#8e5be8]/20 via-[#c9b5f5]/10 to-transparent" />

        <img
          src={mobileImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-[1000ms] ease-out",
            "opacity-100",
          )}
          style={{ objectFit: mobile.imageFit, objectPosition: mobile.imagePosition }}
        />

        {mobile.overlay > 0 && <div className="absolute inset-0 z-[3] bg-white" style={{ opacity: mobile.overlay }} />}

        <div key={`mobile-${slide.id}`} className="absolute inset-0 z-10" dir="rtl">
          <div
            className={cn("absolute", mobileTextAlign)}
            style={{ ...mobileContentPosition, width: `${mobile.contentWidth}%`, paddingTop: mobileSpacing.contentPaddingTop, paddingRight: mobileSpacing.contentPaddingRight, paddingBottom: mobileSpacing.contentPaddingBottom, paddingLeft: mobileSpacing.contentPaddingLeft }}
          >
            {mobile.showLabel && (
              <div className="mx-auto flex items-center justify-center gap-2 font-semibold" style={{ ...textStyleCss(textStyleWithFallback(mobileTextStyles.label, "#432493")), fontSize: `${mobile.labelSize}px` }}>
                <span className="h-px w-7 rounded-full bg-[#7135d5]" />
                <span>{lang === "ar" ? slide.label.ar : slide.label.en}</span>
                <span className="h-px w-7 rounded-full bg-[#7135d5]" />
              </div>
            )}

            {mobile.showTitle && (
              <h1 className="mx-auto max-w-[95%] font-black leading-[1.12] tracking-[-0.04em]" style={{ ...textStyleCss(textStyleWithFallback(mobileTextStyles.title, "#17134f")), marginTop: mobileSpacing.labelTitle, fontSize: `clamp(28px, ${mobile.titleSize}vw, 43px)` }}>
                {lang === "ar" ? slide.title.ar : slide.title.en}
              </h1>
            )}

            {mobile.showDescription && (
              <p className="mx-auto max-w-[92%] font-medium leading-[1.7]" style={{ ...textStyleCss(textStyleWithFallback(mobileTextStyles.description, "#655d91")), marginTop: mobileSpacing.titleDescription, fontSize: `${mobile.descriptionSize}px` }}>
                {lang === "ar" ? slide.description.ar : slide.description.en}
              </p>
            )}

            {mobile.showButtons && (
              <div className="flex items-center justify-center gap-2.5" style={{ marginTop: mobileSpacing.descriptionButtons + mobile.contentGap, gap: mobileSpacing.buttonGap, transform: `scale(${mobile.buttonScale})` }}>
                <Link
                  to="/category/$slug"
                  params={{ slug: slide.link }}
                  className="inline-flex h-10 min-w-[124px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#4f1fc4] via-[#7429ca] to-[#be42ce] px-4 text-[11px] font-bold shadow-[0_10px_24px_rgba(117,45,202,.24)]" style={textStyleCss(textStyleWithFallback(mobileTextStyles.cta, "#ffffff"))}
                >
                  {lang === "ar" ? slide.cta.ar : slide.cta.en}
                  <Arrow className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex h-10 min-w-[124px] items-center justify-center rounded-full border border-[#9b5de0] bg-white/75 px-4 text-[11px] font-bold shadow-[0_6px_18px_rgba(106,49,180,.06)] backdrop-blur-sm" style={textStyleCss(textStyleWithFallback(mobileTextStyles.cta2, "#6830c5"))}
                >
                  {lang === "ar" ? slide.cta2.ar : slide.cta2.en}
                </Link>
              </div>
            )}
          </div>

          {mobile.showBenefits && (
            <div className="absolute inset-x-[4.5%] bottom-[4.5%] grid grid-cols-3 items-end gap-2">
              {mobileBenefits.map((b) => {
                const Icon = iconMap[(b.icon as IconName)] || ShieldCheck;
                const m = { ...defaultHeroMobileBenefitConfig(b), ...(b.mobile || {}) };
                const benefitStyles = { ...defaultHeroBenefitTextStyles(), ...(m.textStyles || {}) };
                const benefitSpacing = { ...defaultHeroSpacingConfig(), ...(m.spacing || {}) };
                return (
                  <div key={`mobile-benefit-${b.id}`} className="min-w-0 text-center" dir="rtl">
                    <span
                      className="mx-auto grid place-items-center rounded-full bg-[rgba(212,194,255,.78)] text-[#4820ae] shadow-[0_8px_20px_rgba(113,53,213,.12)] backdrop-blur-sm"
                      style={{ width: `${Math.min(m.iconSize, 48)}px`, height: `${Math.min(m.iconSize, 48)}px` }}
                    >
                      <Icon style={{ width: `${Math.min(m.iconSize, 48) * 0.48}px`, height: `${Math.min(m.iconSize, 48) * 0.48}px` }} />
                    </span>
                    <span className="block truncate font-bold leading-[1.25]" style={{ ...textStyleCss(textStyleWithFallback(benefitStyles.title, "#17134f")), marginTop: benefitSpacing.benefitIconTitle, fontSize: `${Math.min(m.titleSize, 9.5)}px` }}>
                      {lang === "ar" ? b.title.ar : b.title.en}
                    </span>
                    <span className="mx-auto block line-clamp-2 max-w-[110px] font-medium leading-[1.35]" style={{ ...textStyleCss(textStyleWithFallback(benefitStyles.description, "#665e90")), marginTop: benefitSpacing.benefitTitleDescription, fontSize: `${Math.min(m.descriptionSize, 7.5)}px` }}>
                      {lang === "ar" ? b.description.ar : b.description.en}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-[1.2%] left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((s, i) => (
              <button key={`mobile-dot-${s.id}`} type="button" onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`} className={cn("h-1.5 rounded-full transition-all duration-500", i === index ? "w-10 bg-[#7135d5]" : "w-5 bg-[#d5cdea]")} />
            ))}
          </div>
        </div>
      </div>;
    })()}
  </section>;
}
