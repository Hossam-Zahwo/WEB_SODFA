import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Save, Settings2 } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminPage } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getStoreWhatsAppSettings, saveStoreWhatsAppSettings } from "@/lib/db";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

const COUNTRY_CODES = [
  ["+20", "مصر"], ["+966", "السعودية"], ["+971", "الإمارات"], ["+974", "قطر"], ["+965", "الكويت"],
  ["+973", "البحرين"], ["+968", "عُمان"], ["+962", "الأردن"], ["+961", "لبنان"], ["+212", "المغرب"],
  ["+213", "الجزائر"], ["+216", "تونس"], ["+218", "ليبيا"], ["+249", "السودان"], ["+49", "ألمانيا"],
  ["+34", "إسبانيا"], ["+44", "المملكة المتحدة"], ["+33", "فرنسا"], ["+1", "الولايات المتحدة / كندا"],
];

function SettingsAdmin() {
  const [countryCode, setCountryCode] = useState("+20");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const settings = await getStoreWhatsAppSettings();
        setCountryCode(settings.countryCode || "+20");
        setNumber(settings.number || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر تحميل إعدادات واتساب.");
      } finally { setLoading(false); }
    })();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      await saveStoreWhatsAppSettings(countryCode, number);
      setMessage("تم حفظ رقم واتساب استقبال الطلبات بنجاح.");
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ الرقم."); }
    finally { setSaving(false); }
  };

  return <AdminGuard><AdminPage>
    <div className="mb-8 flex items-start gap-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-900"><Settings2 size={22}/></div>
      <div><h1 className="text-3xl font-extrabold">إعدادات المتجر</h1><p className="mt-1 text-sm text-slate-500">التحكم في رقم واتساب الذي يستقبل طلبات العملاء.</p></div>
    </div>

    <Card className="max-w-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6 sm:p-8">
      <div className="flex items-start gap-4 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
        <MessageCircle className="mt-0.5 shrink-0" size={22}/><div><div className="font-bold">واتساب استقبال الطلبات</div><p className="mt-1 text-sm leading-6 text-emerald-700">الرقم هنا هو الرقم الذي يفتح عليه العميل رسالة الطلب الجاهزة بعد تسجيل الأوردر في قاعدة البيانات.</p></div>
      </div>
      <form onSubmit={save} className="mt-7 space-y-5">
        <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
          <label className="space-y-2 text-sm"><span className="block font-semibold">كود الدولة *</span><select value={countryCode} onChange={e => setCountryCode(e.target.value)} disabled={loading || saving} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-slate-400">{COUNTRY_CODES.map(([code,name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>
          <label className="space-y-2 text-sm"><span className="block font-semibold">رقم الهاتف *</span><Input required value={number} onChange={e => setNumber(e.target.value.replace(/[^0-9]/g, ""))} disabled={loading || saving} inputMode="tel" placeholder="1093384952" className="h-11"/></label>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><div className="font-semibold text-slate-800">الرقم الذي سيستخدمه الموقع</div><div className="mt-1 font-mono">{countryCode}{number.replace(/^0+/, "") || "..."}</div></div>
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={17}/>{message}</div>}
        <Button type="submit" disabled={loading || saving || !number.trim()} className="h-11 px-6"><Save size={17}/>{saving ? "جاري الحفظ..." : "حفظ رقم واتساب"}</Button>
      </form>
    </CardContent></Card>
  </AdminPage></AdminGuard>;
}
