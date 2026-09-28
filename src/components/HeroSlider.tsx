import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Gem, Settings2, ShieldCheck, Truck } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import { useLang, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  label: TKey;
  title: TKey;
  sub: TKey;
  to: string;
};

const slides: Slide[] = [
  {
    image: hero1,
    label: "hero.1.label",
    title: "hero.1.title",
    sub: "hero.1.sub",
    to: "cases",
  },
  {
    image: hero2,
    label: "hero.2.label",
    title: "hero.2.title",
    sub: "hero.2.sub",
    to: "chargers",
  },
  {
    image: hero3,
    label: "hero.3.label",
    title: "hero.3.title",
    sub: "hero.3.sub",
    to: "wireless-charging",
  },
];

/*
 * مهم:
 * أماكن الـIcons لم يتم تغييرها.
 *
 * السهم الآن داخل نفس الـcontainer الخاص بالـIcon،
 * لذلك الـIcon والسهم يتحركان معًا دائمًا.
 */
const benefits = [
  {
    icon: ShieldCheck,
    t: "hero.b4.t" as TKey,
    s: "hero.b4.s" as TKey,
    side: "left",
    arrowDirection: "from-right",
    position: { left: "7%", top: "26.2%" },
  },
  {
    icon: Settings2,
    t: "hero.b5.t" as TKey,
    s: "hero.b5.s" as TKey,
    side: "left",
    arrowDirection: "from-right",
    position: { left: "3.2%", top: "53.5%" },
  },
  {
    icon: Gem,
    t: "hero.b6.t" as TKey,
    s: "hero.b6.s" as TKey,
    side: "right",
    arrowDirection: "from-left",
    position: { right: "7%", top: "26.2%" },
  },
  {
    icon: Truck,
    t: "hero.b1.t" as TKey,
    s: "hero.b1.s" as TKey,
    side: "right",
    arrowDirection: "from-left",
    position: { right: "3.2%", top: "53.5%" },
  },
];

const DURATION = 6500;

