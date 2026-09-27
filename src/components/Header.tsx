import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { listCategories, type DbCategory } from "@/lib/db";
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
        onClick={() => setLang("ar")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          lang === "ar"
            ? "bg-sodfa text-primary-foreground"
            : "text-subtle hover:text-foreground",
        )}
      >
        العربية
      </button>

      <button
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
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

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);

  }, [pathname]);

  useEffect(() => {
    let alive = true;

    listCategories()
      .then((nextCategories) => {
        if (alive) setCategories(nextCategories);
      })
      .catch(() => {
        if (alive) setCategories([]);
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
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl"
    >
      <div className="relative mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-3 sm:px-5 lg:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="SODFA"
        >
          <img
            src="/Asset%202.png"
            alt="SODFA صدفة"
            className="h-9 w-auto object-contain sm:h-10"
          />
        </Link>

        {/* Dynamic category navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="group relative flex min-h-16 items-center px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground lg:px-4"
              activeProps={{ className: "group relative flex min-h-16 items-center px-3 py-2 text-sm font-semibold text-foreground lg:px-4" }}
            >
              <span className="whitespace-nowrap">{pick(category.name_ar, category.name_en)}</span>
              <span className="pointer-events-none absolute bottom-1 start-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-sodfa opacity-0 transition-all duration-200 group-hover:w-[calc(100%-1.5rem)] group-hover:opacity-100" />
            </Link>
          ))}
          <Link
            to="/offers"
            className="group relative flex min-h-16 items-center px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground lg:px-4"
            activeProps={{ className: "group relative flex min-h-16 items-center px-3 py-2 text-sm font-semibold text-foreground lg:px-4" }}
          >
            <span className="whitespace-nowrap">{t("offers.title")}</span>
            <span className="pointer-events-none absolute bottom-1 start-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-sodfa opacity-0 transition-all duration-200 group-hover:w-[calc(100%-1.5rem)] group-hover:opacity-100" />
          </Link>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            aria-label={t("nav.search")}
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            to="/cart"
            aria-label={t("nav.cart")}
            className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-sodfa px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          <LangSwitch className="ms-1 hidden lg:flex" />

          <button
            aria-label={t("nav.menu")}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background/95 px-3 py-3 sm:px-6">
          <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl items-center gap-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("shop.search")}
              className="h-11 min-w-0 w-full rounded-xl border border-border bg-input px-4 text-sm outline-none placeholder:text-subtle focus:border-primary"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-sodfa px-4 text-sm font-medium text-primary-foreground sm:px-5"
            >
              {t("nav.search")}
            </button>
          </form>
        </div>
      )}

      {/* Mobile category navigation */}
      {menuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background px-3 py-3 md:hidden">
          <nav className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/category/$slug"
                params={{ slug: category.slug }}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center rounded-xl px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-card hover:text-sodfa"
              >
                {pick(category.name_ar, category.name_en)}
              </Link>
            ))}
            <Link
              to="/offers"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-3 py-2 text-base font-semibold text-foreground transition-colors hover:bg-card hover:text-sodfa"
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
