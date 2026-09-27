import { ChevronDown, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { DbModel } from "@/lib/db";

type ModelFilterProps = {
  models: DbModel[];
  selectedModelId?: string;
  onSelect: (modelId?: string) => void;
  title?: string;
  productModelIds?: Set<string>;
  selectedSeriesId?: string;
};

export function ModelFilter({
  models,
  selectedModelId,
  onSelect,
  title = "فلتر حسب الموديل",
  productModelIds,
  selectedSeriesId,
}: ModelFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleModels = useMemo(() => {
    const filtered = models.filter((m) => {
      if (selectedSeriesId && m.series_id !== selectedSeriesId) return false;
      return productModelIds ? productModelIds.has(m.id) : true;
    });
    return filtered;
  }, [models, productModelIds, selectedSeriesId]);

  if (!visibleModels.length) return null;

  const shown = expanded ? visibleModels : visibleModels.slice(0, 5);
  const hasMore = visibleModels.length > 5;

  return (
    <section className="rounded-3xl border border-border/70 bg-card/45 p-4 shadow-[0_18px_50px_-35px_rgba(65,27,78,.45)] sm:p-5" aria-label={title}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          <p className="mt-1 text-xs text-subtle">اختار موديل لعرض المنتجات الخاصة به فقط.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedModelId && (
            <button
              type="button"
              onClick={() => onSelect(undefined)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-subtle transition hover:border-primary/40 hover:text-foreground"
            >
              إلغاء الفلتر
            </button>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary-dark transition hover:-translate-y-0.5 hover:bg-primary/10"
            >
              {expanded ? "إخفاء الموديلات" : `عرض الكل (${visibleModels.length})`}
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded && "rotate-180")} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((model) => {
          const active = selectedModelId === model.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelect(active ? undefined : model.id)}
              aria-pressed={active}
              className={cn(
                "group relative min-w-0 overflow-hidden rounded-2xl border bg-transparent p-2.5 text-center transition-all duration-300 ease-out",
                active
                  ? "border-primary bg-primary/8 shadow-[0_16px_35px_-24px_rgba(142,42,168,.75)]"
                  : "border-border/80 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_16px_35px_-25px_rgba(80,32,95,.45)]",
              )}
            >
              <span className="relative mx-auto block aspect-square max-w-[150px] overflow-hidden rounded-xl bg-white/40">
                <img
                  src={model.image_url || "/placeholder.svg"}
                  alt={model.name_ar || model.name_en}
                  loading="lazy"
                  className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:-translate-y-2"
                />
                {active && (
                  <span className="absolute end-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-lg">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </span>
              <span className="mt-2 block truncate text-xs font-bold sm:text-sm">{model.name_ar || model.name_en}</span>
              {model.name_en && model.name_ar && (
                <span className="mt-0.5 block truncate text-[10px] text-subtle">{model.name_en}</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
