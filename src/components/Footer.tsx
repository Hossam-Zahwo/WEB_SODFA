import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { categories } from "@/data/catalog";

export function Footer() {
  const { t, pick } = useLang();

  return (
    <footer className="mt-24 border-t border-white/10 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/Asset 3.png"
                alt="SODFA صدفة"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 text-sm text-white/80">
              {t("footer.tag")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="text-white transition-colors hover:text-white/70"
              >
                {pick(c.name.ar, c.name.en)}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-white/70">
          © {new Date().getFullYear()} SODFA — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}