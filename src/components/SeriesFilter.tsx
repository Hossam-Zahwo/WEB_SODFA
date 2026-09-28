import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbSeries } from "@/lib/db";
import { useLang } from "@/lib/i18n";

type Props = {
  series: DbSeries[];
  selectedSeriesId?: string;
  onSelect: (seriesId?: string) => void;
};

export function SeriesFilter({ series, selectedSeriesId, onSelect }: Props) {
  const { t, pick } = useLang();
  if (!series.length) return null;
  return (
    <section className="rounded-3xl border border-border/70 bg-card/45 p-4 shadow-[0_18px_50px_-35px_rgba(65,27,78,.45)] sm:p-5" aria-label={t("filter.series.title")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold sm:text-lg">{t("filter.series.title")}</h2>
          <p className="mt-1 text-xs text-subtle">{t("filter.series.sub")}</p>
        </div>
        {selectedSeriesId && <button type="button" onClick={() => onSelect(undefined)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-subtle transition hover:border-primary/40 hover:text-foreground">{t("filter.series.clear")}</button>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {series.map((item) => {
          const active = selectedSeriesId === item.id;
          return <button key={item.id} type="button" onClick={() => onSelect(active ? undefined : item.id)} aria-pressed={active} className={cn("group relative z-0 min-w-0 overflow-visible rounded-2xl bg-transparent p-1.5 text-center transition-all duration-300 ease-out", active ? "bg-primary/8 shadow-[0_16px_35px_-24px_rgba(142,42,168,.30)]" : "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(80,32,95,.38)]")}>
            <span className="relative z-0 mx-auto block aspect-square max-w-[170px] overflow-visible rounded-xl bg-white/25">
              <img src={item.image_url || "/placeholder.svg"} alt={pick(item.name_ar, item.name_en)} loading="lazy" className="h-full w-full object-contain p-1 transition-transform duration-500 ease-out relative z-0 group-hover:z-30 group-hover:-translate-y-2 group-hover:scale-[1.045]" />
              {active && <span className="absolute end-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-lg"><Check className="h-3.5 w-3.5" /></span>}
            </span>
            <span className="mt-2 block truncate text-xs font-bold sm:text-sm">{pick(item.name_ar, item.name_en)}</span>
            {item.name_en && item.name_ar && <span className="mt-0.5 block truncate text-[10px] text-subtle">{item.name_en}</span>}
          </button>;
        })}
      </div>
    </section>
  );
}
