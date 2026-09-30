import { supabase } from "@/lib/supabase";

export type HeroLangText = { ar: string; en: string };
export type HeroBenefitSide = "left" | "right";
export type HeroContentPosition = "top" | "center" | "bottom";
export type HeroTextAlign = "left" | "center" | "right";
export type HeroTextColorMode = "solid" | "gradient";
export type HeroTextStyle = {
  mode: HeroTextColorMode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  fontSizeAr?: number;
  fontSizeEn?: number;
};

export const defaultHeroTextStyle = (color = "#17134f"): HeroTextStyle => ({
  mode: "solid",
  color,
  gradientFrom: color,
  gradientTo: color,
  gradientAngle: 90,
});
export type HeroMobileVertical = "top" | "center" | "bottom";
export type HeroMobileSide = "left" | "right";

export type HeroSpacingConfig = {
  contentPaddingTop: number;
  contentPaddingRight: number;
  contentPaddingBottom: number;
  contentPaddingLeft: number;
  labelTitle: number;
  titleDescription: number;
  descriptionButtons: number;
  buttonGap: number;
  benefitIconTitle: number;
  benefitTitleDescription: number;
};

export function defaultHeroSpacingConfig(): HeroSpacingConfig {
  return {
    contentPaddingTop: 0,
    contentPaddingRight: 0,
    contentPaddingBottom: 0,
    contentPaddingLeft: 0,
    labelTitle: 18,
    titleDescription: 12,
    descriptionButtons: 26,
    buttonGap: 14,
    benefitIconTitle: 18,
    benefitTitleDescription: 7,
  };
}

export type HeroTextStyles = {
  label: HeroTextStyle;
  title: HeroTextStyle;
  description: HeroTextStyle;
  cta: HeroTextStyle;
  cta2: HeroTextStyle;
};

export function defaultHeroTextStyles(): HeroTextStyles {
  return {
    label: defaultHeroTextStyle("#432493"),
    title: defaultHeroTextStyle("#17134f"),
    description: defaultHeroTextStyle("#655d91"),
    cta: defaultHeroTextStyle("#ffffff"),
    cta2: defaultHeroTextStyle("#6830c5"),
  };
}

export type HeroBenefitTextStyles = {
  title: HeroTextStyle;
  description: HeroTextStyle;
};

export function defaultHeroBenefitTextStyles(): HeroBenefitTextStyles {
  return {
    title: defaultHeroTextStyle("#17134f"),
    description: defaultHeroTextStyle("#665e90"),
  };
}

export type HeroMobileBenefitConfig = {
  enabled: boolean;
  side: HeroMobileSide;
  vertical: HeroMobileVertical;
  offsetX: number;
  offsetY: number;
  width: number;
  iconSize: number;
  titleSize: number;
  descriptionSize: number;
  textStyles?: HeroBenefitTextStyles;
  spacing?: HeroSpacingConfig;
};

export type HeroMobileConfig = {
  imageFit: "contain" | "cover";
  imagePosition: string;
  overlay: number;
  contentVertical: HeroMobileVertical;
  contentHorizontal: number;
  contentWidth: number;
  textAlign: HeroTextAlign;
  labelSize: number;
  titleSize: number;
  descriptionSize: number;
  contentGap: number;
  buttonScale: number;
  showLabel: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showButtons: boolean;
  showBenefits: boolean;
  textStyles?: HeroTextStyles;
  spacing?: HeroSpacingConfig;
};

export function defaultHeroMobileConfig(): HeroMobileConfig {
  return {
    imageFit: "contain",
    imagePosition: "center center",
    overlay: 0,
    contentVertical: "center",
    contentHorizontal: 50,
    contentWidth: 86,
    textAlign: "center",
    labelSize: 9,
    titleSize: 7,
    descriptionSize: 10,
    contentGap: 4,
    buttonScale: 1,
    showLabel: true,
    showTitle: true,
    showDescription: true,
    showButtons: true,
    showBenefits: true,
    textStyles: defaultHeroTextStyles(),
    spacing: defaultHeroSpacingConfig(),
  };
}

