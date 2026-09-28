import { useEffect, useState } from "react";
import { Headset, MessageSquareMore } from "lucide-react";
import { getStoreWhatsAppNumber, openWhatsAppSmart } from "@/lib/db";
import { useLang } from "@/lib/i18n";

export function CustomerSupportButton() {
  const { lang } = useLang();
  const [number, setNumber] = useState("");

  useEffect(() => {
    let alive = true;
    getStoreWhatsAppNumber().then((value) => alive && setNumber(value)).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const label = lang === "ar" ? "محتاج مساعدة؟" : "Need help?";
  const message = lang === "ar"
    ? "مرحبًا SODFA 👋\nمحتاج مساعدة واستفسار عن منتج قبل الطلب."
    : "Hello SODFA 👋\nI need help and have a question about a product before ordering.";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => number && openWhatsAppSmart(number, message)}
      disabled={!number}
      className="group fixed bottom-5 end-5 z-[80] flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3 py-3 text-white shadow-[0_18px_50px_-18px_rgba(0,0,0,.9)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_-18px_rgba(0,0,0,.95)] disabled:cursor-wait disabled:opacity-60 sm:bottom-6 sm:end-6 sm:px-4"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-light to-primary-dark shadow-inner">
        <Headset size={21} />
      </span>
      <span className="hidden text-start sm:block">
        <span className="block text-xs font-medium text-slate-300">{lang === "ar" ? "خدمة العملاء" : "Customer care"}</span>
        <span className="flex items-center gap-1 text-sm font-bold"><MessageSquareMore size={14} />{label}</span>
      </span>
    </button>
  );
}
