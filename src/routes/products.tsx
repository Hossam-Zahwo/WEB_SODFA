import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { useLang } from "@/lib/i18n";
import { listCategories, listModels, listStoreProducts, type DbCategory, type DbModel, type StoreProduct } from "@/lib/db";
import { cn } from "@/lib/utils";

 type Search = { q?: string; cat?: string; model?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    cat: typeof search.cat === "string" && search.cat ? search.cat : undefined,
    model: typeof search.model === "string" && search.model ? search.model : undefined,
  }),
  head: () => ({
    meta: [
      { title: "كل المنتجات | SODFA صدفة" },
      { name: "description", content: "تصفح كل منتجات صدفة." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t, pick } = useLang();
  const { q, cat, model } = Route.useSearch();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([listStoreProducts(), listCategories(), listModels()])
      .then(([nextProducts, nextCategories, nextModels]) => {
        if (!alive) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setModels(nextModels);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "تعذر تحميل المنتجات"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const list = useMemo(() => {
    const term = (q ?? "").trim().toLowerCase();
    return products.filter((product) => {
      const selectedCategoryId = categories.find((item) => item.slug === cat)?.id;
      const okCat = !cat || product.category === cat || Boolean(selectedCategoryId && product.variants.some((v) => v.categoryId === selectedCategoryId));
      const okModel = !model || product.modelId === model || product.variants.some((v) => v.modelId === model);
      const okTerm = !term || product.name.ar.toLowerCase().includes(term) || product.name.en.toLowerCase().includes(term) || product.variants.some((v) => `${v.nameAr || ""} ${v.nameEn || ""} ${v.name}`.toLowerCase().includes(term));
      return okCat && okModel && okTerm;
    });
  }, [products, categories, q, cat, model]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold sm:text-4xl">{t("shop.title")}</h1>
      <p className="mt-1 text-sm text-subtle">{list.length} {t("shop.results")}</p>

      <section className="mt-6 space-y-5" aria-label="فلاتر المنتجات">
        <div>
          <div className="mb-3 text-xs font-semibold tracking-wide text-subtle">التصنيفات</div>
          <div className="flex flex-wrap gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/products"
                search={{ q, cat: c.slug, model }}
                className={cn(
                  "group flex min-w-[112px] flex-col items-center gap-2 rounded-2xl p-2 text-center text-xs transition-colors",
                  cat === c.slug ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-white">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-0.5 transition-transform duration-200 group-hover:-translate-y-1"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[10px]">SODFA</span>
                  )}
                </span>
                <span className="max-w-[130px] truncate font-semibold">{pick(c.name_ar, c.name_en)}</span>
              </Link>
            ))}
          </div>
        </div>
        {models.length > 0 && <div>
          <div className="mb-3 text-xs font-semibold tracking-wide text-subtle">الموديلات</div>
          <div className="flex flex-wrap gap-4">
            {models.map((m) => (
              <Link
                key={m.id}
                to="/products"
                search={{ q, cat, model: m.id }}
                className={cn(
                  "group flex min-w-[112px] flex-col items-center gap-2 rounded-2xl p-2 text-center text-xs transition-colors",
                  model === m.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-white">
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-0.5 transition-transform duration-200 group-hover:-translate-y-1"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[10px]">SODFA</span>
                  )}
                </span>
                <span className="max-w-[130px] truncate font-semibold">{pick(m.name_ar, m.name_en)}</span>
              </Link>
            ))}
          </div>
        </div>}
      </section>

      <div className="mt-8">
        {loading ? <p className="py-16 text-center text-sm text-subtle">جاري تحميل المنتجات...</p> : error ? <p className="py-16 text-center text-sm text-red-600">{error}</p> : list.length ? <ProductGrid products={list} includeVariants /> : <p className="py-16 text-center text-sm text-subtle">{t("shop.empty")}</p>}
      </div>
    </div>
  );
}
