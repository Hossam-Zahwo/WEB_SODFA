import { supabase } from "@/lib/supabase";

export type HeroLangText = { ar: string; en: string };
export type HeroBenefitSide = "left" | "right";
export type HeroContentPosition = "top" | "center" | "bottom";
export type HeroTextAlign = "left" | "center" | "right";
export type HeroMobileVertical = "top" | "center" | "bottom";
export type HeroMobileSide = "left" | "right";

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
      mobile: { ...defaultHeroMobileConfig(), ...(slide.mobile || {}) },
      benefits: (slide.benefits || []).map((benefit) => ({
        ...benefit,
        mobile: { ...defaultHeroMobileBenefitConfig(benefit), ...(benefit.mobile || {}) },
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
