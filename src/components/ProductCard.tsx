import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ShoppingBasket, Star } from "lucide-react";
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
    <div className="flex items-center gap-1" aria-label={`${t("product.rating")} ${average.toFixed(1)} / 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={11} className={cn(i < rounded ? "fill-primary-light text-primary-light" : "text-muted-foreground/30")} />
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
  const { t, pick, price } = useLang();
  const { add } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const displayPrice = variant?.price ?? product.price;
  const displayOldPrice = variant?.oldPrice ?? product.oldPrice;
  const displayImage = variant?.primaryImage ?? product.images[0];
  // Product cards always keep the parent product title. The variant's
  // difference value is shown separately beneath it.
  const displayName = pick(product.name.ar, product.name.en);
  const off = discountPct(displayPrice, displayOldPrice);
  const variantColor = variant?.color ?? (variant?.type === "color" ? variant.value : undefined);

  const addOptions = {
    variantId: variant?.id,
    variantName: variant?.name,
    image: displayImage,
    price: displayPrice,
    color: variant?.color,
  };

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, addOptions);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const onBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant ? !variant.inStock : !product.inStock) return;
    add(product, addOptions);
    void navigate({ to: "/cart", search: { checkout: true } });
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      search={{ variant: variant?.id }}
      className="group relative flex h-[390px] min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-300 hover:border-primary/40 hover:bg-card-hover hover:shadow-card sm:h-[430px]"
    >
      <div className="relative aspect-square shrink-0 overflow-hidden bg-white">
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
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 sm:p-3.5">
        <div className="min-h-[56px]">
          <div className="line-clamp-2 text-[13px] font-semibold leading-5 sm:text-sm">{displayName}</div>
          {variant && (variant.value || variant.shape || variant.name) && (
            <div className="mt-0.5 line-clamp-1 text-[10px] text-subtle" title={variant.value || variant.shape || variant.name}>
              {variant.value || variant.shape || variant.name}
            </div>
          )}
        </div>

        <Rating average={product.ratingAverage} count={product.ratingCount} />

        <div className="flex min-h-[26px] flex-wrap items-baseline gap-2">
          {(variant ? variant.inStock : product.inStock) ? (
            <>
              <span className="text-base font-bold sm:text-lg">{price(displayPrice)}</span>
              {displayOldPrice && <span className="text-xs text-subtle line-through">{price(displayOldPrice)}</span>}
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">{t("product.outStock")}</span>
          )}
        </div>

        <div className="flex min-h-5 items-center gap-1.5 overflow-hidden">
          {variantColor ? (
            <span title={variantColor} className="h-4 w-4 shrink-0 rounded-full border border-border ring-2 ring-white" style={{ backgroundColor: colorHex(variantColor) }} />
          ) : (
            product.colors.slice(0, 6).map((c) => (
              <span key={`${c.name.en}-${c.hex}`} title={pick(c.name.ar, c.name.en)} className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
            ))
          )}
          {product.colors.length > 6 && !variant && <span className="text-[10px] text-subtle">+{product.colors.length - 6}</span>}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <button type="button" onClick={onAdd} disabled={variant ? !variant.inStock : !product.inStock} aria-label={added ? t("product.added") : t("product.addToCart")} title={added ? t("product.added") : t("product.addToCart")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all hover:scale-105 hover:border-primary/50 hover:bg-primary/10 disabled:opacity-40">
            {added ? <Check className="h-4 w-4" /> : <ShoppingBasket className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onBuyNow} disabled={variant ? !variant.inStock : !product.inStock} className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-40 sm:text-sm">
            اطلب الآن
          </button>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  includeVariants = true,
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
          const items: React.ReactNode[] = [];
          if (product.modelId === selectedModelId) {
            items.push(<ProductCard key={product.id} product={product} />);
          }
          product.variants
            .filter((variant) => variant.modelId === selectedModelId)
            .forEach((variant) => {
              items.push(<ProductCard key={`${product.id}-${variant.id}`} product={product} variant={variant} />);
            });
          return items;
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
