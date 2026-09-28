import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ImagePlus, Loader2, ShieldCheck, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getReviewRequest, submitCustomerProductReview, submitCustomerServiceReview, uploadCustomerReviewImage } from "@/lib/db";

export const Route = createFileRoute("/review/$token")({
  head: () => ({ meta: [{ title: "قيّم تجربتك | SODFA صدفة" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ReviewPage,
});

type ReviewDraft = { rating: number; text: string; image: File | null; preview: string; saved: boolean; busy: boolean; error: string };

function emptyDraft(): ReviewDraft {
  return { rating: 0, text: "", image: null, preview: "", saved: false, busy: false, error: "" };
}

function ReviewBox({
  title, subtitle, draft, setDraft, onSubmit,
}: { title: string; subtitle?: string; draft: ReviewDraft; setDraft: (next: ReviewDraft) => void; onSubmit: () => void }) {
  const chooseImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setDraft({ ...draft, error: "من فضلك اختر صورة فقط." });
    if (file.size > 4 * 1024 * 1024) return setDraft({ ...draft, error: "حجم الصورة يجب ألا يتجاوز 4MB." });
    if (draft.preview) URL.revokeObjectURL(draft.preview);
    setDraft({ ...draft, image: file, preview: URL.createObjectURL(file), error: "" });
  };
  return <div className="rounded-2xl border border-border bg-background/50 p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Star size={22}/></div>
      <div><h3 className="font-black">{title}</h3>{subtitle && <p className="mt-1 text-xs leading-6 text-subtle">{subtitle}</p>}</div>
    </div>
    {draft.saved ? <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-400"><CheckCircle2 size={18}/> تم إرسال التقييم بنجاح، ويدخل الآن للمراجعة.</div> : <>
      <div className="mt-5 flex gap-1" dir="ltr">{[1,2,3,4,5].map((n) => <button key={n} type="button" onClick={() => setDraft({ ...draft, rating: n })} className="rounded-lg p-1 hover:scale-105"><Star className={n <= draft.rating ? "h-8 w-8 fill-amber-400 text-amber-400" : "h-8 w-8 text-slate-500"}/></button>)}</div>
      <textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} rows={3} maxLength={1000} className="mt-4 w-full resize-none rounded-xl border border-border bg-input p-3 text-sm outline-none focus:border-primary" placeholder="اكتب رأيك (اختياري)"/>
      <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-3"><ImagePlus size={18} className="text-primary"/><span className="flex-1 truncate text-xs text-subtle">{draft.image?.name || "صورة اختيارية — حتى 4MB"}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => chooseImage(e.target.files?.[0] || null)}/></label>
      {draft.preview && <div className="mt-3 relative w-fit"><img src={draft.preview} alt="" className="h-20 w-20 rounded-xl object-cover"/><button type="button" onClick={() => { URL.revokeObjectURL(draft.preview); setDraft({ ...draft, image: null, preview: "" }); }} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-black text-white"><X size={13}/></button></div>}
      {draft.error && <p className="mt-3 text-xs text-red-400">{draft.error}</p>}
      <button type="button" disabled={draft.busy} onClick={onSubmit} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sodfa px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{draft.busy && <Loader2 size={16} className="animate-spin"/>}إرسال التقييم</button>
    </>}
  </div>;
}

function ReviewPage() {
  const { token } = Route.useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [productDrafts, setProductDrafts] = useState<Record<string, ReviewDraft>>({});
  const [serviceDraft, setServiceDraft] = useState<ReviewDraft>(emptyDraft());

  useEffect(() => {
    let alive = true;
    getReviewRequest(token).then((data) => {
      if (!alive) return;
      setRequest(data);
      if (data?.customer_name) setName(data.customer_name);
      const initial: Record<string, ReviewDraft> = {};
      (data?.items || []).forEach((item: any) => { initial[item.order_item_id] = { ...emptyDraft(), saved: Boolean(item.reviewed) }; });
      setProductDrafts(initial);
      setServiceDraft({ ...emptyDraft(), saved: Boolean(data?.service_reviewed) });
      setLoading(false);
    }).catch((e) => { if (alive) { setError(e?.message || "رابط التقييم غير صالح أو انتهت صلاحيته."); setLoading(false); } });
    return () => { alive = false; };
  }, [token]);

  const submitProduct = async (item: any) => {
    const draft = productDrafts[item.order_item_id] || emptyDraft();
    if (!draft.rating) return setProductDrafts((p) => ({ ...p, [item.order_item_id]: { ...draft, error: "اختار عدد النجوم أولًا." } }));
    if (!name.trim()) return setError("اكتب اسمك أولًا.");
    setProductDrafts((p) => ({ ...p, [item.order_item_id]: { ...draft, busy: true, error: "" } }));
    try {
      let imageUrl = null;
      if (draft.image) imageUrl = await uploadCustomerReviewImage(draft.image, `${token}-${item.order_item_id}`);
      await submitCustomerProductReview({ orderId: request.order_id, token, orderItemId: item.order_item_id, productId: item.product_id, variantId: item.variant_id, customerName: name, rating: draft.rating, reviewText: draft.text, imageUrl });
      setProductDrafts((p) => ({ ...p, [item.order_item_id]: { ...draft, busy: false, saved: true } }));
    } catch (e: any) {
      setProductDrafts((p) => ({ ...p, [item.order_item_id]: { ...draft, busy: false, error: e?.message || "تعذر إرسال التقييم." } }));
    }
  };

  const submitService = async () => {
    if (!serviceDraft.rating) return setServiceDraft({ ...serviceDraft, error: "اختار عدد النجوم أولًا." });
    if (!name.trim()) return setError("اكتب اسمك أولًا.");
    setServiceDraft({ ...serviceDraft, busy: true, error: "" });
    try {
      let imageUrl = null;
      if (serviceDraft.image) imageUrl = await uploadCustomerReviewImage(serviceDraft.image, `${token}-service`);
      await submitCustomerServiceReview({ orderId: request.order_id, token, customerName: name, rating: serviceDraft.rating, reviewText: serviceDraft.text, imageUrl });
      setServiceDraft({ ...serviceDraft, busy: false, saved: true });
    } catch (e: any) {
      setServiceDraft({ ...serviceDraft, busy: false, error: e?.message || "تعذر إرسال تقييم الخدمة." });
    }
  };

  const allDone = Boolean(request && (request.items || []).every((x: any) => x.reviewed) && request.service_reviewed);

  return <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-3xl">
      <section className="rounded-[2rem] border border-border bg-card p-5 shadow-2xl sm:p-8">
        {loading ? <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div> : !request ? (
          <div className="py-10 text-center"><X className="mx-auto h-12 w-12 text-red-400"/><h1 className="mt-4 text-xl font-bold">رابط التقييم غير متاح</h1><p className="mt-2 text-sm leading-7 text-subtle">{error || "الرابط غير صالح أو انتهت صلاحيته."}</p><Link to="/" className="mt-6 inline-flex rounded-xl border border-border px-5 py-3 text-sm font-semibold">العودة للمتجر</Link></div>
        ) : (
          <>
            <div className="text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><ShieldCheck size={28}/></div><h1 className="mt-5 text-2xl font-black sm:text-3xl">قيّم كل جزء من تجربتك ❤️</h1><p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-subtle">تقدر تقيم كل منتج لوحده، وبعدها تقييم خدمة SODFA بشكل منفصل. كل تقييم يدخل المراجعة قبل ظهوره.</p></div>
            <div className="mt-7"><label className="block text-sm font-semibold">اسمك<input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="mt-2 h-12 w-full rounded-xl border border-border bg-input px-4 outline-none focus:border-primary"/></label></div>
            {error && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
            <div className="mt-7 space-y-4">
              <h2 className="text-xl font-black">تقييم المنتجات</h2>
              {(request.items || []).map((item: any) => <div key={item.order_item_id}>
                <ReviewBox title={item.product_name} subtitle={item.variant_name ? `التفريعة: ${item.variant_name}` : undefined} draft={productDrafts[item.order_item_id] || emptyDraft()} setDraft={(next) => setProductDrafts((p) => ({ ...p, [item.order_item_id]: next }))} onSubmit={() => void submitProduct(item)} />
              </div>)}
            </div>
            <div className="mt-8 space-y-4"><h2 className="text-xl font-black">تقييم خدمة SODFA</h2><ReviewBox title="الخدمة والتوصيل" subtitle="التقييم هنا خاص بتجربة الخدمة وليس المنتج نفسه." draft={serviceDraft} setDraft={setServiceDraft} onSubmit={() => void submitService()}/></div>
            {allDone && <div className="mt-7 rounded-2xl bg-emerald-500/10 p-5 text-center"><CheckCircle2 className="mx-auto text-emerald-400"/><p className="mt-2 font-bold">شكرًا! خلصت كل التقييمات ❤️</p><Link to="/" className="mt-4 inline-flex rounded-xl bg-sodfa px-5 py-2.5 text-sm font-bold text-white">العودة للمتجر</Link></div>}
          </>
        )}
      </section>
    </div>
  </main>;
}
