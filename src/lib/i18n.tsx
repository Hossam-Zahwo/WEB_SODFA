import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const dict = {
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.categories": { ar: "الأقسام", en: "Categories" },
  "nav.offers": { ar: "العروض", en: "Offers" },
  "nav.products": { ar: "كل المنتجات", en: "All Products" },
  "nav.menu": { ar: "القائمة", en: "Menu" },
  "nav.cart": { ar: "السلة", en: "Cart" },
  "nav.search": { ar: "بحث", en: "Search" },

  "hero.1.label": { ar: "جراب يكمّل ستايلك", en: "A case that completes your style" },
  "hero.1.title": { ar: "حماية شيك… تليق بموبايلك", en: "Smart protection, made for your phone" },
  "hero.1.sub": {
    ar: "جرابات مختارة بعناية، تجمع بين الشكل الحلو والحماية اللي تقدر تعتمد عليها كل يوم.",
    en: "Carefully selected cases that bring together a clean look and protection you can count on every day.",
  },
  "hero.2.label": { ar: "اشحن وكمّل يومك", en: "Charge and keep going" },
  "hero.2.title": { ar: "شحن سريع… من غير ما يعطّل يومك", en: "Fast charging, without slowing you down" },
  "hero.2.sub": {
    ar: "شواحن وكابلات عملية لكل مشاويرك، عشان تفضل جاهز من أول اليوم لآخره.",
    en: "Practical chargers and cables for every part of your day, so you stay ready from morning to night.",
  },
  "hero.3.label": { ar: "الشحن على السريع", en: "Wireless, made easy" },
  "hero.3.title": { ar: "حط موبايلك… وسيب الباقي علينا", en: "Drop your phone. Let charging do the rest." },
  "hero.3.sub": {
    ar: "شحن لاسلكي عملي يخلي مكانك أرتب وروتينك أسهل، من غير كابلات متشابكة.",
    en: "Practical wireless charging that keeps your setup cleaner and your routine easier, without tangled cables.",
  },
  "hero.cta": { ar: "شوف الجرابات", en: "Shop Cases" },

  "home.categories": { ar: "تسوّق حسب القسم", en: "Shop by Category" },
  "home.categories.sub": { ar: "كل ما تحتاجه في مكان واحد", en: "Everything in one place" },
  "home.shopNow": { ar: "تسوق الآن", en: "Shop now" },
  "home.best": { ar: "الأكثر مبيعًا", en: "Best Sellers" },
  "home.new": { ar: "وصل حديثًا", en: "New Arrivals" },
  "home.viewAll": { ar: "عرض الكل", en: "View all" },

  "find.title": { ar: "ابحث بنوع تليفونك", en: "Find by Your Phone" },
  "find.placeholder": { ar: "اكتب موديل هاتفك...", en: "Type your phone model..." },
  "find.brand": { ar: "الماركة", en: "Brand" },
  "find.model": { ar: "الموديل", en: "Model" },
  "find.choose": { ar: "اختر", en: "Choose" },
  "find.results": { ar: "منتجات متوافقة", en: "Compatible products" },
  "find.empty": { ar: "اكتب موديل الهاتف لتظهر لك المنتجات المتوافقة.", en: "Type your phone model to see compatible products." },
  "find.noResults": { ar: "لا توجد منتجات مطابقة لـ", en: "No products match" },
  "find.resultCount": { ar: "نتيجة", en: "results" },
  "categories.loadError": { ar: "تعذر تحميل الأقسام حاليًا. حاول تحديث الصفحة.", en: "Categories could not be loaded. Please refresh and try again." },
  "categories.empty": { ar: "لا توجد أقسام مضافة حاليًا.", en: "No categories have been added yet." },
  "slider.previous": { ar: "السابق", en: "Previous" },
  "slider.next": { ar: "التالي", en: "Next" },
  "slider.group": { ar: "مجموعة", en: "Group" },
  "slider.slide": { ar: "الشريحة", en: "Slide" },
  "slider.productImages": { ar: "صور المنتجات", en: "Product images" },

  "product.addToCart": { ar: "أضف إلى السلة", en: "Add to Cart" },
  "product.added": { ar: "تمت الإضافة", en: "Added" },
  "product.colors": { ar: "الألوان", en: "Colors" },
  "product.model": { ar: "الموديل", en: "Model" },
  "product.qty": { ar: "الكمية", en: "Quantity" },
  "product.inStock": { ar: "متوفر", en: "In stock" },
  "product.outStock": { ar: "غير متوفر", en: "Out of stock" },
  "product.description": { ar: "الوصف", en: "Description" },
  "product.off": { ar: "خصم", en: "OFF" },
  "product.best": { ar: "الأكثر مبيعًا", en: "Best Seller" },
  "product.featured": { ar: "مميز", en: "Featured" },
  "product.new": { ar: "جديد", en: "New" },
  "product.barcode": { ar: "باركود", en: "Barcode" },
  "product.rating": { ar: "التقييم", en: "Rating" },
  "product.noRatings": { ar: "لا توجد تقييمات بعد", en: "No ratings yet" },
  "product.related": { ar: "منتجات مشابهة", en: "You may also like" },
  "product.variants": { ar: "اختيارات المنتج", en: "Product options" },
  "product.variantCount": { ar: "اختيار", en: "options" },

  "shop.title": { ar: "كل المنتجات", en: "All Products" },
  "shop.search": { ar: "ابحث عن منتج...", en: "Search products..." },
  "shop.category": { ar: "القسم", en: "Category" },
  "shop.all": { ar: "الكل", en: "All" },
  "shop.price": { ar: "أقصى سعر", en: "Max price" },
  "shop.results": { ar: "منتج", en: "products" },
  "shop.empty": { ar: "لا توجد نتائج مطابقة.", en: "No matching products." },
  "shop.reset": { ar: "إعادة ضبط", en: "Reset" },
  "shop.categories": { ar: "التصنيفات", en: "Categories" },
  "shop.allCategories": { ar: "كل التصنيفات", en: "All categories" },
  "shop.noFilterResults": { ar: "لا توجد منتجات مرتبطة بهذا الفلتر.", en: "No products are linked to this filter." },
  "shop.loadError": { ar: "تعذر تحميل المنتجات", en: "Products could not be loaded" },
  "filter.series.title": { ar: "اختار سلسلة جهازك", en: "Choose your phone series" },
  "filter.series.sub": { ar: "اختار السلسلة أولًا لعرض الموديلات التابعة لها.", en: "Choose a series first to show its models." },
  "filter.series.clear": { ar: "إلغاء السلسلة", en: "Clear series" },
  "filter.model.title": { ar: "فلتر حسب الموديل", en: "Filter by model" },
  "filter.model.sub": { ar: "اختار موديل لعرض المنتجات الخاصة به فقط.", en: "Choose a model to show only its products." },
  "filter.clear": { ar: "إلغاء الفلتر", en: "Clear filter" },
  "filter.hideModels": { ar: "إخفاء الموديلات", en: "Hide models" },
  "filter.viewAllModels": { ar: "عرض الكل", en: "View all" },
  "filter.noModels": { ar: "لا توجد موديلات مرتبطة بهذه السلسلة.", en: "No models are linked to this series." },
  "filter.noProducts": { ar: "لا توجد منتجات مرتبطة بهذا الموديل.", en: "No products are linked to this model." },
  "filter.chooseModel": { ar: "اختار موديل أولًا لعرض المنتجات التابعة له.", en: "Choose a model first to show its products." },

  "cart.title": { ar: "سلة التسوق", en: "Your Cart" },
  "cart.empty": { ar: "سلتك فارغة حاليًا.", en: "Your cart is empty." },
  "cart.continue": { ar: "متابعة التسوق", en: "Continue shopping" },
  "cart.subtotal": { ar: "المجموع الفرعي", en: "Subtotal" },
  "cart.shipping": { ar: "الشحن", en: "Shipping" },
  "cart.free": { ar: "يُحسب حسب المحافظة", en: "Calculated by governorate" },
  "cart.total": { ar: "الإجمالي", en: "Total" },
  "cart.checkout": { ar: "إتمام الطلب", en: "Checkout" },
  "cart.soon": { ar: "أكمل بياناتك لإرسال الطلب على واتساب", en: "Complete your details to send the order on WhatsApp" },
  "cart.remove": { ar: "حذف", en: "Remove" },
  "cart.items": { ar: "منتج", en: "items" },

  "offers.title": { ar: "العروض", en: "Offers" },
  "offers.sub": { ar: "خصومات على منتجات مختارة", en: "Discounts on selected products" },
  "categories.title": { ar: "الأقسام", en: "Categories" },

  "reviews.eyebrow": { ar: "آراء عملائنا", en: "Customer reviews" },
  "reviews.title": { ar: "ناس جرّبت وبتحكي تجربتها ✨", en: "Real customers, real experiences ✨" },
  "reviews.sub": { ar: "تقييمات حقيقية من عملاء صدفة.", en: "Real feedback from SODFA customers." },
  "reviews.imageAlt": { ar: "صورة من تجربة العميل", en: "Customer experience" },

  "footer.tag": {
    ar: "إكسسوارات هاتف مميزة — مصر",
    en: "Premium phone accessories — Egypt",
  },
  "footer.rights": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  "common.currency": { ar: "ج.م", en: "EGP" },
  "common.back": { ar: "رجوع", en: "Back" },
  "common.clear": { ar: "مسح", en: "Clear" },

  "hero.cta2": { ar: "اكتشف أكتر", en: "Explore More" },
  "hero.b1.t": { ar: "يوصلك لحد بابك", en: "Delivered to your door" },
  "hero.b1.s": { ar: "شحن لمختلف المحافظات", en: "Shipping across Egypt" },
  "hero.b2.t": { ar: "اختيارات متراجعة", en: "Carefully selected" },
  "hero.b2.s": { ar: "منتجات بنختارها بعناية", en: "Products selected with care" },
  "hero.b3.t": { ar: "دفع عند الاستلام", en: "Cash on delivery" },
  "hero.b3.s": { ar: "ادفع لما طلبك يوصلك", en: "Pay when your order arrives" },
  "hero.b4.t": { ar: "حماية تقدر تعتمد عليها", en: "Protection you can trust" },
  "hero.b4.s": { ar: "جرابات مختارة عشان تحافظ على موبايلك", en: "Cases selected to help protect your phone" },
  "hero.b5.t": { ar: "اختيارات على مزاجك", en: "Picked for your style" },
  "hero.b5.s": { ar: "شكل حلو واستخدام مريح كل يوم", en: "Good looks and everyday comfort" },
  "hero.b6.t": { ar: "ستايل يبان", en: "A look that stands out" },
  "hero.b6.s": { ar: "لمسة مختلفة تكمل شكل موبايلك", en: "A distinctive touch that completes your phone" },

  "feat.1.t": { ar: "توصيل لكل المحافظات", en: "Nationwide Shipping" },
  "feat.1.s": { ar: "شحن سريع وآمن", en: "Fast and safe delivery" },
  "feat.2.t": { ar: "خامات بريميوم", en: "Premium Materials" },
  "feat.2.s": { ar: "اختيار دقيق لكل منتج", en: "Carefully curated picks" },
  "feat.3.t": { ar: "استبدال خلال 14 يوم", en: "14-Day Returns" },
  "feat.3.s": { ar: "بدون تعقيد", en: "No hassle, no questions" },
  "feat.4.t": { ar: "دعم على واتساب", en: "WhatsApp Support" },
  "feat.4.s": { ar: "متاح طوال اليوم", en: "Available around the clock" },

  "stats.1.n": { ar: "+12,000", en: "12,000+" },
  "stats.1.t": { ar: "عميل سعيد", en: "Happy customers" },
  "stats.2.n": { ar: "+120", en: "120+" },
  "stats.2.t": { ar: "منتج متاح", en: "Products available" },
  "stats.3.n": { ar: "24/7", en: "24/7" },
  "stats.3.t": { ar: "دعم فني", en: "Customer support" },
  "stats.4.n": { ar: "%100", en: "100%" },
  "stats.4.t": { ar: "منتجات أصلية", en: "Authentic products" },

  "cart.whatsapp": { ar: "إتمام الطلب عبر واتساب", en: "Order via WhatsApp" },
  "cart.order": { ar: "طلب جديد من صدفة", en: "New SODFA order" },
  "cart.qtyShort": { ar: "الكمية", en: "Qty" },
} satisfies Dict;

export type TKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  pick: (ar: string, en: string) => string;
  price: (n: number) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("sodfa-lang");
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("sodfa-lang", l);
  }, []);

  const value = useMemo<Ctx>(() => {
    const pick = (ar: string, en: string) => (lang === "ar" ? ar : en);
    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (key) => dict[key][lang],
      pick,
      price: (n) =>
        lang === "ar"
          ? `${n.toLocaleString("ar-EG")} ج.م`
          : `EGP ${n.toLocaleString("en-US")}`,
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