export function defaultHeroMobileBenefitConfig(benefit: Pick<HeroBenefitConfig, "side" | "vertical">): HeroMobileBenefitConfig {
  return {
    enabled: true,
    side: benefit.side,
    vertical: benefit.vertical === "bottom" ? "bottom" : "top",
    offsetX: 2,
    offsetY: 8,
    width: 29,
    iconSize: 40,
    titleSize: 9,
    descriptionSize: 7,
    textStyles: defaultHeroBenefitTextStyles(),
    spacing: defaultHeroSpacingConfig(),
  };
}

export type HeroBenefitConfig = {
  id: string;
  icon: string;
  title: HeroLangText;
  description: HeroLangText;
  side: HeroBenefitSide;
  vertical: "top" | "bottom";
  enabled: boolean;
  textStyles?: HeroBenefitTextStyles;
  spacing?: HeroSpacingConfig;
  mobile?: HeroMobileBenefitConfig;
};

export type HeroSlideConfig = {
  id: string;
  enabled: boolean;
  image: string;
  mobileImage?: string;
  label: HeroLangText;
  title: HeroLangText;
  description: HeroLangText;
  cta: HeroLangText;
  cta2: HeroLangText;
  link: string;
  contentPosition: HeroContentPosition;
  textAlign: HeroTextAlign;
  overlay: number;
  benefits: HeroBenefitConfig[];
  textStyles?: HeroTextStyles;
  spacing?: HeroSpacingConfig;
  mobile?: HeroMobileConfig;
};

export type HeroMobileHeaderConfig = {
  heroLogo: string;
  scrolledLogo: string;
};

export type HeroConfig = {
  version: 1;
  duration: number;
  mobileHeader: HeroMobileHeaderConfig;
  slides: HeroSlideConfig[];
};

const BUCKET = "product-images";
const CONFIG_PATH = "hero-config/hero.json";

export function normalizeHeroConfig(config: HeroConfig): HeroConfig {
  return {
    ...config,
    mobileHeader: {
      heroLogo: "/Asset%202.png",
      scrolledLogo: "/Asset%202.png",
      ...(config.mobileHeader || {}),
    },
    slides: config.slides.map((slide) => ({
      ...slide,
      mobileImage: slide.mobileImage || slide.image,
      textStyles: { ...defaultHeroTextStyles(), ...(slide.textStyles || {}) },
      spacing: { ...defaultHeroSpacingConfig(), ...(slide.spacing || {}) },
      mobile: { ...defaultHeroMobileConfig(), ...(slide.mobile || {}), textStyles: { ...defaultHeroTextStyles(), ...(slide.mobile?.textStyles || {}) }, spacing: { ...defaultHeroSpacingConfig(), ...(slide.mobile?.spacing || {}) } },
      benefits: (slide.benefits || []).map((benefit) => ({
        ...benefit,
        textStyles: { ...defaultHeroBenefitTextStyles(), ...(benefit.textStyles || {}) },
        spacing: { ...defaultHeroSpacingConfig(), ...(benefit.spacing || {}) },
        mobile: { ...defaultHeroMobileBenefitConfig(benefit), ...(benefit.mobile || {}), textStyles: { ...defaultHeroBenefitTextStyles(), ...(benefit.mobile?.textStyles || {}) }, spacing: { ...defaultHeroSpacingConfig(), ...(benefit.mobile?.spacing || {}) } },
      })),
    })),
  };
}

export async function loadHeroConfig(): Promise<HeroConfig | null> {
  const url = supabase.storage.from(BUCKET).getPublicUrl(CONFIG_PATH).data.publicUrl;
  const cacheBuster = `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

  try {
    const response = await fetch(cacheBuster, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.version !== 1 || !Array.isArray(data.slides)) return null;
    return normalizeHeroConfig(data as HeroConfig);
  } catch {
    return null;
  }
}

export async function saveHeroConfig(config: HeroConfig) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const { error } = await supabase.storage.from(BUCKET).upload(CONFIG_PATH, blob, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw error;
}

export async function uploadHeroImage(file: File, slideId: string) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `hero-slides/${slideId}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw error;
  return {
    path,
    url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  };
}
