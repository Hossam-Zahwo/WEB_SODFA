import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SmartImage } from "./SmartImage";
import { useLang } from "@/lib/i18n";
import type { StoreProduct, StoreVariant } from "@/lib/db";
import { cn } from "@/lib/utils";

type ShowcaseCard = { product: StoreProduct; variant?: StoreVariant };

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function HomeProductShowcase({ products }: { products: StoreProduct[] }) {
  const { dir, t } = useLang();
  const [cards, setCards] = useState<ShowcaseCard[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const allCards: ShowcaseCard[] = products.flatMap((product) => [
      { product },
      ...product.variants.map((variant) => ({ product, variant })),
    ]);
    const nextCards = shuffle(allCards).slice(0, Math.min(20, allCards.length));
    setCards(nextCards);
    setCarouselIndex(0);
  }, [products]);

  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(cards.length / pageSize));
  const pageItems = Array.from({ length: pages }, (_, pageIndex) =>
    cards.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
  );
  const isLooping = pages > 1;

  useEffect(() => {
    if (!isLooping) return;
    const id = window.setInterval(() => {
      setCarouselIndex((current) => (current + 1) % pages);
    }, 5200);
    return () => window.clearInterval(id);
  }, [isLooping, pages]);

  const previous = () => {
    if (!isLooping) return;
    setCarouselIndex((current) => (current - 1 + pages) % pages);
  };

  const next = () => {
    if (!isLooping) return;
    setCarouselIndex((current) => (current + 1) % pages);
  };

  if (!products.length) return null;

  return (
    <section className="sodfa-section-motion sodfa-product-showcase-card w-full px-0 pb-8 sm:pb-10">
      <div className="relative w-full overflow-hidden border-y border-border bg-card/70 px-10 py-5 shadow-card backdrop-blur sm:px-14 sm:py-7 lg:px-16">
        {isLooping && <>
          <button type="button" onClick={previous} className="sodfa-slider-arrow absolute start-2 top-1/2 z-20 -translate-y-1/2 sm:start-4" aria-label={t("slider.previous")}>
            {dir === "rtl" ? <ArrowRight size={17}/> : <ArrowLeft size={17}/>} 
          </button>
          <button type="button" onClick={next} className="sodfa-slider-arrow absolute end-2 top-1/2 z-20 -translate-y-1/2 sm:end-4" aria-label={t("slider.next")}>
            {dir === "rtl" ? <ArrowLeft size={17}/> : <ArrowRight size={17}/>} 
          </button>
        </>}

        {/*
          The pages are stacked in one CSS grid cell instead of using a wide
          translated track. This prevents percentage transforms from being
          calculated against the wrong element width and guarantees that the
          first page is visible even when there is only one page.
        */}
        <div className="grid min-w-0 overflow-hidden">
          {pageItems.map((pageProducts, pageIndex) => {
            let offset = pageIndex - carouselIndex;
            if (isLooping) {
              if (offset > pages / 2) offset -= pages;
              if (offset < -pages / 2) offset += pages;
            }

            return (
              <div
                key={pageIndex}
                aria-hidden={pageIndex !== carouselIndex}
                className="col-start-1 row-start-1 grid min-w-0 grid-cols-2 gap-3 transition-transform duration-700 [transition-timing-function:cubic-bezier(.22,1,.36,1)] sm:grid-cols-4 sm:gap-5 lg:gap-6"
                style={{
                  transform: `translate3d(${offset * 100}%, 0, 0)`,
                  pointerEvents: pageIndex === carouselIndex ? "auto" : "none",
                }}
              >
                {pageProducts.map(({ product, variant }) => (
                  <div key={`${pageIndex}-${product.id}-${variant?.id ?? "parent"}`} className="min-w-0">
                    <ProductCard product={product} variant={variant} imageRatio="portrait" imageFit="contain" />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {isLooping && <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCarouselIndex(i)}
              aria-label={`${t("slider.group")} ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all duration-500", i === carouselIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/40")}
            />
          ))}
        </div>}
      </div>
    </section>
  );
}

export function HomeProductImageSlider({ products }: { products: StoreProduct[] }) {
  const { pick, t } = useLang();
  const images = useMemo(() => {
    const urls = products.flatMap((p) => [
      ...p.images.map((src) => ({ src, name: pick(p.name.ar, p.name.en) })),
      ...p.variants.flatMap((variant) => variant.images.map((src) => ({
        src,
        name: pick(variant.nameAr || variant.value || p.name.ar, variant.nameEn || variant.value || p.name.en),
      }))),
    ]);
    return urls.filter((x, i, a) => a.findIndex((y) => y.src === x.src) === i);
  }, [products, pick]);

  if (images.length < 2) return null;

  /*
   * Keep four identical copies in one uninterrupted track.
   * The animation moves exactly one copy-width, then resets to the
   * visually identical copy at the start. Because the visible content
   * is identical at both points, the reset is seamless and there is
   * never an empty/end state, even as the product count changes.
   */
  const marqueeItems = [...images, ...images, ...images, ...images];

  return (
    <section
      className="sodfa-section-motion w-full overflow-hidden border-y border-border/60 bg-card/30 py-3 sm:py-5"
      aria-label={t("slider.productImages")}
    >
      <div className="sodfa-image-marquee">
        <div className="sodfa-image-marquee-track">
          {marqueeItems.map((item, i) => (
            <div key={`${item.src}-${i}`} className="sodfa-image-marquee-item">
              <div className="group flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-background/70 shadow-sm transition-all duration-500 hover:border-primary/35 hover:shadow-md sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                <SmartImage
                  src={item.src}
                  alt={item.name}
                  ratio="square"
                  className="h-full w-full bg-transparent"
                  imgClassName="mx-auto h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04] sm:p-5"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
