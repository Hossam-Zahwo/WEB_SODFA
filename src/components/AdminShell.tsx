import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, Tags, ShoppingCart, MessageSquareHeart, LogOut, Store, Menu, X, Boxes, Layers, Settings2, Images, CircleHelp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOutAdmin } from "@/lib/admin";
import { AdminNetworkActivity } from "@/components/AdminNetworkActivity";

const nav = [
  { to: "/admin", label: "الرئيسية / Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "المنتجات / Products", icon: Package },
  { to: "/admin/categories", label: "التصنيفات / Categories", icon: Tags },
  { to: "/admin/series", label: "السلاسل / Series", icon: Layers },
  { to: "/admin/models", label: "الموديلات / Models", icon: Boxes },
  { to: "/admin/orders", label: "الطلبات / Orders", icon: ShoppingCart },
  { to: "/admin/reviews", label: "تقييمات العملاء / Reviews", icon: MessageSquareHeart },
  { to: "/admin/settings", label: "إعدادات المتجر / Settings", icon: Settings2 },
  { to: "/admin#hero-slider-settings", label: "السلايدر / Hero Slider", icon: Images },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = async () => { await signOutAdmin(); await navigate({ to: "/admin/login" }); };

  return (
    <div dir="rtl" className="sodfa-admin-shell min-h-screen bg-background text-foreground">
      <AdminNetworkActivity />
      <div className="fixed left-4 top-4 z-50 flex gap-2"><button onClick={() => setHelpOpen(true)} title="دليل الاستخدام / Help" aria-label="دليل الاستخدام / Help" className="rounded-xl border border-violet-200 bg-white p-2.5 text-violet-800 shadow-sm transition hover:bg-violet-50"><CircleHelp size={19}/></button><button className="rounded-xl border border-slate-200 bg-white p-2.5 text-black shadow-sm lg:hidden" onClick={() => setOpen(!open)} aria-label="القائمة / Menu">{open ? <X size={20}/> : <Menu size={20}/>}</button></div>
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 border-l border-slate-200 bg-white p-5 text-black shadow-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between">
          <div><div className="text-xl font-extrabold tracking-tight">SODFA</div><div className="text-xs text-slate-500">لوحة التحكم / Admin Dashboard</div></div>
          <Store className="text-black"/>
        </div>
        <nav className="space-y-1.5">
          {nav.map(({to,label,icon:Icon}) => <Link key={to} to={to as any} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${location.pathname === to ? "bg-gradient-to-r from-violet-100 to-fuchsia-50 text-violet-900 shadow-sm" : "text-slate-700 hover:bg-slate-50 hover:text-violet-800"}`}><Icon size={19}/>{label}</Link>)}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"><Store size={18}/>المتجر / Store</Link>
          <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-800 hover:bg-slate-50" onClick={logout}><LogOut size={18}/>تسجيل الخروج / Sign out</Button>
        </div>
      </aside>
      <main className="min-h-screen bg-gradient-to-br from-[#faf8fc] via-white to-[#f7f0fa] lg:mr-72"><div className="mx-auto max-w-[1560px] p-4 pt-20 sm:p-6 lg:p-9 lg:pt-10">{children}</div></main>
      {helpOpen && <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/60 p-4" onClick={() => setHelpOpen(false)}><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">دليل لوحة التحكم</h2><p className="mt-1 text-sm text-slate-500">Admin dashboard guide</p></div><button onClick={() => setHelpOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200" aria-label="إغلاق / Close"><X size={18}/></button></div><div className="mt-5 space-y-3 text-sm leading-7"><p><b>التنقل / Navigation:</b> استخدم القائمة الجانبية للوصول إلى الرئيسية والمنتجات والتصنيفات والطلبات والإعدادات. / Use the sidebar to move between dashboard sections.</p><p><b>الحفظ / Saving:</b> بعد أي تعديل، اضغط زر الحفظ وانتظر رسالة نجاح العملية. / Save changes and wait for confirmation.</p><p><b>المساعدة الخاصة بالصفحة / Page-specific help:</b> في الصفحات التي تحتوي على علامة (?) اضغط عليها لعرض تعليمات مفصلة للصفحة الحالية.</p><p><b>سلامة البيانات / Data safety:</b> لا تنفّذ عمليات حذف أو تأكيد قبل مراجعة التفاصيل. / Review details before deleting or confirming records.</p></div><button onClick={() => setHelpOpen(false)} className="mt-5 w-full rounded-xl bg-[#7B2C8E] px-4 py-3 text-sm font-bold text-white">فهمت / Got it</button></div></div>}
    </div>
  );
}

export function AdminPage({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
