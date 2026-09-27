import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { DeviceFilter } from "@/components/DeviceFilter";
import { useLang } from "@/lib/i18n";
import { listCategories, listModels, listSeries, listStoreProducts, type DbCategory, type DbModel, type DbSeries, type StoreProduct } from "@/lib/db";

type Search = { q?: string; cat?: string; model?: string; series?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    cat: typeof search.cat === "string" && search.cat ? search.cat : undefined,
    model: typeof search.model === "string" && search.model ? search.model : undefined,
    series: typeof search.series === "string" && search.series ? search.series : undefined,
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
  const { q, cat, model: modelParam, series: seriesParam } = Route.useSearch();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [series, setSeries] = useState<DbSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>(seriesParam);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(modelParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedModel(modelParam);
    setSelectedSeries(seriesParam);
  }, [modelParam]);

  useEffect(() => {
    let alive = true;
    Promise.all([listStoreProducts(), listCategories(), listModels(), listSeries()])
      .then(([nextProducts, nextCategories, nextModels, nextSeries]) => {
        if (!alive) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setModels(nextModels);
        setSeries(nextSeries);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "تعذر تحميل المنتجات"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const selectedCategoryId = useMemo(
    () => categories.find((item) => item.slug === cat)?.id,
    [categories, cat],
  );

  const list = useMemo(() => {
    const term = (q ?? "").trim().toLowerCase();
    return products.filter((product) => {
      const okCat = !cat || product.category === cat || Boolean(
        selectedCategoryId && product.variants.some((v) => v.categoryId === selectedCategoryId),
      );
      const okSeries = !selectedSeries || productBelongsToSeries(product, selectedSeries, models);
      const okModel = !selectedModel || product.modelId === selectedModel || product.variants.some((v) => v.modelId === selectedModel);
      const okTerm = !term
        || product.name.ar.toLowerCase().includes(term)
        || product.name.en.toLowerCase().includes(term)
        || product.variants.some((v) => `${v.nameAr || ""} ${v.nameEn || ""} ${v.name}`.toLowerCase().includes(term));
      return okCat && okSeries && okModel && okTerm;
    });
  }, [products, selectedCategoryId, q, cat, selectedModel, selectedSeries, models]);

  const modelIdsForPage = useMemo(() => {
    const ids = new Set<string>();
    products.forEach((p) => {
      if (cat && selectedCategoryId && p.categoryId !== selectedCategoryId && !p.variants.some((v) => v.categoryId === selectedCategoryId)) return;
      if (p.modelId) ids.add(p.modelId);
      p.variants.forEach((v) => v.modelId && ids.add(v.modelId));
    });
    return ids;
  }, [products, cat, selectedCategoryId]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><div className="h-10 w-56 animate-pulse rounded-xl bg-muted"/><div className="mt-6 h-52 animate-pulse rounded-3xl bg-muted"/></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold sm:text-4xl">{t("shop.title")}</h1>
      <p className="mt-1 text-sm text-subtle">{list.length} {t("shop.results")}</p>

      <div className="mt-6 space-y-5">
        <div>
          <div className="mb-3 text-xs font-semibold tracking-wide text-subtle">التصنيفات</div>
          <div className="flex flex-wrap gap-2">
            <Link to="/products" search={{ q, cat: undefined, model: undefined, series: undefined }} className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-primary/40">كل التصنيفات</Link>
            {categories.map((c) => (
              <Link key={c.id} to="/products" search={{ q, cat: c.slug, model: undefined, series: undefined }} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${cat === c.slug ? "border-primary bg-primary/10 text-primary-dark" : "border-border hover:border-primary/40"}`}>
                {pick(c.name_ar, c.name_en)}
              </Link>
            ))}
          </div>
        </div>
        <DeviceFilter series={series} models={models} selectedSeriesId={selectedSeries} selectedModelId={selectedModel} onSeriesSelect={setSelectedSeries} onModelSelect={setSelectedModel} productModelIds={modelIdsForPage} />
      </div>

      {error && <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="mt-8">
        {list.length ? (
          <ProductGrid products={list} />
        ) : (
          <p className="py-16 text-center text-sm text-subtle">لا توجد منتجات مرتبطة بهذا الفلتر.</p>
        )}
      </div>
    </div>
  );
}

function productBelongsToSeries(product: StoreProduct, seriesId: string, models: DbModel[]) { const ids = new Set(models.filter(m => m.series_id === seriesId).map(m => m.id)); return (product.modelId ? ids.has(product.modelId) : false) || product.variants.some(v => v.modelId ? ids.has(v.modelId) : false); }
