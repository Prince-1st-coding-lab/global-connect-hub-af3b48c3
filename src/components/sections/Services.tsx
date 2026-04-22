import { useTranslation } from "react-i18next";
import {
  Sofa, Hammer, Armchair, Briefcase, LayoutPanelTop, ChefHat,
  PanelTop, Wrench, Blinds, DoorOpen, Volume2, Settings,
} from "lucide-react";

const icons = [Sofa, Hammer, Armchair, Briefcase, LayoutPanelTop, ChefHat, PanelTop, Wrench, Blinds, DoorOpen, Volume2, Settings];

export const Services = () => {
  const { t } = useTranslation();
  const items = t("services.items", { returnObjects: true }) as string[];

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
          {items.map((label, i) => {
            const Icon = icons[i] ?? Sofa;
            return (
              <div
                key={i}
                className="group relative flex items-start gap-5 bg-card p-7 transition-colors hover:bg-secondary"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-all group-hover:bg-gold group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-medium text-foreground">{label}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
