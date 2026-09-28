import { supabase } from "./supabase";

export type DbCategory = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  keywords?: string[];
  created_at?: string;
};

export type DbSeries = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  storage_path?: string | null;
  display_order?: number;
  created_at?: string;
};

export type DbModel = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  storage_path?: string | null;
  series_id?: string | null;
  created_at?: string;
};

export type DbProduct = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  color?: string | null;
  category_id: string | null;
  model_id?: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  best_seller: boolean;
  is_new: boolean;
  barcode?: string | null;
  sku?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DbProductVariant = {
  id: string;
  product_id: string;
  variant_name: string;
  variant_type: string | null;
  variant_value: string | null;
  slug?: string | null;
  category_id?: string | null;
  model_id?: string | null;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  barcode: string | null;
  sku: string | null;
  name_ar: string | null;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number | null;
  old_price: number | null;
  stock: number | null;
  color: string | null;
  final_price: number | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export type DbProductImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  storage_path: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
};

export type StoreColor = {
  name: { ar: string; en: string };
  hex: string;
};

export type StoreVariant = {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug?: string;
  categoryId?: string | null;
  modelId?: string | null;
  type?: string;
  color?: string;
  price: number;
  oldPrice?: number;
  images: string[];
  primaryImage: string;
  sku?: string | null;
  barcode?: string | null;
  inStock: boolean;
};

export type StoreProduct = {
  id: string;
  slug: string;
  sku?: string | null;
  barcode?: string | null;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
  categoryId: string | null;
  modelId?: string | null;
  model?: { ar: string; en: string; image?: string | null };
  price: number;
  oldPrice?: number;
  colors: StoreColor[];
  models?: string[];
  images: string[];
  inStock: boolean;
  tags: Array<"featured" | "best" | "new">;
  variants: StoreVariant[];
  ratingAverage: number;
  ratingCount: number;
};

export async function dashboardStats() {
  const [{ count: products }, { count: categories }, { count: orders }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);
  return { products: products ?? 0, categories: categories ?? 0, orders: orders ?? 0 };
}

export async function listProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id,slug,name_ar,name_en,description_ar,description_en,color,category_id,model_id,base_price,sale_price,final_price,stock_quantity,is_active,is_featured,is_bestseller,is_new,barcode,sku,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any): DbProduct => ({
    id: p.id,
    slug: p.slug,
    name_ar: p.name_ar || "",
    name_en: p.name_en || "",
    description_ar: p.description_ar ?? null,
    description_en: p.description_en ?? null,
    color: p.color ?? null,
    category_id: p.category_id ?? null,
    model_id: p.model_id ?? null,
    price:
      Number(p.final_price) > 0
        ? Number(p.final_price)
        : Number(p.sale_price) > 0
          ? Number(p.sale_price)
          : 0,
    old_price:
      Number(p.base_price ?? 0) > 0 &&
      Number(p.base_price) > (
        Number(p.final_price) > 0
          ? Number(p.final_price)
          : Number(p.sale_price) > 0
            ? Number(p.sale_price)
            : 0
      )
        ? Number(p.base_price)
        : null,
    stock: Number(p.stock_quantity ?? 0),
    in_stock: Boolean(p.is_active && Number(p.stock_quantity ?? 0) > 0),
    featured: Boolean(p.is_featured),
    best_seller: Boolean(p.is_bestseller),
    is_new: Boolean(p.is_new),
    barcode: p.barcode ?? null,
    sku: p.sku ?? null,
    is_active: Boolean(p.is_active),
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

export async function listCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name_ar");
  if (error) throw error;
  return (data ?? []) as DbCategory[];
}

export async function listSeries() {
  const { data, error } = await supabase
    .from("product_series")
    .select("id,slug,name_ar,name_en,image_url,storage_path,display_order,created_at")
    .order("display_order", { ascending: true })
    .order("name_ar");
  if (error) throw error;
  return (data ?? []) as DbSeries[];
}

export async function listModels() {
  const { data, error } = await supabase
    .from("product_models")
    .select("id,slug,name_ar,name_en,image_url,storage_path,series_id,created_at")
    .order("name_ar");
  if (error) throw error;
  return (data ?? []) as DbModel[];
}

/**
 * These columns are the stable variant fields used by the rebuilt SODFA schema.
 * The SQL migration shipped beside this ZIP adds the three display fields if
 * they are missing from an older database.
 */
export async function listProductVariants(productIds?: string[]) {
  let query = supabase
    .from("product_variants")
    .select("id,product_id,sku,barcode,color,base_price,sale_price,final_price,stock_quantity,is_active,display_order,variant_name,variant_type,variant_value,name_ar,name_en,slug,description_ar,description_en,category_id,model_id,is_featured,is_bestseller,is_new,created_at,updated_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (productIds?.length) query = query.in("product_id", productIds);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((v: any): DbProductVariant => ({
    id: v.id,
    product_id: v.product_id,
    variant_name: v.variant_name || v.variant_value || v.color || "Variant",
    variant_type: v.variant_type ?? (v.color ? "color" : "variant"),
    variant_value: v.variant_value ?? v.color ?? null,
    barcode: v.barcode ?? null,
    sku: v.sku ?? null,
    name_ar: v.name_ar ?? null,
    name_en: v.name_en ?? null,
    slug: v.slug ?? null,
    category_id: v.category_id ?? null,
    model_id: v.model_id ?? null,
    is_featured: Boolean(v.is_featured),
    is_bestseller: Boolean(v.is_bestseller),
    is_new: Boolean(v.is_new),
    description_ar: v.description_ar ?? null,
    description_en: v.description_en ?? null,
    // Variant pricing: base_price = old/reference price, sale_price = current price, final_price = effective price.
    price:
      Number(v.final_price ?? 0) > 0
        ? Number(v.final_price)
        : Number(v.sale_price ?? 0) > 0
          ? Number(v.sale_price)
          : Number(v.base_price ?? 0) > 0
            ? Number(v.base_price)
            : null,
    old_price:
      Number(v.base_price ?? 0) > 0 && Number(v.base_price) > (Number(v.final_price ?? 0) > 0 ? Number(v.final_price) : Number(v.sale_price ?? 0))
        ? Number(v.base_price)
        : null,
    stock: Number(v.stock_quantity ?? 0),
    color: v.color ?? null,
    final_price: v.final_price == null ? null : Number(v.final_price),
    is_active: v.is_active !== false,
    display_order: Number(v.display_order ?? 0),
    created_at: v.created_at,
    updated_at: v.updated_at,
  }));
}

