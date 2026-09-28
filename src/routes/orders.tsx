import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, Package, RefreshCw, Truck, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getLocalCustomerProfile, getMyOrders, type CustomerOrder } from "@/lib/db";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "طلباتي | SODFA صدفة" }] }),
  component: MyOrdersPage,
});

const statusMap: Record<string, { label: string; icon: typeof Clock3; cls: string }> = {
  pending: { label: "تم استلام الطلب", icon: Clock3, cls: "text-amber-400 bg-amber-400/10" },
  processing: { label: "جاري تجهيز الطلب", icon: Package, cls: "text-blue-400 bg-blue-400/10" },
  shipped: { label: "تم شحن الطلب", icon: Truck, cls: "text-purple-400 bg-purple-400/10" },
  delivered: { label: "تم التسليم", icon: CheckCircle2, cls: "text-emerald-400 bg-emerald-400/10" },
  cancelled: { label: "ملغي", icon: XCircle, cls: "text-red-400 bg-red-400/10" },
};

function MyOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [profile, setProfile] = useState(() => getLocalCustomerProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    const current = getLocalCustomerProfile();
    setProfile(current);
    if (!current) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setOrders(await getMyOrders(current));
    } catch (e: any) {
      setError(e?.message || "تعذر تحميل طلباتك.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const money = (value: number) => `${Number(value || 0).toLocaleString("ar-EG")} جنيه`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">طلباتي</h1>
          <p className="mt-2 text-sm leading-7 text-subtle">
            كل طلباتك المرتبطة برقم الموبايل المحفوظ على جهازك.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
          <RefreshCw size={16} /> تحديث
        </button>
      </div>

      {!profile && !loading && (
        <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-xl font-black">لسه مفيش بيانات عميل محفوظة</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-subtle">
            اعمل أول طلب، وبعد تأكيده هنحفظ بياناتك على جهازك وتقدر تشوف طلباتك من هنا.
          </p>
          <Link to="/products" className="bg-sodfa mt-5 inline-flex rounded-xl px-5 py-3 text-sm font-bold text-white">ابدأ التسوق</Link>
        </div>
      )}

      {error && <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-300">{error}</div>}

      {loading ? (
        <div className="mt-8 rounded-3xl border border-border bg-card p-12 text-center text-sm text-subtle">جاري تحميل طلباتك...</div>
      ) : profile && orders.length === 0 && !error ? (
        <div className="mt-8 rounded-3xl border border-border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-subtle" />
          <h2 className="mt-4 text-xl font-black">لا توجد طلبات محفوظة</h2>
          <p className="mt-2 text-sm text-subtle">لما تعمل طلب جديد هيظهر هنا تلقائيًا.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => {
            const status = statusMap[order.status] || statusMap.pending;
            const Icon = status.icon;
            return (
              <article key={order.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-subtle">رقم الطلب</p>
                    <h2 className="mt-1 text-lg font-black">#{order.order_number || String(order.id).slice(0, 8)}</h2>
                    <p className="mt-2 text-xs text-subtle">{new Date(order.created_at).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${status.cls}`}>
                    <Icon size={15} /> {status.label}
                  </div>
                </div>

                <div className="mt-5 divide-y divide-border rounded-2xl border border-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-4">
                      {item.image_url ? <img src={item.image_url} alt="" className="h-16 w-16 rounded-xl bg-white object-contain" /> : <div className="grid h-16 w-16 place-items-center rounded-xl bg-background"><Package size={20} className="text-subtle" /></div>}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{item.product_name}</p>
                        {item.variant_name && <p className="mt-1 text-xs text-primary-light">{item.variant_name}</p>}
                        <p className="mt-1 text-xs text-subtle">الكمية: {item.quantity} · سعر القطعة: {money(item.unit_price)}</p>
                      </div>
                      <strong className="shrink-0 text-sm">{money(item.total_price)}</strong>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-2 text-sm">
                  <div className="flex justify-between"><span>المجموع</span><span>{money(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span>الشحن</span><span>{money(order.shipping)}</span></div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-black"><span>الإجمالي</span><span>{money(order.total)}</span></div>
                </div>
                <div className="mt-4 rounded-2xl bg-background/60 p-4 text-xs leading-6 text-subtle">
                  <strong className="text-foreground">التوصيل:</strong> {order.governorate} — {order.address}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
