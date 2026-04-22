import { useTranslation } from "react-i18next";
import library from "@/assets/service-library.jpg";
import bedroom from "@/assets/service-bedroom.jpg";
import kitchen from "@/assets/service-kitchen.jpg";
import hero from "@/assets/hero-living.jpg";
import bedroom2 from "@/assets/gallery/bedroom-2.jpg";
import bathroom from "@/assets/gallery/bathroom.jpg";
import entryway from "@/assets/gallery/entryway.jpg";
import lounge from "@/assets/gallery/lounge.jpg";
import sofa from "@/assets/services/sofa.jpg";
import dining from "@/assets/services/dining.jpg";
import curtains from "@/assets/services/curtains.jpg";
import ceiling from "@/assets/services/ceiling.jpg";

export const Gallery = () => {
  const { t } = useTranslation();
  const items = [
    { src: hero, label: "Living" },
    { src: kitchen, label: "Kitchen" },
    { src: bedroom2, label: "Bedroom" },
    { src: bathroom, label: "Bathroom" },
    { src: entryway, label: "Entryway" },
    { src: library, label: "Library" },
    { src: lounge, label: "Lounge" },
    { src: dining, label: "Dining" },
    { src: sofa, label: "Sofa" },
    { src: curtains, label: "Curtains" },
    { src: ceiling, label: "Ceiling" },
    { src: bedroom, label: "Bedroom Suite" },
  ];
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
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it, i) => (
            <div
              key={i}
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
              <div className="absolute bottom-4 left-4 translate-y-2 font-display text-lg text-gold opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
