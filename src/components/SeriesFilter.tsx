import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbSeries } from "@/lib/db";

type Props = {
  series: DbSeries[];
  selectedSeriesId?: string;
  onSelect: (seriesId?: string) => void;
};

export function SeriesFilter({ series, selectedSeriesId, onSelect }: Props) {
  if (!series.length) return null;
  return (
    <section className="rounded-3xl border border-border/70 bg-card/45 p-4 shadow-[0_18px_50px_-35px_rgba(65,27,78,.45)] sm:p-5" aria-label="فلتر حسب السلسلة">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold sm:text-lg">اختار سلسلة جهازك</h2>
          <p className="mt-1 text-xs text-subtle">اختار السلسلة أولًا لعرض الموديلات التابعة لها.</p>
        </div>
        {selectedSeriesId && <button type="button" onClick={() => onSelect(undefined)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-subtle transition hover:border-primary/40 hover:text-foreground">إلغاء السلسلة</button>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {series.map((item) => {
          const active = selectedSeriesId === item.id;
          return <button key={item.id} type="button" onClick={() => onSelect(active ? undefined : item.id)} aria-pressed={active} className={cn("group relative min-w-0 overflow-hidden rounded-2xl border bg-transparent p-2.5 text-center transition-all duration-300 ease-out", active ? "border-primary bg-primary/8 shadow-[0_16px_35px_-24px_rgba(142,42,168,.75)]" : "border-border/80 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_16px_35px_-25px_rgba(80,32,95,.45)]")}>
            <span className="relative mx-auto block aspect-square max-w-[150px] overflow-hidden rounded-xl bg-white/40">
              <img src={item.image_url || "/placeholder.svg"} alt={item.name_ar || item.name_en} loading="lazy" className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover:-translate-y-2" />
              {active && <span className="absolute end-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-lg"><Check className="h-3.5 w-3.5" /></span>}
            </span>
            <span className="mt-2 block truncate text-xs font-bold sm:text-sm">{item.name_ar || item.name_en}</span>
            {item.name_en && item.name_ar && <span className="mt-0.5 block truncate text-[10px] text-subtle">{item.name_en}</span>}
          </button>;
        })}
      </div>
    </section>
  );
}
