import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Eye, MessageCircle, RefreshCw, Search, Trash2, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminPage } from "@/components/AdminShell";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const statuses = [
  ["pending", "تم الطلب"], ["processing", "جاري التجهيز"], ["shipped", "تم الشحن"], ["delivered", "تم التسليم"], ["cancelled", "ملغي"],
] as const;

function OrdersAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewLinks, setReviewLinks] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [details, setDetails] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const load = async () => {
    setError("");
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) { setError(error.message); return; }
    const orders = data || [];
    const ids = orders.map((o: any) => o.id);
    let grouped: Record<string, any[]> = {};
    if (ids.length) {
      const result = await supabase.from("order_items").select("*").in("order_id", ids);
      if (result.error) setError(result.error.message);
      grouped = (result.data || []).reduce((acc: Record<string, any[]>, item: any) => {
        (acc[item.order_id] ||= []).push(item); return acc;
      }, {});
    }
    setItems(orders);
    setOrderItems(grouped);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) => {
      const productNames = (orderItems[o.id] || []).map((i) => i.product_name || i.variant_name || "").join(" ");
      return [o.order_number, o.id, o.customer_name, o.customer_phone, productNames].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [items, orderItems, search]);

  const updateStatus = async (id: string, status: string) => {
    setBusy(id); setError("");
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setError(error.message); else await load();
    setBusy(null);
  };

  const deleteOrder = async (order: any) => {
    setBusy(order.id); setError("");
    try {
      const { error } = await supabase.rpc("delete_order_admin", { p_order_id: order.id });
      if (error) throw error;
      setConfirmDelete(null);
      if (details?.id === order.id) setDetails(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "تعذر حذف الطلب.");
    } finally { setBusy(null); }
  };

  const requestReview = async (order: any) => {
    setBusy(order.id); setError("");
    try {
      let token = "";
      const existing = await supabase.from("review_requests").select("token,expires_at,submitted_at").eq("order_id", order.id).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data?.token && !existing.data.submitted_at && new Date(existing.data.expires_at) > new Date()) token = existing.data.token;
      if (!token) {
        token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
        const payload = { order_id: order.id, token, expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), submitted_at: null, customer_name: order.customer_name || "", customer_phone: order.customer_phone || "" };
        if (existing.data?.token) {
          const updated = await supabase.from("review_requests").update(payload).eq("order_id", order.id);
          if (updated.error) throw updated.error;
        } else {
          const inserted = await supabase.from("review_requests").insert(payload);
          if (inserted.error) throw inserted.error;
        }
      }
      await supabase.from("orders").update({ review_requested_at: new Date().toISOString() }).eq("id", order.id);
      const url = `${window.location.origin}/review/${token}`;
      setReviewLinks((current) => ({ ...current, [order.id]: url }));
      const number = String(order.customer_phone || "").replace(/\D/g, "");
      if (!number) throw new Error("رقم العميل غير موجود في الطلب.");
      const message = `أهلاً ${order.customer_name || "بيك"} ❤️\n\nسعداء إن طلبك وصل بنجاح. نحب نعرف رأيك في كل منتج وتجربتك مع SODFA ⭐\n\nقيّم كل منتج وخدمة التوصيل من هنا:\n${url}\n\nشكرًا لثقتك في صدفة ❤️`;
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      await load();
    } catch (e: any) { setError(e?.message || "تعذر تجهيز رابط التقييم."); }
    finally { setBusy(null); }
  };

  const money = (v: any) => `${Number(v || 0).toLocaleString("ar-EG")} جنيه`;

  return <AdminGuard><AdminPage>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-extrabold text-black">الطلبات</h1><p className="mt-1 text-sm text-slate-600">إدارة الحالة، تفاصيل الطلب، البحث والحذف.</p></div>
      <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-black"><RefreshCw size={16}/>تحديث</button>
    </div>
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="relative min-w-[280px] flex-1"><Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث برقم الطلب أو اسم المنتج..." className="h-11 w-full rounded-xl border border-slate-300 bg-white pe-10 ps-4 text-sm text-black outline-none focus:border-violet-500"/></div>
      <span className="text-xs font-semibold text-slate-600">{filtered.length} طلب</span>
    </div>
    {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4">
      {filtered.length === 0 ? <Card className="border-slate-200 bg-white"><CardContent className="p-10 text-center text-slate-500">لا توجد نتائج.</CardContent></Card> : filtered.map((o) => {
        const delivered = o.status === "delivered";
        const oi = orderItems[o.id] || [];
        return <Card key={o.id} className="border-slate-200 bg-white"><CardContent className="p-5 text-black">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="font-bold">#{o.order_number || String(o.id).slice(0, 8)}</div>
              <div className="text-sm text-slate-600">{o.customer_name || "بدون اسم"} · {o.customer_phone || "بدون هاتف"}</div>
              <div className="mt-1 text-xs text-slate-500">{o.created_at ? new Date(o.created_at).toLocaleString("ar-EG") : ""}</div>
              {oi.length > 0 && <div className="mt-2 text-xs text-slate-600">المنتجات: {oi.map((x) => x.product_name).filter(Boolean).join("، ")}</div>}
            </div>
            <div className="text-xl font-black">{money(o.total ?? o.total_amount)}</div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-sm font-semibold">حالة الطلب
              <select value={o.status || "pending"} disabled={busy === o.id} onChange={(e) => void updateStatus(o.id, e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-black">
                {statuses.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDetails(o)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-black"><Eye size={16}/> التفاصيل</button>
              {delivered && <button disabled={busy === o.id} onClick={() => void requestReview(o)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a64cc1] to-[#6e2d8b] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><MessageCircle size={17}/>{busy === o.id ? "جاري التجهيز..." : "طلب تقييم"}</button>}
              <button disabled={busy === o.id} onClick={() => setConfirmDelete(o)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700"><Trash2 size={16}/> حذف</button>
            </div>
          </div>
        </CardContent></Card>;
      })}
    </div>

    {details && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={() => setDetails(null)}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 text-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">تفاصيل الطلب</h2><p className="mt-1 text-sm text-slate-500">#{details.order_number || details.id}</p></div><button onClick={() => setDetails(null)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200"><X size={18}/></button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
          <div><b>اسم العميل:</b> {details.customer_name || "-"}</div>
          <div><b>رقم الطلب:</b> #{details.order_number || details.id}</div>
          <div><b>رقم الهاتف:</b> {details.customer_phone || "-"}</div>
          <div><b>تاريخ الطلب:</b> {details.created_at ? new Date(details.created_at).toLocaleString("ar-EG") : "-"}</div>
          <div><b>الحالة:</b> {statuses.find((x) => x[0] === details.status)?.[1] || details.status || "-"}</div>
          {details.payment_method && <div><b>طريقة الدفع:</b> {details.payment_method}</div>}
          {details.payment_status && <div><b>حالة الدفع:</b> {details.payment_status}</div>}
          {details.shipping_method && <div><b>طريقة الشحن:</b> {details.shipping_method}</div>}
          <div className="sm:col-span-2"><b>عنوان العميل:</b> {[details.governorate, details.city, details.area, details.address].filter(Boolean).join(" — ") || "-"}</div>
          {details.postal_code && <div><b>الرمز البريدي:</b> {details.postal_code}</div>}
          {details.notes && <div className="sm:col-span-2"><b>ملاحظات:</b> {details.notes}</div>}
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200">
          {(orderItems[details.id] || []).map((item, index) => <div key={item.id || `${details.id}-${index}`} className="border-b border-slate-100 p-4 last:border-b-0">
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold">{item.product_name || item.name_ar || item.name_en || "منتج"}</p>
                {item.variant_name && <p className="mt-1 text-xs text-slate-500">التفريعة: {item.variant_name}</p>}
                {item.shape && <p className="mt-1 text-xs text-slate-500">الشكل: {item.shape}</p>}
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                  <span>الكمية: {item.quantity ?? 0}</span>
                  <span>سعر الوحدة: {money(item.unit_price)}</span>
                  {item.sku && <span>SKU: {item.sku}</span>}
                  {item.barcode && <span>Barcode: {item.barcode}</span>}
                  {item.product_id && <span>Product ID: {item.product_id}</span>}
                  {item.variant_id && <span>Variant ID: {item.variant_id}</span>}
                </div>
              </div>
              <strong className="shrink-0">{money(item.total_price ?? (Number(item.unit_price || 0) * Number(item.quantity || 0)))}</strong>
            </div>
          </div>)}
        </div>
        <div className="mt-5 space-y-2 text-sm"><div className="flex justify-between"><span>المجموع</span><b>{money(details.subtotal ?? details.subtotal_amount)}</b></div><div className="flex justify-between"><span>الشحن</span><b>{money(details.shipping ?? details.shipping_cost)}</b></div><div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black"><span>الإجمالي</span><b>{money(details.total ?? details.total_amount)}</b></div></div>
      </div>
    </div>}

    {confirmDelete && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-black shadow-2xl">
        <h2 className="text-xl font-black">تأكيد حذف الطلب</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">هل أنت متأكد من حذف الطلب #{confirmDelete.order_number || String(confirmDelete.id).slice(0,8)}؟ سيتم حذف تفاصيله المرتبطة من لوحة الطلبات.</p>
        <div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold">إلغاء</button><button disabled={busy === confirmDelete.id} onClick={() => void deleteOrder(confirmDelete)} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">{busy === confirmDelete.id ? "جاري الحذف..." : "نعم، احذف الطلب"}</button></div>
      </div>
    </div>}
  </AdminPage></AdminGuard>;
}
