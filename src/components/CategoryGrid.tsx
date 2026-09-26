import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, FolderOpen, Loader2 } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { listCategories, type DbCategory } from "@/lib/db";

export function CategoryGrid() {
  const { pick, dir, t } = useLang();

  const [items, setItems] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await listCategories();

        if (alive) {
          setItems(data);
        }
      } catch (e) {
        if (alive) {
          setError(
            e instanceof Error
              ? e.message
              : t("categories.loadError"),
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [t]);

  if (loading) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2
          className="animate-spin text-primary"
          size={24}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {t("categories.loadError")}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-subtle">
        {t("categories.empty")}
      </div>
    );
  }

  return (
    <div
      className="
        mt-16
        grid
        grid-cols-1
        gap-5
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-5
        2xl:gap-6
      "
    >
      {items.map((category) => {
        const Icon = FolderOpen;
        const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

        const categoryName = pick(
          category.name_ar,
          category.name_en,
        );

        return (
          <Link
            key={category.id}
            to="/category/$slug"
            params={{ slug: category.slug }}
            aria-label={categoryName}
            className="
              sodfa-category-card
              group
              relative
              block
              h-[300px]
              w-full
              overflow-visible
              rounded-3xl
              bg-transparent
              transition-all
              duration-500
              ease-[cubic-bezier(.22,1,.36,1)]
              focus:outline-none
              focus:ring-2
              focus:ring-[#8E2AA8]/25
            "
          >
            <span
              className="
                pointer-events-none
                absolute
                inset-0
                z-0
                rounded-3xl
                border
                border-[#cfd8d8]
                bg-transparent
                transition-colors
                duration-500
                group-hover:border-[#b9c8c8]
              "
            />

            {category.image_url ? (
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  z-20
                  flex
                  h-[116%]
                  items-end
                  justify-center
                  transition-all
                  duration-[850ms]
                  ease-[cubic-bezier(.16,1,.3,1)]
                  group-hover:-translate-y-[17%]
                  group-hover:scale-[1.035]
                "
              >
                <img
                  src={category.image_url}
                  alt={categoryName}
                  loading="lazy"
                  className="
                    h-full
                    w-full
                    object-contain
                    object-bottom
                    drop-shadow-[0_14px_18px_rgba(0,0,0,0.10)]
                    transition-all
                    duration-[850ms]
                    ease-[cubic-bezier(.16,1,.3,1)]
                    group-hover:drop-shadow-[0_28px_35px_rgba(0,0,0,0.20)]
                  "
                />
              </div>
            ) : (
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-20
                  flex
                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#d7dddd]
                    bg-transparent
                    text-[#159fa0]
                    shadow-[0_12px_25px_rgba(0,0,0,0.06)]
                    transition-all
                    duration-700
                    group-hover:-translate-y-5
                    group-hover:scale-110
                  "
                >
                  <Icon size={38} />
                </div>
              </div>
            )}

            <div
              className="
                pointer-events-none
                absolute
                bottom-5
                left-1/2
                z-10
                h-5
                w-[62%]
                -translate-x-1/2
                rounded-[50%]
                bg-black/10
                blur-xl
                opacity-60
                transition-all
                duration-[850ms]
                ease-[cubic-bezier(.16,1,.3,1)]
                group-hover:bottom-1
                group-hover:w-[48%]
                group-hover:scale-x-75
                group-hover:opacity-35
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-30
                flex
                justify-center
                px-4
                pb-4
                translate-y-3
                opacity-0
                transition-all
                duration-[550ms]
                ease-[cubic-bezier(.22,1,.36,1)]
                group-hover:translate-y-0
                group-hover:opacity-100
              "
              dir={dir}
            >
              <div
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-3
                  rounded-2xl
                  border
                  border-white/50
                  bg-white/90
                  px-4
                  py-3
                  shadow-[0_12px_30px_rgba(0,0,0,0.10)]
                  backdrop-blur-xl
                "
              >
                <span
                  className="
                    min-w-0
                    flex-1
                    truncate
                    text-[13px]
                    font-bold
                    text-[#17134f]
                    sm:text-[15px]
                  "
                >
                  {categoryName}
                </span>

                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[linear-gradient(135deg,#C06BCF_0%,#8E2AA8_52%,#74218F_100%)]
                    text-white
                    shadow-[0_5px_12px_rgba(116,33,143,0.20)]
                    transition-all
                    duration-300
                    group-hover:scale-110
                  "
                >
                  <Arrow
                    size={14}
                    className="transition-transform duration-300"
                  />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