export async function listProductImages(productIds?: string[]) {
  let query = supabase
    .from("product_images")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (productIds?.length) query = query.in("product_id", productIds);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    sort_order: Number(row.sort_order ?? 0),
    is_primary: Boolean(row.is_primary),
  })) as DbProductImage[];
}

const colorPalette: StoreColor[] = [
  { name: { ar: "أسود", en: "Black" }, hex: "#111111" },
  { name: { ar: "أبيض", en: "White" }, hex: "#F4F4F4" },
  { name: { ar: "أزرق", en: "Blue" }, hex: "#3B82F6" },
  { name: { ar: "أحمر", en: "Red" }, hex: "#EF4444" },
  { name: { ar: "وردي", en: "Pink" }, hex: "#EC4899" },
];

function makeColors(variants: DbProductVariant[]): StoreColor[] {
  const values = variants.map((v) => v.color || (v.variant_type === "color" ? v.variant_value : null)).filter(Boolean) as string[];
  return [...new Set(values)].slice(0, 6).map((value, index) => ({
    name: { ar: value, en: value },
    hex: colorPalette[index % colorPalette.length].hex,
  }));
}

async function listProductRatingSummary(productIds?: string[]) {
  try {
    let query = supabase
      .from("product_rating_summary")
      .select("product_id,rating_average,rating_count");
    if (productIds?.length) query = query.in("product_id", productIds);
    const { data, error } = await query;
    if (error) return new Map<string, { average: number; count: number }>();
    return new Map(
      (data ?? []).map((row: any) => [
        String(row.product_id),
        { average: Number(row.rating_average ?? 0), count: Number(row.rating_count ?? 0) },
      ]),
    );
  } catch {
    return new Map<string, { average: number; count: number }>();
  }
}

