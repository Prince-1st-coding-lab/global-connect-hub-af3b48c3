import { useTranslation } from "react-i18next";
import {
  Shirt, ChefHat, Tv, Briefcase, Scissors, Sparkles,
  Blinds, Volume2, LayoutPanelTop, Baby, Sofa, PanelTop,
  Brush, Dog, Utensils,
} from "lucide-react";

const icons = [Shirt, ChefHat, Tv, Briefcase, Scissors, Sparkles, Blinds, Volume2, LayoutPanelTop, Baby, Sofa, PanelTop, Brush, Dog, Utensils];

type ServiceItem = { title: string; desc: string };

export const Services = () => {
  const { t } = useTranslation();
  const items = t("services.items", { returnObjects: true }) as ServiceItem[];

  return (
    <section id="services" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">— 01</span>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-tight lg:text-6xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("services.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = icons[i] ?? Sofa;
            return (
              <article
                key={i}
                className="group relative flex flex-col gap-4 bg-card p-7 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-all group-hover:bg-gold group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <h3 className="font-display text-xl font-medium text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
