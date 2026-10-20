import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Eye, MessageCircle, RefreshCw, Search, Trash2, Truck, X, PackageCheck, CircleHelp, CalendarDays, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminPage } from "@/components/AdminShell";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const statuses = [
  ["pending", "تم الطلب / Pending"], ["processing", "جاري التجهيز / Processing"], ["shipped", "تم الشحن / Shipped"], ["delivered", "تم التسليم / Delivered"], ["cancelled", "ملغي / Cancelled"],
] as const;

function OrdersAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewLinks, setReviewLinks] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [details, setDetails] = useState<any | null>(null);
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [customersOpen, setCustomersOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const knownOrderIds = useState<Set<string>>(new Set())[0];
  const initializedNotifications = useState({ value: false })[0];

  const playOrderSound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      [880, 1175, 1568].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + index * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + index * 0.16 + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.16 + 0.14);
        oscillator.connect(gain); gain.connect(ctx.destination);
        oscillator.start(ctx.currentTime + index * 0.16);
        oscillator.stop(ctx.currentTime + index * 0.16 + 0.15);
      });
      window.setTimeout(() => void ctx.close(), 900);
    } catch { /* Audio may be blocked until the user interacts with the page. */ }
  };

  const enableOrderNotifications = async () => {
    if ("Notification" in window) {
      try {
        const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
        setNotificationsEnabled(permission === "granted");
      } catch { setNotificationsEnabled(false); }
    }
    setSoundEnabled(true);
    playOrderSound();
  };

  const load = async () => {
    setError("");
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) { setError(error.message); return; }
    const orders = data || [];
    if (!initializedNotifications.value) {
      orders.forEach((o: any) => knownOrderIds.add(String(o.id)));
      initializedNotifications.value = true;
    } else {
      const newOrders = orders.filter((o: any) => o.id && !knownOrderIds.has(String(o.id)));
      newOrders.forEach((o: any) => {
        knownOrderIds.add(String(o.id));
        const body = `طلب #${o.order_number || String(o.id).slice(0, 8)} من ${o.customer_name || "عميل جديد"} — ${Number(o.total ?? o.total_amount ?? 0).toLocaleString("ar-EG")} جنيه`;
        if (soundEnabled) playOrderSound();
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification("طلب جديد من SODFA", { body, tag: String(o.id), icon: "/favicon.ico" }); } catch {}
        }
      });
    }
    const ids = orders.map((o: any) => o.id);
    let grouped: Record<string, any[]> = {};
    if (ids.length) {
      const result = await supabase.from("order_items").select("*").in("order_id", ids);
      if (result.error) setError(result.error.message);
      let loadedItems: any[] = result.data || [];
      const productIds = [...new Set(loadedItems.map((item: any) => item.product_id).filter(Boolean))];
      if (productIds.length) {
        const productsResult = await supabase.from("products").select("id,image_url,primary_image_url,image_urls,stock_quantity").in("id", productIds);
        if (!productsResult.error) {
          const productsById = new Map((productsResult.data || []).map((product: any) => [String(product.id), product]));
          loadedItems = loadedItems.map((item: any) => {
            const product: any = productsById.get(String(item.product_id));
            const images = Array.isArray(product?.image_urls) ? product.image_urls : [];
            return { ...item, available_stock: product?.stock_quantity ?? null, image_url: item.image_url || item.product_image_url || product?.primary_image_url || product?.image_url || images[0] || null };
          });
        }
      }
      grouped = loadedItems.reduce((acc: Record<string, any[]>, item: any) => {
        (acc[item.order_id] ||= []).push(item); return acc;
      }, {});
    }

    // Some versions of create_public_order_v2 keep the order lines as JSON on
    // the order row instead of inserting rows into order_items. Use that saved
    // snapshot as a fallback so the admin modal never silently shows an empty
    // products section for a valid order.
    const parseOrderLines = (order: any): any[] => {
      const candidates = [order.items, order.order_items, order.cart_items, order.products, order.order_details];
      for (const candidate of candidates) {
        let value = candidate;
        if (typeof value === "string") {
          try { value = JSON.parse(value); } catch { continue; }
        }
        if (Array.isArray(value) && value.length) {
          return value.map((line: any, index: number) => {
            const quantity = Number(line.quantity ?? line.qty ?? line.count ?? 1);
            const unitPrice = Number(line.unit_price ?? line.price ?? line.sale_price ?? line.unitPrice ?? 0);
            return {
              ...line,
              id: line.id ?? line.order_item_id ?? `${order.id}-json-${index}`,
              order_id: order.id,
              product_id: line.product_id ?? line.productId ?? line.id_product ?? null,
              variant_id: line.variant_id ?? line.variantId ?? null,
              product_name: line.product_name ?? line.name ?? line.name_ar ?? line.title ?? "منتج",
              variant_name: line.variant_name ?? line.variantName ?? null,
              quantity,
              unit_price: unitPrice,
              total_price: Number(line.total_price ?? line.line_total ?? line.total ?? unitPrice * quantity),
              image_url: line.image_url ?? line.product_image_url ?? line.primary_image_url ?? line.image ?? line.photo ?? null,
              available_stock: null,
            };
          });
        }
      }
      return [];
    };
    for (const order of orders) {
      const currentLines = grouped[String(order.id)] || [];
      if (!currentLines.length) {
        const fallbackLines = parseOrderLines(order);
        if (fallbackLines.length) grouped[String(order.id)] = fallbackLines;
      }
    }

    // Resolve missing images and live stock for JSON-snapshot lines too.
    const allLines = Object.values(grouped).flat();
    const productIdsForFallback = [...new Set(allLines.map((line: any) => line.product_id).filter(Boolean).map(String))];
    if (productIdsForFallback.length) {
      const productResult = await supabase.from("products").select("id,image_url,primary_image_url,image_urls,stock_quantity").in("id", productIdsForFallback);
      if (!productResult.error) {
        const productMap = new Map((productResult.data || []).map((product: any) => [String(product.id), product]));
        for (const key of Object.keys(grouped)) {
          grouped[key] = grouped[key].map((line: any) => {
            const product: any = productMap.get(String(line.product_id));
            const images = Array.isArray(product?.image_urls) ? product.image_urls : [];
            return {
              ...line,
              available_stock: line.available_stock ?? product?.stock_quantity ?? null,
              image_url: line.image_url || line.product_image_url || line.primary_image_url || product?.primary_image_url || product?.image_url || images[0] || null,
            };
          });
        }
      }
    }
    setItems(orders);
    setOrderItems(grouped);
  };

  useEffect(() => {
    void load();
    const channel = supabase.channel("admin-new-store-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload: any) => {
        const order = payload.new || {};
        if (!order.id || knownOrderIds.has(String(order.id))) return;
        knownOrderIds.add(String(order.id));
        if (!initializedNotifications.value) return;
        const title = "طلب جديد من SODFA";
        const body = `طلب #${order.order_number || String(order.id).slice(0, 8)} من ${order.customer_name || "عميل جديد"} — ${Number(order.total ?? order.total_amount ?? 0).toLocaleString("ar-EG")} جنيه`;
        if (soundEnabled) playOrderSound();
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification(title, { body, tag: String(order.id), icon: "/favicon.ico" }); } catch {}
        }
        setError("");
        void load();
      })
      .subscribe();
    const poll = window.setInterval(() => { void load(); }, 30000);
    return () => { window.clearInterval(poll); void supabase.removeChannel(channel); };
  }, [soundEnabled]);

  const todayStats = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const today = items.filter((o) => {
      const created = new Date(o.created_at || 0).getTime();
      return created >= start && created < end && o.status !== "cancelled";
    });
    return { count: today.length, total: today.reduce((sum, o) => sum + Number(o.total ?? o.total_amount ?? 0), 0) };
  }, [items]);

  const toggleCustomers = async () => {
    if (customersOpen) { setCustomersOpen(false); return; }
    setCustomersOpen(true);
    setCustomersLoading(true);
    const { data, error } = await supabase.from("customers").select("id,full_name,phone,governorate,address,orders_count,total_spent,last_order_at,marketing_opt_in").order("last_order_at", { ascending: false });
    if (error) setError(`تعذر تحميل دليل العملاء / Could not load customers: ${error.message}`);
    else setCustomers(data || []);
    setCustomersLoading(false);
  };

  const confirmOrder = async (order: any) => {
    const lines = orderItems[order.id] || [];
    const unchecked = lines.filter((item: any, index: number) => !reviewedItems[String(item.id || `${order.id}-${index}`)]);
    if (unchecked.length) { setError(`راجع واعتمد كل المنتجات داخل تفاصيل الطلب أولاً. المنتجات غير المعتمدة: ${unchecked.length}`); setDetails(order); return; }
    const shortage = lines.filter((item: any) => item.available_stock !== null && item.available_stock !== undefined && Number(item.available_stock) < Number(item.quantity || 0));
    if (shortage.length) { setError(`لا يمكن تأكيد الطلب: توجد ${shortage.length} قطعة/منتج بكمية مطلوبة أكبر من المخزون المتاح. راجع المخزون أولاً.`); setDetails(order); return; }
    setBusy(order.id); setError("");
    try {
      const { error } = await supabase.rpc("confirm_store_order_inventory", { p_order_id: order.id });
      if (error) throw error;
      await load();
      setDetails((current: any) => current?.id === order.id ? { ...current, status: "processing", inventory_deducted_at: new Date().toISOString() } : current);
    } catch (e: any) {
      setError(e?.message || "تعذر تأكيد الطلب وخصم المخزون.");
    } finally { setBusy(null); }
  };

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
      <div><div className="flex items-center gap-3"><h1 className="text-3xl font-extrabold text-slate-950">الطلبات <span className="text-base font-semibold text-slate-400">/ Orders</span></h1><button title="مساعدة الصفحة / Page help" onClick={() => setHelpOpen(true)} className="grid h-9 w-9 place-items-center rounded-full border border-violet-200 bg-violet-50 text-violet-700 transition hover:bg-violet-100"><CircleHelp size={19}/></button></div><p className="mt-1 text-sm text-slate-600">راجع الطلبات، افتح تفاصيلها، وأكّد الطلب قبل خصم الكميات من المخزون. / Review, inspect, and confirm orders before stock is deducted.</p></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => void enableOrderNotifications()} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition ${soundEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100"}`}><PackageCheck size={16}/>{soundEnabled ? "إشعارات صاحب المتجر مفعّلة" : "تفعيل إشعارات صاحب المتجر"}</button>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-violet-300 hover:text-violet-700"><RefreshCw size={16}/>تحديث / Refresh</button>
      </div>
    </div>
    <div className="mb-5 flex justify-end"><button onClick={() => void toggleCustomers()} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-bold text-violet-800 shadow-sm transition hover:bg-violet-50"><Users size={17}/>{customersOpen ? "إخفاء دليل العملاء / Hide customers" : "دليل العملاء / Customer directory"}</button></div>
    {customersOpen && <Card className="mb-5 border-violet-100 bg-white shadow-sm"><CardContent className="p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">دليل العملاء / Customer directory</h2><p className="mt-1 text-xs text-slate-500">بيانات محفوظة للرجوع إلى العملاء وطلباتهم السابقة. استخدم التواصل التسويقي بموافقة العميل فقط.</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">{customers.length} عميل / customers</span></div>{customersLoading ? <p className="py-6 text-center text-sm text-slate-500">جاري التحميل / Loading…</p> : customers.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">لا توجد بيانات عملاء / No customer records.</p> : <div className="overflow-x-auto rounded-xl border border-slate-100"><table className="w-full min-w-[760px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">العميل / Customer</th><th className="p-3">معرّف العميل / Customer ID</th><th className="p-3">الهاتف / Phone</th><th className="p-3">عدد الطلبات / Orders</th><th className="p-3">إجمالي المشتريات / Lifetime spend</th><th className="p-3">آخر طلب / Last order</th></tr></thead><tbody>{customers.map((c) => <tr key={c.id} className="border-t border-slate-100"><td className="p-3 font-bold text-slate-800">{c.full_name || "—"}<div className="mt-1 text-xs font-normal text-slate-400">{c.governorate || ""}</div></td><td className="p-3 font-mono text-xs text-slate-500">{c.id}</td><td className="p-3 text-slate-700">{c.phone || "—"}</td><td className="p-3">{c.orders_count ?? 0}</td><td className="p-3 font-bold">{money(c.total_spent)}</td><td className="p-3 text-xs text-slate-500">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("ar-EG") : "—"}</td></tr>)}</tbody></table></div>}</CardContent></Card>}
    <div className="mb-5 grid gap-4 sm:grid-cols-2">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#7B2C8E] via-[#9144A4] to-[#C084CC] text-white shadow-lg shadow-violet-200/60"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-semibold text-white/80">قيمة طلبات اليوم / Today's order value</p><p className="mt-2 text-3xl font-black">{money(todayStats.total)}</p><p className="mt-1 text-xs text-white/75">{todayStats.count} طلب غير ملغي / non-cancelled orders</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><CalendarDays size={24}/></div></CardContent></Card>
      <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-semibold text-slate-500">طلبات تحتاج مراجعة / Orders to review</p><p className="mt-2 text-3xl font-black text-slate-900">{items.filter((o) => (o.status || "pending") === "pending" && !o.inventory_deducted_at).length}</p><p className="mt-1 text-xs text-slate-500">المخزون لا يتغير قبل التأكيد / Stock stays unchanged until confirmation</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-700"><PackageCheck size={24}/></div></CardContent></Card>
    </div>
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="relative min-w-[280px] flex-1"><Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث برقم الطلب أو اسم العميل أو المنتج / Search orders, customers, products..." className="h-11 w-full rounded-xl border border-slate-300 bg-white pe-10 ps-4 text-sm text-black outline-none focus:border-violet-500"/></div>
      <span className="text-xs font-semibold text-slate-600">{filtered.length} طلب / orders</span>
    </div>
    {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4">
      {filtered.length === 0 ? <Card className="border-slate-200 bg-white"><CardContent className="p-10 text-center text-slate-500">لا توجد نتائج.</CardContent></Card> : filtered.map((o) => {
        const delivered = o.status === "delivered";
        const oi = orderItems[o.id] || [];
        return <Card key={o.id} className="border-slate-200 bg-white"><CardContent className="p-5 text-black">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="font-bold">رقم العملية / Order ID: #{o.order_number || String(o.id).slice(0, 8)}</div>
              <div className="mt-1 text-sm text-slate-700">{o.customer_name || "بدون اسم"} · {o.customer_phone || "بدون هاتف"}</div>
              <div className="mt-1 text-xs text-slate-500">معرّف العميل / Customer ID: <span className="font-mono text-slate-700">{o.customer_id || "—"}</span></div>
              <div className="mt-1 text-xs text-slate-500">تاريخ الطلب / Order date: {o.created_at ? new Date(o.created_at).toLocaleString("ar-EG") : ""}</div>
              {oi.length > 0 && <div className="mt-2 text-xs text-slate-600">المنتجات / Products: {oi.map((x) => x.product_name || x.name_ar || x.name_en).filter(Boolean).join("، ")}</div>}
            </div>
            <div className="text-xl font-black">{money(o.total ?? o.total_amount)}<div className="mt-1 text-xs font-medium text-slate-500">قيمة المشتريات / Purchase value</div></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-sm font-semibold">حالة الطلب / Order status
              <select value={o.status || "pending"} disabled={busy === o.id} onChange={(e) => void updateStatus(o.id, e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-black">
                {statuses.filter(([value]) => o.inventory_deducted_at ? !["pending", "cancelled"].includes(value) : ["pending", "cancelled"].includes(value)).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              {!(o.inventory_deducted_at) && (o.status || "pending") !== "cancelled" && <button disabled={busy === o.id} onClick={() => void confirmOrder(o)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7B2C8E] to-[#A64CC1] px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-50"><PackageCheck size={16}/>{busy === o.id ? "جارٍ التأكيد / Confirming" : "تأكيد الطلب وخصم المخزون / Confirm & deduct"}</button>}
              {o.inventory_deducted_at && <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700"><Check size={15}/>تم خصم المخزون / Stock deducted</span>}
              <button onClick={() => setDetails(o)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-violet-300"><Eye size={16}/> التفاصيل / Details</button>
              {delivered && <button disabled={busy === o.id} onClick={() => void requestReview(o)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a64cc1] to-[#6e2d8b] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><MessageCircle size={17}/>{busy === o.id ? "جاري التجهيز..." : "طلب تقييم"}</button>}
              <button disabled={busy === o.id} onClick={() => setConfirmDelete(o)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700"><Trash2 size={16}/> حذف</button>
            </div>
          </div>
        </CardContent></Card>;
      })}
    </div>

    {helpOpen && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 p-4" onClick={() => setHelpOpen(false)}><div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-3xl border border-violet-100 bg-white p-6 text-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">دليل استخدام صفحة الطلبات</h2><p className="mt-1 text-sm text-slate-500">Orders page guide</p></div><button onClick={() => setHelpOpen(false)} aria-label="إغلاق / Close" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200"><X size={18}/></button></div><ol className="mt-5 list-decimal space-y-3 pe-5 text-sm leading-7"><li><b>راجع الطلب / Review:</b> يظهر كل طلب مع رقم العملية واسم العميل ومعرّفه وقيمة الشراء والتاريخ.</li><li><b>افتح التفاصيل / View details:</b> راجع المنتجات والتفريعات والكميات والعنوان قبل التنفيذ.</li><li><b>تأكيد الطلب / Confirm order:</b> لا يتم خصم أي مخزون عند وصول الطلب. اضغط التأكيد بعد المراجعة؛ ستُخصم الكميات مرة واحدة فقط ويصبح الطلب «جاري التجهيز».</li><li><b>قيمة طلبات اليوم / Today's value:</b> مجموع الطلبات غير الملغاة التي أُنشئت اليوم حسب توقيت المتصفح.</li><li><b>بيانات العميل / Customer records:</b> معرّف العميل يساعدك على ربط طلباته السابقة والرجوع لبياناته للتواصل والعروض المناسبة. التزم بموافقة العميل وقواعد الخصوصية عند إرسال التسويق.</li></ol><div className="mt-5 rounded-xl bg-violet-50 p-3 text-xs leading-6 text-violet-900">مهم / Important: نفّذ ملف SQL المرفق بعد مراجعة مخطط قاعدة البيانات. زر التأكيد يعتمد على الدالة confirm_store_order_inventory.</div><button onClick={() => setHelpOpen(false)} className="mt-5 w-full rounded-xl bg-[#7B2C8E] px-4 py-3 text-sm font-bold text-white">فهمت / Got it</button></div></div>}

    {details && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={() => setDetails(null)}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 text-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">تفاصيل الطلب</h2><p className="mt-1 text-sm text-slate-500">#{details.order_number || details.id}</p></div><button onClick={() => setDetails(null)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200"><X size={18}/></button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
          <div><b>اسم العميل / Customer:</b> {details.customer_name || "-"}</div>
          <div><b>رقم الطلب / Order number:</b> #{details.order_number || details.id}</div>
          <div><b>معرّف العميل / Customer ID:</b> <span className="font-mono">{details.customer_id || "—"}</span></div>
          <div><b>خصم المخزون / Inventory:</b> {details.inventory_deducted_at ? "تم الخصم / Deducted" : "لم يتم الخصم / Not deducted"}</div>
          <div><b>رقم الهاتف / Phone:</b> {details.customer_phone || "-"}</div>
          <div><b>تاريخ الطلب / Order date:</b> {details.created_at ? new Date(details.created_at).toLocaleString("ar-EG") : "-"}</div>
          <div><b>الحالة / Status:</b> {statuses.find((x) => x[0] === details.status)?.[1] || details.status || "-"}</div>
          {details.payment_method && <div><b>طريقة الدفع / Payment method:</b> {details.payment_method}</div>}
          {details.payment_status && <div><b>حالة الدفع / Payment status:</b> {details.payment_status}</div>}
          {details.shipping_method && <div><b>طريقة الشحن / Shipping method:</b> {details.shipping_method}</div>}
          <div className="sm:col-span-2"><b>عنوان العميل / Customer address:</b> {[details.governorate, details.city, details.area, details.address].filter(Boolean).join(" — ") || "-"}</div>
          {details.postal_code && <div><b>الرمز البريدي / Postal code:</b> {details.postal_code}</div>}
          {details.notes && <div className="sm:col-span-2"><b>ملاحظات / Notes:</b> {details.notes}</div>}
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200">
          {(orderItems[details.id] || []).map((item, index) => <div key={item.id || `${details.id}-${index}`} className="border-b border-slate-100 p-4 last:border-b-0">
            <div className="flex gap-4">
              {(item.image_url || item.product_image_url || item.primary_image_url || item.image || item.photo) ? <img src={item.image_url || item.product_image_url || item.primary_image_url || item.image || item.photo} alt={item.product_name || "صورة المنتج"} className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1" loading="lazy" /> : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">لا توجد صورة</div>}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.product_name || item.name || item.name_ar || item.name_en || item.title || "منتج"}</p>
                {item.variant_name && <p className="mt-1 text-xs text-slate-500">التفريعة: {item.variant_name}</p>}
                {item.shape && <p className="mt-1 text-xs text-slate-500">الشكل: {item.shape}</p>}
                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                  <span>الكمية: {item.quantity ?? 0}</span>
                  <span>سعر الوحدة: {money(item.unit_price ?? item.price ?? item.sale_price ?? item.unitPrice)}</span>
                  {item.sku && <span>SKU: {item.sku}</span>}
                  {item.barcode && <span>Barcode: {item.barcode}</span>}
                  {item.product_id && <span>Product ID: {item.product_id}</span>}
                  {item.variant_id && <span>Variant ID: {item.variant_id}</span>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.available_stock === null ? "bg-slate-100 text-slate-600" : Number(item.available_stock) <= 0 ? "bg-red-100 text-red-700" : Number(item.available_stock) < Number(item.quantity || 0) ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.available_stock === null ? "المخزون غير متاح" : Number(item.available_stock) <= 0 ? "نفد المخزون / Out of stock" : `المتاح بالمخزون: ${item.available_stock}`}
                  </span>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
                    <input type="checkbox" checked={Boolean(reviewedItems[String(item.id || `${details.id}-${index}`)])} onChange={(e) => setReviewedItems((current) => ({ ...current, [String(item.id || `${details.id}-${index}`)]: e.target.checked }))} disabled={Boolean(details.inventory_deducted_at)} />
                    تمت مراجعة واعتماد القطعة
                  </label>
                </div>
                {item.available_stock !== null && Number(item.available_stock) < Number(item.quantity || 0) && <p className="mt-2 text-xs font-semibold text-red-700">تنبيه: الكمية المطلوبة ({item.quantity}) أكبر من المخزون الظاهر ({item.available_stock}). راجع المخزون قبل التأكيد.</p>}
              </div>
              <strong className="shrink-0">{money(item.total_price ?? item.line_total ?? ((Number(item.unit_price ?? item.price ?? item.sale_price ?? item.unitPrice ?? 0)) * Number(item.quantity || 0)))}</strong>
            </div>
          </div>)}
        </div>
        {!details.inventory_deducted_at && (details.status || "pending") !== "cancelled" && <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4"><p className="text-sm font-bold text-violet-950">راجع كل قطعة وحدد «تمت مراجعة واعتماد القطعة» قبل تأكيد الطلب.</p><button disabled={busy === details.id || (orderItems[details.id] || []).some((item: any, index: number) => !reviewedItems[String(item.id || `${details.id}-${index}`)])} onClick={() => void confirmOrder(details)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><PackageCheck size={17}/>{busy === details.id ? "جارٍ التأكيد..." : "تأكيد الطلب وخصم المخزون"}</button><p className="mt-2 text-xs text-violet-800">سيتم تنفيذ خصم المخزون من خلال دالة قاعدة البيانات الحالية عند تأكيد الطلب.</p></div>}
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
