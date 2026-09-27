import type { DbModel, DbSeries } from "@/lib/db";
import { SeriesFilter } from "@/components/SeriesFilter";
import { ModelFilter } from "@/components/ModelFilter";

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
  return (
    <div className="space-y-4">
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
  );
}
