import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { DeviceFilter } from "@/components/DeviceFilter";
import { useLang } from "@/lib/i18n";
import { listModels, listSeries, listStoreProducts, type DbModel, type DbSeries, type StoreProduct } from "@/lib/db";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "العروض | SODFA صدفة" },
      { name: "description", content: "خصومات على منتجات مختارة من صدفة." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { t } = useLang();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [series, setSeries] = useState<DbSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  useEffect(() => {
    Promise.all([listStoreProducts(), listModels(), listSeries()]).then(([p, m, s]) => { setProducts(p); setModels(m); setSeries(s); }).catch(console.error);
  }, []);
  useEffect(() => {
    if (!selectedSeries && selectedModel) {
      const model = models.find((item) => item.id === selectedModel);
      if (model?.series_id) setSelectedSeries(model.series_id);
    }
  }, [models, selectedModel, selectedSeries]);
  const offers = useMemo(() => products.filter((p) => p.oldPrice && p.oldPrice > p.price), [products]);
  const modelIds = useMemo(() => {
    const ids = new Set<string>();
    offers.forEach((p) => { if (p.modelId) ids.add(p.modelId); p.variants.forEach((v) => v.modelId && ids.add(v.modelId)); });
    return ids;
  }, [offers]);
  const filteredOffers = useMemo(() => offers.filter((p) => { const ids = new Set(models.filter(m => m.series_id === selectedSeries).map(m => m.id)); const okSeries = !selectedSeries || (p.modelId ? ids.has(p.modelId) : false) || p.variants.some(v => v.modelId ? ids.has(v.modelId) : false); const okModel = !selectedModel || p.modelId === selectedModel || p.variants.some(v => v.modelId === selectedModel); return okSeries && okModel; }), [offers, models, selectedSeries, selectedModel]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <span className="bg-sodfa block h-1 w-12 rounded-full" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold sm:text-4xl">{t("offers.title")}</h1>
      <p className="mt-1 text-sm text-subtle">{t("offers.sub")}</p>
      <div className="mt-7"><DeviceFilter series={series} models={models} selectedSeriesId={selectedSeries} selectedModelId={selectedModel} onSeriesSelect={(id) => { setSelectedSeries(id); setSelectedModel(undefined); }} onModelSelect={setSelectedModel} productModelIds={modelIds} /></div>
      <div className="mt-8">
        {selectedSeries && !selectedModel ? <p className="py-16 text-center text-sm text-subtle">{t("filter.chooseModel")}</p> : filteredOffers.length ? <ProductGrid products={filteredOffers} selectedModelId={selectedModel} /> : <p className="py-16 text-center text-sm text-subtle">{t("filter.noProducts")}</p>}
      </div>
    </div>
  );
}
