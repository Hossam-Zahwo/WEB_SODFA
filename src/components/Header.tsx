import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Menu, Search, ShoppingBag, X } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { listCategories, type DbCategory } from "@/lib/db";
import { loadHeroConfig } from "@/lib/heroConfig";
import { cn } from "@/lib/utils";

function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-border bg-input p-1 text-xs",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors duration-200",
          lang === "ar"
            ? "bg-sodfa text-primary-foreground"
            : "text-subtle hover:text-foreground",
        )}
      >
        العربية
      </button>

      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors duration-200",
          lang === "en"
            ? "bg-sodfa text-primary-foreground"
            : "text-subtle hover:text-foreground",
        )}
      >
        English
      </button>
    </div>
  );
}

export function Header() {
  const { t, pick } = useLang();
  const { count } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [hasCustomer, setHasCustomer] = useState(false);
  const [heroActive, setHeroActive] = useState(false);
  const [heroLogos, setHeroLogos] = useState({ heroLogo: "/Asset%202.png", scrolledLogo: "/Asset%202.png" });

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setHeroActive(false);
      return;
    }

    if (window.innerWidth >= 768) {
      setHeroActive(false);
    }

    let alive = true;
    void loadHeroConfig().then((saved) => {
      if (alive && saved?.mobileHeader) {
        setHeroLogos({
          heroLogo: saved.mobileHeader.heroLogo || "/Asset%202.png",
          scrolledLogo: saved.mobileHeader.scrolledLogo || "/Asset%202.png",
        });
      }
    });

    const updateHeroState = () => {
      if (window.innerWidth >= 768) {
        setHeroActive(false);
        return;
      }
      const hero = document.getElementById("sodfa-hero");
      if (!hero) {
        setHeroActive(window.scrollY < 24);
        return;
      }
      const headerHeight = 64;
      const rect = hero.getBoundingClientRect();
      setHeroActive(rect.top <= headerHeight && rect.bottom > headerHeight + 8);
    };

    updateHeroState();
    window.addEventListener("scroll", updateHeroState, { passive: true });
    window.addEventListener("resize", updateHeroState);
    return () => {
      alive = false;
      window.removeEventListener("scroll", updateHeroState);
      window.removeEventListener("resize", updateHeroState);
    };
  }, [pathname]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sodfa-customer-profile");
      setHasCustomer(Boolean(raw && JSON.parse(raw)?.accessToken && JSON.parse(raw)?.phone));
    } catch {
      setHasCustomer(false);
    }
  }, [pathname]);

  useEffect(() => {
    let alive = true;

    listCategories()
      .then((nextCategories) => {
        if (alive) {
          setCategories(nextCategories);
        }
      })
      .catch(() => {
        if (alive) {
          setCategories([]);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    setSearchOpen(false);

    navigate({
      to: "/products",
      search: {
        q: q || undefined,
        cat: undefined,
      },
    });
  };

  return (
    <header
      className={cn(
        "z-50 border-b border-border backdrop-blur-xl transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ease-out",
        pathname === "/"
          ? "fixed inset-x-0 top-0 md:sticky md:top-0"
          : "sticky top-0",
        pathname === "/" && heroActive
          ? "border-transparent bg-transparent shadow-none md:border-transparent md:bg-white/10 md:shadow-none"
          : "border-border/70 bg-white shadow-[0_8px_30px_rgba(57,31,91,.07)] md:bg-white/80",
      )}
    >
      {/* =========================
          MAIN HEADER
      ========================== */}
      <div className="relative mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-3 sm:px-5 lg:px-6">
        {/* =========================
            LOGO
        ========================== */}
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="SODFA"
        >
          <img
            src={pathname === "/" && heroActive ? heroLogos.heroLogo : heroLogos.scrolledLogo}
            alt="SODFA صدفة"
            className="h-9 w-auto object-contain sm:h-10"
            loading="eager"
            decoding="async"
          />
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="
                group
                relative
                flex
                min-h-16
                items-center
                px-3
                py-2
                text-sm
                font-medium
                text-muted-foreground
                transition-colors
                duration-200
                hover:text-foreground
                lg:px-4
              "
              activeProps={{
                className: `
                  group
                  relative
                  flex
                  min-h-16
                  items-center
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-foreground
                  lg:px-4
                `,
              }}
            >
              <span className="whitespace-nowrap">
                {pick(category.name_ar, category.name_en)}
              </span>

              {/* Hover underline */}
              <span
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-1/2
                  h-[2px]
                  w-0
                  -translate-x-1/2
                  rounded-full
                  bg-sodfa
                  opacity-0
                  transition-all
                  duration-300
                  ease-out
                  group-hover:w-[70%]
                  group-hover:opacity-100
                "
              />
            </Link>
          ))}

          {/* =========================
              OFFERS
          ========================== */}
          <Link
            to="/offers"
            className="
              group
              relative
              flex
              min-h-16
              items-center
              px-3
              py-2
              text-sm
              font-medium
              text-muted-foreground
              transition-colors
              duration-200
              hover:text-foreground
              lg:px-4
            "
            activeProps={{
              className: `
                group
                relative
                flex
                min-h-16
                items-center
                px-3
                py-2
                text-sm
                font-semibold
                text-foreground
                lg:px-4
              `,
            }}
          >
            <span className="whitespace-nowrap">
              {t("offers.title")}
            </span>

            {/* Hover underline */}
            <span
              className="
                pointer-events-none
                absolute
                bottom-0
                left-1/2
                h-[2px]
                w-0
                -translate-x-1/2
                rounded-full
                bg-sodfa
                opacity-0
                transition-all
                duration-300
                ease-out
                group-hover:w-[70%]
                group-hover:opacity-100
              "
            />
          </Link>
        </nav>

        {/* =========================
            RIGHT ACTIONS
        ========================== */}
        <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          {/* Search */}
          <button
            type="button"
            aria-label={t("nav.search")}
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              `
              grid
              h-10
              w-10
              place-items-center
              rounded-full
              text-muted-foreground
              transition-all
              duration-200
              hover:bg-card
              hover:text-foreground
            `,
              pathname === "/" && heroActive ? "bg-white/15 text-[#30205f]" : "bg-transparent",
            )}
          >
            <Search className="h-5 w-5" />
          </button>

          {hasCustomer && (
            <Link
              to="/orders"
              aria-label="طلباتي"
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-xs font-bold text-muted-foreground transition-all hover:bg-card hover:text-foreground xl:flex"
            >
              <ClipboardList className="h-4 w-4" />
              طلباتي
            </Link>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            aria-label={t("nav.cart")}
            className="
              relative
              grid
              h-10
              w-10
              place-items-center
              rounded-full
              text-muted-foreground
              transition-all
              duration-200
              hover:bg-card
              hover:text-foreground
            "
          >
            <ShoppingBag className="h-5 w-5" />

            {count > 0 && (
              <span
                className="
                  absolute
                  end-1
                  top-1
                  grid
                  h-4
                  min-w-4
                  place-items-center
                  rounded-full
                  bg-sodfa
                  px-1
                  text-[10px]
                  font-bold
                  text-primary-foreground
                "
              >
                {count}
              </span>
            )}
          </Link>

          {/* Language */}
          <LangSwitch className="ms-1 hidden lg:flex" />

          {/* Mobile menu */}
          <button
            type="button"
            aria-label={t("nav.menu")}
            onClick={() => setMenuOpen((v) => !v)}
            className="
              grid
              h-10
              w-10
              place-items-center
              rounded-full
              text-muted-foreground
              transition-all
              duration-200
              hover:bg-card
              hover:text-foreground
              md:hidden
            "
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================== */}
      {searchOpen && (
        <div className="border-t border-border bg-background/95 px-3 py-3 sm:px-6">
          <form
            onSubmit={submit}
            className="mx-auto flex w-full max-w-3xl items-center gap-2"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("shop.search")}
              className="
                h-11
                min-w-0
                w-full
                rounded-xl
                border
                border-border
                bg-input
                px-4
                text-sm
                outline-none
                placeholder:text-subtle
                focus:border-primary
              "
            />

            <button
              type="submit"
              className="
                h-11
                shrink-0
                rounded-xl
                bg-sodfa
                px-4
                text-sm
                font-medium
                text-primary-foreground
                transition-opacity
                hover:opacity-90
                sm:px-5
              "
            >
              {t("nav.search")}
            </button>
          </form>
        </div>
      )}

      {/* =========================
          MOBILE NAVIGATION
      ========================== */}
      {menuOpen && (
        <div
          className="
            max-h-[calc(100vh-4rem)]
            overflow-y-auto
            border-t
            border-border
            bg-background
            px-3
            py-3
            md:hidden
          "
        >
          <nav className="space-y-1">
            {hasCustomer && (
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-base font-bold text-foreground transition-colors hover:bg-card hover:text-sodfa"
              >
                <ClipboardList size={18} /> طلباتي
              </Link>
            )}
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/category/$slug"
                params={{ slug: category.slug }}
                onClick={() => setMenuOpen(false)}
                className="
                  flex
                  min-h-12
                  items-center
                  rounded-xl
                  px-3
                  py-2
                  text-base
                  font-medium
                  text-foreground
                  transition-colors
                  hover:bg-card
                  hover:text-sodfa
                "
              >
                {pick(category.name_ar, category.name_en)}
              </Link>
            ))}

            <Link
              to="/offers"
              onClick={() => setMenuOpen(false)}
              className="
                flex
                min-h-12
                items-center
                rounded-xl
                px-3
                py-2
                text-base
                font-semibold
                text-foreground
                transition-colors
                hover:bg-card
                hover:text-sodfa
              "
            >
              {t("offers.title")}
            </Link>
          </nav>

          <LangSwitch className="mt-3 w-fit" />
        </div>
      )}
    </header>
  );
}