function toStoreProduct(
  product: DbProduct,
  category: DbCategory | undefined,
  variants: DbProductVariant[],
  images: DbProductImage[],
  rating?: { average: number; count: number },
  model?: DbModel,
): StoreProduct {
  const productImages = images
    .filter((image) => image.product_id === product.id && !image.variant_id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => image.image_url);

  const productVariants = variants
    .filter((variant) => variant.product_id === product.id && variant.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const storeVariants: StoreVariant[] = productVariants.map((variant) => {
    const variantImages = images
      .filter((image) => image.product_id === product.id && image.variant_id === variant.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const urls = variantImages.map((image) => image.image_url);
    const price = Number(variant.final_price) > 0 ? Number(variant.final_price) : Number(product.price) || 0;
    const oldPrice = variant.old_price != null && Number(variant.old_price) > price ? Number(variant.old_price) : undefined;
    return {
      id: variant.id,
      name: variant.name_ar || variant.name_en || variant.variant_value || product.name_ar || product.name_en,
      nameAr: variant.name_ar || undefined,
      nameEn: variant.name_en || undefined,
      descriptionAr: variant.description_ar ?? product.description_ar ?? "",
      descriptionEn: variant.description_en ?? product.description_en ?? variant.description_ar ?? product.description_ar ?? "",
      slug: variant.slug || undefined,
      categoryId: variant.category_id ?? product.category_id,
      modelId: variant.model_id ?? product.model_id ?? null,
      type: variant.variant_type ?? undefined,
      value: variant.variant_value ?? undefined,
      color: variant.color ?? undefined,
      price,
      oldPrice,
      images: urls,
      // Do not fall back to another variant or the parent gallery. This prevents
      // images from different variants from being mixed together.
      primaryImage: urls[0] ?? "/placeholder.svg",
      sku: variant.sku,
      barcode: variant.barcode,
      inStock: Boolean(variant.is_active && Number(variant.stock ?? 0) > 0),
    };
  });

  // Keep the parent product gallery strictly separate from variant galleries.
  // Variant images are rendered only when that exact variant is selected.
  const allImages = [...new Set(productImages)];

  const models = [...new Set(
    productVariants
      .filter((v) => /model|موديل|جهاز/i.test(v.variant_type ?? ""))
      .map((v) => v.variant_value?.trim())
      .filter(Boolean) as string[],
  )];

  const tags: StoreProduct["tags"] = [];
  if (product.featured) tags.push("featured");
  if (product.best_seller) tags.push("best");
  if (product.is_new) tags.push("new");

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    barcode: product.barcode,
    name: { ar: product.name_ar, en: product.name_en },
    description: {
      ar: product.description_ar ?? "",
      en: product.description_en ?? product.description_ar ?? "",
    },
    category: category?.slug ?? "",
    categoryId: product.category_id,
    modelId: product.model_id ?? null,
    model: model ? { ar: model.name_ar, en: model.name_en, image: model.image_url } : undefined,
    price: Number(product.price) || 0,
    oldPrice: product.old_price == null || Number(product.old_price) <= Number(product.price) ? undefined : Number(product.old_price),
    colors: makeColors(productVariants),
    models: models.length ? models : undefined,
    images: allImages.length ? allImages : ["/placeholder.svg"],
    inStock: Boolean(product.in_stock),
    tags,
    variants: storeVariants,
    ratingAverage: rating?.average ?? 0,
    ratingCount: rating?.count ?? 0,
  };
}

export async function listStoreProducts(): Promise<StoreProduct[]> {
  const [products, categories, models] = await Promise.all([listProducts(), listCategories(), listModels()]);
  const modelMap = new Map(models.map((model) => [model.id, model]));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const [variantsResult, imagesResult] = await Promise.allSettled([
    listProductVariants(products.map((product) => product.id)),
    listProductImages(products.map((product) => product.id)),
  ]);
  const variants = variantsResult.status === "fulfilled" ? variantsResult.value : [];
  const images = imagesResult.status === "fulfilled" ? imagesResult.value : [];
  const ratings = await listProductRatingSummary(products.map((product) => product.id));
  return products.map((product) => toStoreProduct(
    product,
    product.category_id ? (categoryMap.get(product.category_id) as DbCategory | undefined) : undefined,
    variants,
    images,
    ratings.get(product.id),
    product.model_id ? modelMap.get(product.model_id) : undefined,
  ));
}

export async function getStoreProduct(slug: string): Promise<StoreProduct | null> {
  // Product details must not depend on the full storefront catalog.
  // A failure in an unrelated category/product row should never make a
  // perfectly valid /product/:slug route fall into the global error page.
  const cleanSlug = decodeURIComponent(slug || "").trim();
  if (!cleanSlug) return null;

  const { data: row, error } = await supabase
    .from("products")
    .select("id,slug,name_ar,name_en,description_ar,description_en,color,category_id,model_id,base_price,sale_price,final_price,stock_quantity,is_active,is_featured,is_bestseller,is_new,barcode,sku,created_at,updated_at")
    .eq("slug", cleanSlug)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const product: DbProduct = {
    id: row.id, slug: row.slug, name_ar: row.name_ar || "", name_en: row.name_en || "",
    description_ar: row.description_ar ?? null, description_en: row.description_en ?? null,
    category_id: row.category_id ?? null, model_id: row.model_id ?? null, price: Number(row.final_price) > 0 ? Number(row.final_price) : 0,
    old_price: Number(row.base_price ?? 0) > 0 ? Number(row.base_price) : null,
    stock: Number(row.stock_quantity ?? 0), in_stock: Boolean(row.is_active && Number(row.stock_quantity ?? 0) > 0),
    featured: Boolean(row.is_featured), best_seller: Boolean(row.is_bestseller), is_new: Boolean(row.is_new),
    barcode: row.barcode ?? null, sku: row.sku ?? null, is_active: Boolean(row.is_active),
    created_at: row.created_at, updated_at: row.updated_at,
  };

  const [categoryResult, variantsResult, imagesResult, modelResult] = await Promise.allSettled([
    product.category_id
      ? supabase.from("categories").select("id,slug,name_ar,name_en,image_url,created_at").eq("id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null } as any),
    listProductVariants([product.id]),
    listProductImages([product.id]),
    product.model_id ? supabase.from("product_models").select("id,slug,name_ar,name_en,image_url,storage_path,series_id,created_at").eq("id", product.model_id).maybeSingle() : Promise.resolve({ data: null, error: null } as any),
  ]);

  if (variantsResult.status === "rejected") throw variantsResult.reason;
  if (imagesResult.status === "rejected") throw imagesResult.reason;

  const category = categoryResult.status === "fulfilled"
    ? ((categoryResult.value?.data ?? undefined) as DbCategory | undefined)
    : undefined;
  const ratings = await listProductRatingSummary([product.id]);
  const model = modelResult.status === "fulfilled" ? (modelResult.value?.data as DbModel | null) ?? undefined : undefined;
  return toStoreProduct(product, category, variantsResult.value, imagesResult.value, ratings.get(product.id), model);
}

export const DEFAULT_STORE_WHATSAPP_NUMBER = "201093384952";

export function normalizeEgyptWhatsAppNumber(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  if (digits.startsWith("1") && digits.length === 10) return `20${digits}`;
  return digits;
}

export async function getStoreWhatsAppSettings() {
  // Do not assume a particular id value. The settings table may use an
  // identity/UUID key, so always read the current settings row directly.
  const { data, error } = await supabase
    .from("store_settings")
    .select("id,whatsapp_country_code,whatsapp_number")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Store WhatsApp settings unavailable; using fallback number.", error);
    return { countryCode: "+20", number: "1093384952", normalized: DEFAULT_STORE_WHATSAPP_NUMBER };
  }

  const countryCode = String(data?.whatsapp_country_code || "+20").trim();
  const number = String(data?.whatsapp_number || "1093384952").trim();
  const normalized = normalizeWhatsAppNumber(countryCode, number) || DEFAULT_STORE_WHATSAPP_NUMBER;
  return { countryCode, number, normalized };
}

export function normalizeWhatsAppNumber(countryCode: string, number: string) {
  const code = String(countryCode || "").replace(/\D/g, "");
  const local = String(number || "").replace(/\D/g, "");
  if (!code || !local) return "";
  const withoutLeadingZero = local.replace(/^0+/, "");
  return `${code}${withoutLeadingZero}`;
}

export async function getStoreWhatsAppNumber() {
  return (await getStoreWhatsAppSettings()).normalized;
}

/**
 * Opens WhatsApp with an app-first strategy on mobile and a web fallback.
 * WhatsApp documents both public wa.me links and the whatsapp:// URL scheme;
 * the public link remains the fallback for browsers that do not hand off to
 * the installed app.
 */
export function openWhatsAppSmart(number: string, message: string, targetWindow?: Window | null) {
  const normalized = String(number || "").replace(/\D/g, "");
  if (!normalized) throw new Error("WHATSAPP_NUMBER_MISSING");
  const encoded = encodeURIComponent(message);
  const webUrl = `https://wa.me/${normalized}?text=${encoded}`;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!isMobile) {
    if (targetWindow && !targetWindow.closed) targetWindow.location.href = webUrl;
    else window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const appUrl = `whatsapp://send?phone=${normalized}&text=${encoded}`;
  let fallbackTimer = 0;
  let handedOff = false;
  const onVisibility = () => {
    if (document.hidden) {
      handedOff = true;
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  const navigate = (url: string) => {
    if (targetWindow && !targetWindow.closed) targetWindow.location.href = url;
    else window.location.href = url;
  };
  navigate(appUrl);
  fallbackTimer = window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibility);
    if (!handedOff) navigate(webUrl);
  }, 1400);
}

