import type { DbModel, DbSeries } from "@/lib/db";
import { SeriesFilter } from "@/components/SeriesFilter";
import { ModelFilter } from "@/components/ModelFilter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Props = {
  series: DbSeries[];
  models: DbModel[];
  selectedSeriesId?: string;
  selectedModelId?: string;
  onSeriesSelect: (id?: string) => void;
  onModelSelect: (id?: string) => void;
  productModelIds?: Set<string>;
};

export function DeviceFilter({
  series,
  models,
  selectedSeriesId,
  selectedModelId,
  onSeriesSelect,
  onModelSelect,
  productModelIds,
}: Props) {
  const { t, pick } = useLang();
  const selectedSeries = series.find((item) => item.id === selectedSeriesId);
  const selectedModel = models.find((item) => item.id === selectedModelId);
  const BackIcon = typeof document !== "undefined" && document.documentElement.dir === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <div className="space-y-4">
      {/* Desktop keeps the original inline two-stage filter. */}
      <div className="hidden md:block space-y-4">
        <SeriesFilter
          series={series}
          selectedSeriesId={selectedSeriesId}
          onSelect={(id) => {
            onSeriesSelect(id);
            onModelSelect(undefined);
          }}
        />
        {selectedSeriesId && (
          <ModelFilter
            models={models}
            selectedModelId={selectedModelId}
            selectedSeriesId={selectedSeriesId}
            onSelect={onModelSelect}
            productModelIds={productModelIds}
          />
        )}
      </div>

      {/* Mobile presents each filter stage as its own page-like screen. */}
      <div className="md:hidden space-y-4">
        {!selectedSeriesId && (
          <SeriesFilter
            series={series}
            onSelect={(id) => {
              if (id) {
                onSeriesSelect(id);
                onModelSelect(undefined);
              }
            }}
          />
        )}

        {selectedSeriesId && !selectedModelId && (
          <>
            <button type="button" onClick={() => { onSeriesSelect(undefined); onModelSelect(undefined); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold">
              <BackIcon className="h-4 w-4" /> رجوع للفئات
            </button>
            <div className="rounded-2xl border border-border/70 bg-card/45 p-4">
              <h2 className="text-lg font-bold">{selectedSeries ? pick(selectedSeries.name_ar, selectedSeries.name_en) : t("filter.model.title")}</h2>
              <p className="mt-1 text-sm text-subtle">اختار الموديل لعرض المنتجات الخاصة به</p>
            </div>
            <ModelFilter
              models={models}
              selectedModelId={selectedModelId}
              selectedSeriesId={selectedSeriesId}
              onSelect={(id) => { if (id) onModelSelect(id); }}
              productModelIds={productModelIds}
            />
          </>
        )}

        {selectedSeriesId && selectedModelId && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/45 p-4">
            <div className="min-w-0">
              <p className="text-xs text-subtle">{selectedSeries ? pick(selectedSeries.name_ar, selectedSeries.name_en) : ""}</p>
              <h2 className="truncate text-base font-bold">{selectedModel ? pick(selectedModel.name_ar, selectedModel.name_en) : ""}</h2>
            </div>
            <button type="button" onClick={() => onModelSelect(undefined)} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold">
              <BackIcon className="h-4 w-4" /> تغيير الموديل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
