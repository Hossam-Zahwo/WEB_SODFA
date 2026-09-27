import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { DeviceFilter } from "@/components/DeviceFilter";
import { useLang } from "@/lib/i18n";
import { listCategories, listModels, listSeries, listStoreProducts, type DbModel, type DbSeries } from "@/lib/db";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const [categoryList, products, models, series] = await Promise.all([listCategories(), listStoreProducts(), listModels(), listSeries()]);
    const category = categoryList.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return {
      category,
      models,
      series,
      products: products.filter((product) => product.categoryId === category.id || product.variants.some((v) => v.categoryId === category.id)),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متاح | SODFA" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.category.name_ar} | SODFA صدفة`;
    return { meta: [{ title }, { name: "description", content: `تسوّق ${loaderData.category.name_ar} من صدفة.` }, { property: "og:title", content: title }, { property: "og:description", content: `منتجات ${loaderData.category.name_ar} من صدفة.` }] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const data = Route.useLoaderData();
  const { pick, t } = useLang();
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedSeries && selectedModel) {
      const model = data.models.find((item) => item.id === selectedModel);
      if (model?.series_id) setSelectedSeries(model.series_id);
    }
  }, [data.models, selectedModel, selectedSeries]);

  const modelIds = useMemo(() => {
    const ids = new Set<string>();
    data.products.forEach((p) => {
      if (p.modelId) ids.add(p.modelId);
      p.variants.forEach((v) => v.modelId && ids.add(v.modelId));
    });
    return ids;
  }, [data.products]);

  const filtered = useMemo(
    () => data.products.filter((p) => { const seriesIds = new Set(data.models.filter(m => m.series_id === selectedSeries).map(m => m.id)); const okSeries = !selectedSeries || (p.modelId ? seriesIds.has(p.modelId) : false) || p.variants.some(v => v.modelId ? seriesIds.has(v.modelId) : false); const okModel = !selectedModel || p.modelId === selectedModel || p.variants.some(v => v.modelId === selectedModel); return okSeries && okModel; }),
    [data.products, data.models, selectedModel, selectedSeries],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14">
      <span className="bg-sodfa block h-1 w-12 rounded-full" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold sm:text-4xl">{pick(data.category.name_ar, data.category.name_en)}</h1>
      <p className="mt-1 text-sm text-subtle">{filtered.length} {t("shop.results")}</p>

      <div className="mt-7">
        <DeviceFilter series={data.series as DbSeries[]} models={data.models as DbModel[]} selectedSeriesId={selectedSeries} selectedModelId={selectedModel} onSeriesSelect={setSelectedSeries} onModelSelect={setSelectedModel} productModelIds={modelIds} />
      </div>

      <div className="mt-8">
        {selectedSeries && !selectedModel ? <p className="py-16 text-center text-sm text-subtle">{t("filter.chooseModel")}</p> : filtered.length ? <ProductGrid products={filtered} selectedModelId={selectedModel} /> : <p className="py-16 text-center text-sm text-subtle">{t("filter.noProducts")}</p>}
      </div>
    </div>
  );
}