export async function saveStoreWhatsAppSettings(countryCode: string, number: string) {
  const normalized = normalizeWhatsAppNumber(countryCode, number);
  if (!normalized || normalized.length < 8) throw new Error("رقم واتساب غير صالح. تأكد من كود الدولة ورقم الهاتف.");

  const cleanCode = `+${String(countryCode).replace(/\D/g, "")}`;
  const cleanNumber = String(number).replace(/\D/g, "").replace(/^0+/, "");
  const payload = {
    whatsapp_country_code: cleanCode,
    whatsapp_number: cleanNumber,
    updated_at: new Date().toISOString(),
  };

  // Do not assume that store_settings.id is numeric, equals 1, or has a
  // UNIQUE/PRIMARY constraint. Read the actual settings row first, then
  // update it by its real id. If the table is empty, insert without forcing
  // an id so the database can use its own default/identity value.
  const existing = await supabase
    .from("store_settings")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data?.id != null) {
    const updated = await supabase
      .from("store_settings")
      .update(payload)
      .eq("id", existing.data.id);
    if (updated.error) throw updated.error;
  } else {
    const inserted = await supabase
      .from("store_settings")
      .insert(payload);
    if (inserted.error) throw inserted.error;
  }

  return { countryCode: cleanCode, number: cleanNumber, normalized };
}

