import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { listCustomerReviews, type CustomerReview } from "@/lib/db";
import { useLang } from "@/lib/i18n";

export function CustomerReviews() {
  const { t } = useLang();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  useEffect(() => { listCustomerReviews(true).then(setReviews).catch(() => setReviews([])); }, []);
  if (!reviews.length) return null;
  return (
    <section className="sodfa-section-motion w-full overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 text-center sm:mb-9">
          <span className="text-gradient text-xs font-bold tracking-[0.22em]">{t("reviews.eyebrow")}</span>
          <h2 className="mt-2 text-2xl font-black sm:text-4xl">{t("reviews.title")}</h2>
          <p className="mt-2 text-sm text-subtle sm:text-base">{t("reviews.sub")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-5 shadow-card backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-lg sm:p-6">
              <Quote className="absolute -left-1 -top-2 h-20 w-20 text-primary/10" />
              <div className="relative flex items-center gap-3">
                {review.customer_image_url ? <img src={review.customer_image_url} alt={review.customer_name} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" decoding="async" /> : <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary-light/30 to-primary/10 font-bold text-primary-light">{review.customer_name.slice(0,1)}</div>}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{review.customer_name}</h3>
                  <div className="mt-1 flex items-center gap-0.5" aria-label={`${review.rating} / 5`}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < review.rating ? "h-4 w-4 fill-current text-primary-light" : "h-4 w-4 text-muted-foreground/30"} />)}
                  </div>
                </div>
              </div>
              {review.review_text && <p className="relative mt-5 text-sm leading-7 text-foreground/70">“{review.review_text}”</p>}
              {review.image_url && <img src={review.image_url} alt={t("reviews.imageAlt")} loading="lazy" className="relative mt-4 max-h-56 w-full rounded-2xl object-cover" />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
