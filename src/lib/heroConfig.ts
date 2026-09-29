import { supabase } from "@/lib/supabase";

export type HeroLangText = { ar: string; en: string };
export type HeroBenefitSide = "left" | "right";
export type HeroContentPosition = "top" | "center" | "bottom";
export type HeroTextAlign = "left" | "center" | "right";

export type HeroBenefitConfig = {
  id: string;
  icon: string;
  title: HeroLangText;
  description: HeroLangText;
  side: HeroBenefitSide;
  vertical: "top" | "bottom";
  enabled: boolean;
};

export type HeroSlideConfig = {
  id: string;
  enabled: boolean;
  image: string;
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
};

export type HeroConfig = {
  version: 1;
  duration: number;
  slides: HeroSlideConfig[];
};

const BUCKET = "product-images";
const CONFIG_PATH = "hero-config/hero.json";

export async function loadHeroConfig(): Promise<HeroConfig | null> {
  const url = supabase.storage.from(BUCKET).getPublicUrl(CONFIG_PATH).data.publicUrl;
  const cacheBuster = `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

  try {
    const response = await fetch(cacheBuster, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.version !== 1 || !Array.isArray(data.slides)) return null;
    return data as HeroConfig;
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
