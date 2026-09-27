import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Check, Layers3, Star } from "lucide-react";
import { SmartImage } from "./SmartImage";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import type { StoreProduct, StoreVariant } from "@/lib/db";

function discountPct(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

function colorHex(value?: string | null) {
  const v = (value ?? "").trim().toLowerCase();
  const map: Record<string, string> = {
    "black": "#111111", "أسود": "#111111", "اسود": "#111111",
    "white": "#F4F4F4", "أبيض": "#F4F4F4", "ابيض": "#F4F4F4",
    "blue": "#3B82F6", "أزرق": "#3B82F6", "ازرق": "#3B82F6",
    "red": "#EF4444", "أحمر": "#EF4444", "احمر": "#EF4444",
    "green": "#22C55E", "أخضر": "#22C55E", "اخضر": "#22C55E",
    "purple": "#8B5CF6", "بنفسجي": "#8B5CF6",
    "pink": "#EC4899", "وردي": "#EC4899",
    "yellow": "#EAB308", "أصفر": "#EAB308", "اصفر": "#EAB308",
    "orange": "#F97316", "برتقالي": "#F97316",
    "gray": "#9CA3AF", "grey": "#9CA3AF", "رمادي": "#9CA3AF",
    "clear": "#D9E1EA", "شفاف": "#D9E1EA",
  };
  return value?.startsWith("#") ? value : (map[v] ?? "#CBD5E1");
}

function Rating({ average = 0, count = 0 }: { average?: number; count?: number }) {
  const { t } = useLang();
  const rounded = Math.round(average);
  return (
    <div className="flex items-center gap-1.5" aria-label={`${t("product.rating")} ${average.toFixed(1)} / 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={12} className={cn(i < rounded ? "fill-primary-light text-primary-light" : "text-muted-foreground/30")} />
        ))}
      </div>
      <span className="text-[10px] text-subtle">
        {count ? `${average.toFixed(1)} (${count})` : t("product.noRatings")}
      </span>
    </div>
  );
}

export function ProductCard({
  product,
  variant,
  imageRatio = "square",
  imageFit = "contain",
}: {
  product: StoreProduct;
  variant?: StoreVariant;
  imageRatio?: "square" | "wide" | "portrait";
  imageFit?: "cover" | "contain";
}) {
  const { t, pick, price, lang } = useLang();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const displayPrice = variant?.price ?? product.price;
  const displayOldPrice = variant?.oldPrice ?? product.oldPrice;
  const displayImage = variant?.primaryImage ?? product.images[0];
  const displayName = variant
    ? pick(variant.nameAr || variant.value || product.name.ar, variant.nameEn || variant.value || product.name.en)
    : pick(product.name.ar, product.name.en);
  const variantTypeLabels: Record<string, { ar: string; en: string }> = { color: { ar: "اللون", en: "Color" }, model: { ar: "الموديل", en: "Model" }, size: { ar: "المقاس", en: "Size" }, storage: { ar: "السعة", en: "Storage" }, material: { ar: "الخامة", en: "Material" }, other: { ar: "الاختيار", en: "Option" } };
  const variantLabel = variant ? `${variantTypeLabels[variant.type || "other"]?.[lang] || variant.type}: ${variant.value || variant.name}` : "";
  const off = discountPct(displayPrice, displayOldPrice);
  const variantColor = variant?.color ?? (variant?.type === "color" ? variant.value : undefined);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product, {
      variantId: variant?.id,
      variantName: variant?.name,
      image: displayImage,
      price: displayPrice,
      color: variant?.color,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      search={{ variant: variant?.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:bg-card-hover hover:shadow-card"
    >
      <div className="relative overflow-hidden bg-white">
        <SmartImage
          src={displayImage}
          alt={displayName}
          ratio={imageRatio}
          className="bg-white"
          imgClassName={cn(
            imageFit === "contain" ? "object-contain p-3 sm:p-4" : "object-contain p-2 sm:p-3",
            "transition-transform duration-700",
            "group-hover:scale-[1.025]",
          )}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute start-3 top-3 z-10 flex max-w-[72%] flex-wrap gap-1.5">
          {off > 0 && (
            <span className="rounded-full border border-primary-light/25 bg-primary-light px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
              {off}% {t("product.off")}
            </span>
          )}
          {!variant && product.tags.includes("best") && (
            <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">{t("product.best")}</span>
          )}
          {!variant && product.tags.includes("featured") && (
            <span className="rounded-full bg-primary-light/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">{t("product.featured")}</span>
          )}
          {!variant && product.tags.includes("new") && (
            <span className="rounded-full bg-primary-dark/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">{t("product.new")}</span>
          )}
        </div>
        {variant && (
          <span className="absolute end-3 top-3 flex max-w-[52%] items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
            <Layers3 size={11} /> <span className="truncate">{variantLabel}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="line-clamp-2 text-sm font-medium sm:text-base">{displayName}</div>
          {variant && <div className="mt-1 line-clamp-1 text-[11px] text-subtle">{variantLabel}</div>}
        </div>

        <Rating average={product.ratingAverage} count={product.ratingCount} />

        {(variant ? variant.inStock : product.inStock) && (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-semibold sm:text-lg">{price(displayPrice)}</span>
            {displayOldPrice && <span className="text-xs text-subtle line-through">{price(displayOldPrice)}</span>}
          </div>
        )}

        <div className="flex min-h-5 items-center gap-1.5">
          {variantColor ? (
            <span
              title={variantColor}
              className="h-4 w-4 rounded-full border border-border ring-2 ring-white"
              style={{ backgroundColor: colorHex(variantColor) }}
            />
          ) : (
            product.colors.slice(0, 6).map((c) => (
              <span
                key={`${c.name.en}-${c.hex}`}
                title={pick(c.name.ar, c.name.en)}
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
            ))
          )}
          {product.colors.length > 6 && !variant && <span className="text-[10px] text-subtle">+{product.colors.length - 6}</span>}
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={variant ? !variant.inStock : !product.inStock}
          className="mt-auto flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-input text-sm font-medium transition-all hover:border-primary/50 hover:bg-card-hover disabled:opacity-40"
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {added ? t("product.added") : t("product.addToCart")}
        </button>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  includeVariants = false,
  selectedModelId,
}: {
  products: StoreProduct[];
  includeVariants?: boolean;
  selectedModelId?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.flatMap((product) => {
        if (selectedModelId) {
          const matchingVariants = product.variants.filter((variant) => variant.modelId === selectedModelId);
          if (matchingVariants.length) {
            return matchingVariants.map((variant) => (
              <ProductCard key={`${product.id}-${variant.id}`} product={product} variant={variant} />
            ));
          }
          if (product.modelId === selectedModelId) {
            return [<ProductCard key={product.id} product={product} />];
          }
          return [];
        }

        const parent = <ProductCard key={product.id} product={product} />;
        if (!includeVariants || !product.variants.length) return [parent];
        return [
          parent,
          ...product.variants.map((variant) => (
            <ProductCard key={`${product.id}-${variant.id}`} product={product} variant={variant} />
          )),
        ];
      })}
    </div>
  );
}
