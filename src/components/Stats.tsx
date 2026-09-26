import { useLang, type TKey } from "@/lib/i18n";

const stats: Array<{ n: TKey; t: TKey }> = [
  { n: "stats.1.n", t: "stats.1.t" },
  { n: "stats.2.n", t: "stats.2.t" },
  { n: "stats.3.n", t: "stats.3.t" },
  { n: "stats.4.n", t: "stats.4.t" },
];

export function Stats() {
  const { t } = useLang();
  return (
    <section className="sodfa-section-motion h-full px-0 py-0">
      <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-9">
        <div className="bg-sodfa pointer-events-none absolute -bottom-32 end-0 h-64 w-64 rounded-full opacity-10 blur-3xl" aria-hidden />
        <div className="relative grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-7 sm:gap-y-9 lg:grid-cols-2 lg:content-center">
          {stats.map((s) => (
            <div key={s.n} className="min-w-0 text-center transition-transform duration-500 hover:-translate-y-1">
              <div className="text-gradient text-2xl font-bold sm:text-4xl">{t(s.n)}</div>
              <div className="mt-1 text-xs text-subtle sm:text-sm">{t(s.t)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