function BenefitArrow({
  side,
}: {
  side: "left" | "right";
}) {
  const isLeft = side === "left";

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute hidden h-[120px] w-[160px] lg:block",

        /*
         * السهم يتم وضعه بالنسبة للـIcon نفسه،
         * وليس بالنسبة للـHero كله.
         */
        isLeft
          ? "right-[-80px] top-[-px]"
          : "left-[-80px] top-[-px]",
      )}
      viewBox="0 0 128 92"
      fill="none"
    >
      <path
        d={
          isLeft
            ? "M8 10C43 17 71 34 99 72"
            : "M120 10C85 17 57 34 29 72"
        }
        stroke="#a779ef"
        strokeOpacity="0.75"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d={
          isLeft
            ? "M91 65L100 73L96 61"
            : "M37 65L28 73L32 61"
        }
        stroke="#a779ef"
        strokeOpacity="0.75"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroSlider() {
  const { t, dir } = useLang();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      DURATION,
    );

    return () => clearInterval(id);
  }, []);

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const slide = slides[index];

  return (
    <section className="relative w-full overflow-hidden bg-white text-[#17134f]">
      <div className="relative mx-auto hidden w-full max-w-[1667px] aspect-[1667/943] min-h-[620px] sm:min-h-0 lg:block">

        {/* Hero images */}
        {slides.map((s, i) => (
          <img
            key={s.to}
            src={s.image}
            alt=""
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1000ms] ease-out",
              i === index
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          />
        ))}

        <div key={index} className="absolute inset-0">

          {/* Top centered copy */}
          <div
            className="absolute left-1/2 top-[6.2%] w-[64%] -translate-x-1/2 text-center"
            dir="rtl"
          >
            <div className="hero-reference-label mx-auto flex items-center justify-center gap-[18px] text-[clamp(11px,1.05vw,18px)] font-semibold leading-none text-[#432493]">
              <span className="h-[2px] w-[clamp(28px,3vw,49px)] rounded-full bg-[#7135d5]" />

              <span>{t(slide.label)}</span>

              <span className="h-[2px] w-[clamp(28px,3vw,49px)] rounded-full bg-[#7135d5]" />
            </div>

            <h1 className="mx-auto mt-[2.9%] max-w-[1100px] text-[clamp(32px,4.25vw,71px)] font-black leading-[1.16] tracking-[-0.045em] text-[#17134f]">
              {t(slide.title)}
            </h1>

            <p className="mx-auto mt-[1.1%] max-w-[850px] text-[clamp(12px,1.12vw,19px)] font-medium leading-[1.8] text-[#655d91]">
              {t(slide.sub)}
            </p>

            <div
              className="mt-[2.4%] flex items-center justify-center gap-[14px]"
              dir="rtl"
            >
              <Link
                to="/category/$slug"
                params={{ slug: slide.to }}
                className="inline-flex h-[clamp(42px,4.1vw,68px)] min-w-[clamp(150px,12.7vw,212px)] items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#4f1fc4] via-[#7429ca] to-[#be42ce] px-[clamp(18px,1.7vw,30px)] text-[clamp(12px,1.05vw,18px)] font-bold text-white shadow-[0_13px_35px_rgba(117,45,202,.25)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t("hero.cta")}

                <Arrow className="h-[clamp(15px,1.2vw,20px)] w-[clamp(15px,1.2vw,20px)]" />
              </Link>

              <Link
                to="/categories"
                className="inline-flex h-[clamp(42px,4.1vw,68px)] min-w-[clamp(150px,12.7vw,212px)] items-center justify-center rounded-full border-[1.5px] border-[#9b5de0] bg-white/55 px-[clamp(18px,1.7vw,30px)] text-[clamp(12px,1.05vw,18px)] font-bold text-[#6830c5] shadow-[0_8px_25px_rgba(106,49,180,.08)] backdrop-blur-[2px] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {t("hero.cta2")}
              </Link>
            </div>
          </div>

          {/* =========================================================
              FOUR ICONS
              كل سهم موجود داخل نفس الـcontainer بتاع الـIcon.
              بالتالي السهم مربوط بالـIcon نفسه 100%.
             ========================================================= */}

          {benefits.map((b, i) => {
            const Icon = b.icon;

            return (
              <div
                key={b.t}
                className="hero-reference-benefit absolute hidden w-[16%] text-center lg:block"
                style={{
                  ...b.position,
                  animationDelay: `${140 + i * 90}ms`,
                }}
                dir="rtl"
              >
                {/* Icon + Arrow container */}
                <div className="relative mx-auto w-fit">

                  {/* Arrow is anchored directly to this icon */}
                  <BenefitArrow
                    side={b.side as "left" | "right"}
                  />

                  {/* Icon */}
                  <span className="relative z-10 grid h-[clamp(50px,4.25vw,72px)] w-[clamp(50px,4.25vw,72px)] place-items-center rounded-full bg-[rgba(212,194,255,.62)] text-[#4820ae] shadow-[0_8px_24px_rgba(113,53,213,.08)] backdrop-blur-[2px]">
                    <Icon className="h-[clamp(25px,1.75vw,31px)] w-[clamp(25px,1.75vw,31px)] stroke-[2]" />
                  </span>
                </div>

                {/* Title */}
                <span className="mt-[7%] block text-[clamp(13px,1.15vw,19px)] font-bold leading-[1.35] text-[#17134f]">
                  {t(b.t)}
                </span>

                {/* Description */}
                <span className="mx-auto mt-[1.5%] block max-w-[190px] text-[clamp(10px,.88vw,15px)] font-medium leading-[1.65] text-[#665e90]">
                  {t(b.s)}
                </span>
              </div>
            );
          })}

          {/* Slider indicators */}
          <div className="absolute bottom-[7.5%] left-1/2 flex -translate-x-1/2 items-center gap-[12px]">
            {slides.map((s, i) => (
              <button
                key={s.to}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${t("slider.slide")} ${i + 1}`}
                className={cn(
                  "h-[6px] rounded-full transition-all duration-500",
                  i === index
                    ? "w-[74px] bg-[#7135d5] shadow-[0_0_14px_rgba(113,53,213,.25)]"
                    : "w-[34px] bg-[#d5cdea] hover:bg-[#bcb0d9]",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: نفس تكوين Hero الديسكتوب داخل السلايدر نفسه، مع مقاسات متجاوبة */}
      <div className="lg:hidden relative mx-auto w-full aspect-[1/1.05] min-h-[430px] overflow-hidden bg-white">
        {slides.map((s, i) => (
          <img
            key={`mobile-image-${s.to}`}
            src={s.image}
            alt=""
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1000ms] ease-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />
        ))}
        <div key={`mobile-${index}`} className="absolute inset-0" dir="rtl">
          <div className="absolute inset-x-[5%] top-[5%] text-center">
            <div className="mx-auto flex items-center justify-center gap-2 text-[9px] font-semibold text-[#432493]">
              <span className="h-px w-6 rounded-full bg-[#7135d5]" />
              <span>{t(slide.label)}</span>
              <span className="h-px w-6 rounded-full bg-[#7135d5]" />
            </div>
            <h1 className="mx-auto mt-2 max-w-[88%] text-[clamp(21px,7vw,34px)] font-black leading-[1.12] tracking-[-0.04em] text-[#17134f]">
              {t(slide.title)}
            </h1>
            <p className="mx-auto mt-1.5 max-w-[82%] text-[10px] font-medium leading-5 text-[#655d91]">
              {t(slide.sub)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Link
                to="/category/$slug"
                params={{ slug: slide.to }}
                className="inline-flex h-9 min-w-[112px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-l from-[#4f1fc4] via-[#7429ca] to-[#be42ce] px-3 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(117,45,202,.22)]"
              >
                {t("hero.cta")}<Arrow className="h-3 w-3" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex h-9 min-w-[112px] items-center justify-center rounded-full border border-[#9b5de0] bg-white/65 px-3 text-[10px] font-bold text-[#6830c5] backdrop-blur-sm"
              >
                {t("hero.cta2")}
              </Link>
            </div>
          </div>

          {benefits.map((b, i) => {
            const Icon = b.icon;
            const positions = [
              { left: "4%", top: "50%" },
              { left: "4%", bottom: "9%" },
              { right: "4%", top: "50%" },
              { right: "4%", bottom: "9%" },
            ];
            const pos = positions[i];
            return (
              <div
                key={`mobile-benefit-${b.t}`}
                className="absolute w-[25%] text-center"
                style={pos}
              >
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[rgba(212,194,255,.72)] text-[#4820ae] shadow-[0_6px_18px_rgba(113,53,213,.12)] backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-1 block text-[9px] font-bold leading-[1.3] text-[#17134f]">{t(b.t)}</span>
                <span className="mx-auto mt-0.5 block max-w-[110px] text-[7px] font-medium leading-[1.4] text-[#665e90]">{t(b.s)}</span>
              </div>
            );
          })}

          <div className="absolute bottom-[3.5%] left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={`mobile-dot-${s.to}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${t("slider.slide")} ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index ? "w-10 bg-[#7135d5]" : "w-5 bg-[#d5cdea]",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}