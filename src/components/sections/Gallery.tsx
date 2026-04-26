import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useServices } from "@/hooks/useServices";

export const Gallery = ({ preview = false }: { preview?: boolean }) => {
  const { t } = useTranslation();
  const { data: services } = useServices();

  // Build a curated gallery from real per-service photos.
  // Take the cover of every service that has one, then top up with extra
  // gallery images so we always show a rich, authentic grid.
  const covers = services
    .filter((s) => s.cover)
    .map((s) => ({ src: s.cover, label: s.slug.replace(/-/g, " ") }));

  const extras = services.flatMap((s) =>
    s.gallery.slice(1, 3).map((src) => ({ src, label: s.slug.replace(/-/g, " ") })),
  );

  const seen = new Set<string>();
  const all = [...covers, ...extras].filter((it) => {
    if (seen.has(it.src)) return false;
    seen.add(it.src);
    return true;
  });

  const items = preview ? all.slice(0, 8) : all;

  return (
    <section id="gallery" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gold">— 03</span>
            <h2 className="mt-4 font-display text-5xl font-semibold leading-tight lg:text-6xl">
              {t("gallery.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("gallery.subtitle")}</p>
          </div>
          {preview && (
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-3 text-xs uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold/10"
            >
              {t("common.view_all")} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <div
              key={`${it.src}-${i}`}
              className={`group relative overflow-hidden rounded-3xl border border-gold/20 ${
                i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
              }`}
            >
              <img
                src={it.src}
                alt={it.label}
                loading="lazy"
                width={1280}
                height={896}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-4 left-4 translate-y-2 font-display text-lg capitalize text-gold opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
