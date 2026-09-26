import { useMemo, useState } from "react";
import { Search, Smartphone, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ProductCard } from "./ProductCard";
import type { StoreProduct } from "@/lib/db";

export function FindYourPhone({ products = [] }: { products?: StoreProduct[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return [];
    return products.filter((p) => {
      const haystack = [p.name.ar, p.name.en, p.description.ar, p.description.en, ...(p.models ?? []), ...p.variants.flatMap((v) => [v.name, v.value ?? "", v.color ?? ""])].join(" ").toLowerCase();
      return normalized.split(/\s+/).every((word) => haystack.includes(word));
    }).slice(0, 8);
  }, [products, normalized]);

  const suggestions = useMemo(() => [...new Set(products.flatMap((p) => p.models ?? []).filter(Boolean))].slice(0, 20), [products]);

  return (
    <section className="sodfa-section-motion h-full px-0 py-0">
      <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="bg-sodfa pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full opacity-10 blur-3xl" aria-hidden />
        <div className="relative">
          <div className="flex items-start gap-3">
            <span className="bg-sodfa grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-sm"><Smartphone size={20}/></span>
            <div><h2 className="text-xl font-bold sm:text-2xl">{t("find.title")}</h2></div>
          </div>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-subtle" size={18}/>
            <input value={query} onChange={(e) => setQuery(e.target.value)} list="sodfa-phone-models" placeholder={t("find.placeholder")} className="h-14 w-full rounded-2xl border border-border bg-input pe-12 ps-12 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" />
            {query && <button type="button" onClick={() => setQuery("")} className="absolute end-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl hover:bg-card"><X size={16}/></button>}
            <datalist id="sodfa-phone-models">{suggestions.map((s) => <option key={s} value={s}/>)}</datalist>
          </div>

          <div className="mt-7">
            {!normalized ? <p className="text-sm leading-6 text-subtle">{t("find.empty")}</p> : results.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-7 text-center"><p className="text-sm text-subtle">{t("find.noResults")} “{query}”</p></div> : (
              <>
                <div className="mb-4 flex items-center justify-between"><p className="text-xs tracking-widest text-subtle uppercase">{t("find.results")} — {query}</p><span className="text-xs text-subtle">{results.length} {t("find.resultCount")}</span></div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">{results.slice(0, 4).map((p) => <ProductCard key={p.id} product={p}/>)}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
