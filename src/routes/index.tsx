import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HeroSlider } from "@/components/HeroSlider";
import { FeatureStrip } from "@/components/FeatureStrip";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Stats } from "@/components/Stats";
import { Section } from "@/components/Section";
import { ProductGrid } from "@/components/ProductCard";
import { FindYourPhone } from "@/components/FindYourPhone";
import { HomeProductShowcase } from "@/components/HomeProductShowcase";
import { CustomerReviews } from "@/components/CustomerReviews";
import { useLang } from "@/lib/i18n";
import { listModels, listSeries, listStoreProductsPage, type DbModel, type DbSeries, type StoreProduct } from "@/lib/db";
import { DeviceFilter } from "@/components/DeviceFilter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SODFA | صدفة — إكسسوارات هاتف بريميوم في مصر" },
      { name: "description", content: "متجر صدفة لإكسسوارات الهواتف والمنتجات المتاحة في مصر مع تجربة شراء سريعة عبر واتساب." },
      { name: "keywords", content: "SODFA, صدفة, اكسسوارات موبايل, جرابات, شواحن, كابلات, اكسسوارات هواتف, مصر" },
      { property: "og:title", content: "SODFA | صدفة — إكسسوارات هاتف بريميوم في مصر" },
      { property: "og:description", content: "اكتشف منتجات SODFA المتاحة وابحث عن المنتجات المتوافقة مع نوع هاتفك." },
    ],
  }),
  component: Index,
});

function ViewAll({ to, label }: { to: "/products" | "/offers" | "/categories"; label: string }) {
  return <Link to={to} className="text-sm text-muted-foreground hover:text-foreground">{label}</Link>;
}

function Index() {
  const { t } = useLang();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [models, setModels] = useState<DbModel[]>([]);
  const [series, setSeries] = useState<DbSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listStoreProductsPage({ page: 0, pageSize: 8, featured: true }),
      listStoreProductsPage({ page: 0, pageSize: 8, newest: true }),
      listModels(),
      listSeries(),
    ])
      .then(([bestPage, newPage, modelData, seriesData]) => {
        if (alive) {
          const merged = [...bestPage.products, ...newPage.products].filter((product, index, all) => all.findIndex((item) => item.id === product.id) === index);
          setProducts(merged);
          setModels(modelData);
          setSeries(seriesData);
        }
      })
      .catch((error) => console.error("Home products failed:", error))
      .finally(() => { if (alive) setProductsLoading(false); });
    return () => { alive = false; };
  }, []);

  const best = products.filter((p) => p.tags.includes("best"));
  const newest = products.filter((p) => p.tags.includes("new"));
  const modelIds = useMemo(() => {
    const ids = new Set<string>();
    products.forEach((p) => { if (p.modelId) ids.add(p.modelId); p.variants.forEach((v) => v.modelId && ids.add(v.modelId)); });
    return ids;
  }, [products]);
  const filteredBest = useMemo(() => best.filter((p) => { const ids = new Set(models.filter(m => m.series_id === selectedSeries).map(m => m.id)); const okSeries = !selectedSeries || (p.modelId ? ids.has(p.modelId) : false) || p.variants.some(v => v.modelId ? ids.has(v.modelId) : false); const okModel = !selectedModel || p.modelId === selectedModel || p.variants.some(v => v.modelId === selectedModel); return okSeries && okModel; }), [best, models, selectedSeries, selectedModel]);
  const filteredNewest = useMemo(() => newest.filter((p) => { const ids = new Set(models.filter(m => m.series_id === selectedSeries).map(m => m.id)); const okSeries = !selectedSeries || (p.modelId ? ids.has(p.modelId) : false) || p.variants.some(v => v.modelId ? ids.has(v.modelId) : false); const okModel = !selectedModel || p.modelId === selectedModel || p.variants.some(v => v.modelId === selectedModel); return okSeries && okModel; }), [newest, models, selectedSeries, selectedModel]);

  return (
    <>
      <HeroSlider />
      <Section title={t("home.categories")} action={<ViewAll to="/categories" label={t("home.viewAll")} />}>
        <CategoryGrid />
      </Section>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-2 sm:px-6 lg:grid-cols-2">
        <FindYourPhone products={products} />
        <Stats />
      </div>
      <HomeProductShowcase products={products} />
      <FeatureStrip />
      <CustomerReviews />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <DeviceFilter series={series} models={models} selectedSeriesId={selectedSeries} selectedModelId={selectedModel} onSeriesSelect={(id) => { setSelectedSeries(id); setSelectedModel(undefined); }} onModelSelect={setSelectedModel} productModelIds={modelIds} />
      </div>
      <Section title={t("home.best")} action={<ViewAll to="/products" label={t("home.viewAll")} />}>
        {productsLoading ? <ProductSectionSkeleton /> : selectedSeries && !selectedModel ? <p className="py-10 text-center text-sm text-subtle">{t("filter.chooseModel")}</p> : filteredBest.length ? <ProductGrid products={filteredBest} selectedModelId={selectedModel} /> : <p className="py-10 text-center text-sm text-subtle">{t("shop.empty")}</p>}
      </Section>
      <Section title={t("home.new")} action={<ViewAll to="/offers" label={t("home.viewAll")} />}>
        {productsLoading ? <ProductSectionSkeleton /> : selectedSeries && !selectedModel ? <p className="py-10 text-center text-sm text-subtle">{t("filter.chooseModel")}</p> : filteredNewest.length ? <ProductGrid products={filteredNewest} selectedModelId={selectedModel} /> : <p className="py-10 text-center text-sm text-subtle">{t("shop.empty")}</p>}
      </Section>
    </>
  );
}

function ProductSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[4/5] animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