export type ShippingRate = {
  id: string;
  governorate: string;
  price: number;
  is_active: boolean;
};

export type CustomerReview = {
  id: string;
  order_id: string | null;
  customer_name: string;
  customer_image_url: string | null;
  rating: number;
  review_text: string | null;
  image_url: string | null;
  is_visible: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export async function listShippingRates() {
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("id,governorate,price,is_active")
    .eq("is_active", true)
    .order("governorate");
  if (error) throw error;
  return (data ?? []).map((row: any): ShippingRate => ({
    id: row.id,
    governorate: row.governorate,
    price: Number(row.price ?? 0),
    is_active: Boolean(row.is_active),
  }));
}

export async function listCustomerReviews(visibleOnly = true) {
  let query = supabase
    .from("customer_reviews")
    .select("id,order_id,customer_name,customer_image_url,rating,review_text,image_url,is_visible,display_order,created_at,updated_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (visibleOnly) query = query.eq("is_visible", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any): CustomerReview => ({
    id: row.id,
    order_id: row.order_id ?? null,
    customer_name: row.customer_name ?? "",
    customer_image_url: row.customer_image_url ?? null,
    rating: Number(row.rating ?? 0),
    review_text: row.review_text ?? null,
    image_url: row.image_url ?? null,
    is_visible: Boolean(row.is_visible),
    display_order: Number(row.display_order ?? 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export type StoreOrderItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  qty: number;
  price: number;
  image?: string;
};

export type StoreOrder = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  governorate: string | null;
  address: string | null;
  notes: string | null;
  items: StoreOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  review_requested_at: string | null;
  created_at: string;
};

export async function createStoreOrder(payload: Omit<StoreOrder, "id" | "created_at" | "review_requested_at">) {
  const { data, error } = await supabase.rpc("create_public_order", {
    p_customer_name: payload.customer_name,
    p_customer_phone: payload.customer_phone,
    p_governorate: payload.governorate,
    p_address: payload.address,
    p_notes: payload.notes,
    p_items: payload.items,
    p_subtotal: payload.subtotal,
    p_shipping: payload.shipping,
    p_total: payload.total,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) throw new Error("ORDER_CREATE_FAILED");
  return row as { id: string; created_at: string };
}

export async function getReviewRequest(token: string) {
  const { data, error } = await supabase.rpc("get_review_request_by_token", { p_token: token });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as any;
}

export async function submitCustomerReview(payload: {
  orderId: string;
  token: string;
  customerName: string;
  rating: number;
  reviewText: string;
  imageUrl?: string | null;
}) {
  const { data, error } = await supabase.rpc("submit_customer_review_once", {
    p_order_id: payload.orderId,
    p_token: payload.token,
    p_customer_name: payload.customerName,
    p_rating: payload.rating,
    p_review_text: payload.reviewText,
    p_image_url: payload.imageUrl ?? null,
  });
  if (error) throw error;
  return data;
}

export async function uploadCustomerReviewImage(file: File, token: string) {
  const safeExt = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `review/${token}-${crypto.randomUUID()}.${safeExt}`;
  const { error } = await supabase.storage.from("customer-reviews").upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });
  if (error) throw error;
  const { data } = supabase.storage.from("customer-reviews").getPublicUrl(path);
  return data.publicUrl;
}
