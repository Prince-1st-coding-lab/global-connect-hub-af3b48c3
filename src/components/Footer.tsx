import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { Logo } from "./Logo";
import { SERVICES } from "@/data/services";

type ServiceItem = { title: string; desc: string };

// Short labels shown in the footer (kept compact like the reference image)
const SHORT_LABELS: Record<string, string> = {
  "wardrobes-manufacturing": "Wardrobes",
  "modern-kitchen-installations": "Modern Kitchens",
  "media-tv-wall-installation": "TV Wall Units",
  "office-equipment-supply": "Office Equipment",
  "fabric-replacement": "Fabric Replacement",
  "sofa-cleaning": "Sofa Cleaning",
  "curtains-supply-installation": "Curtains",
  "soundproof-installation": "Soundproofing",
  "wall-partitioning": "Wall Partitioning",
  "baby-beds-manufacturing": "Baby Beds",
  "sofa-manufacturing": "Sofa Manufacturing",
  "ceiling-installation": "Ceilings",
  "carpet-cleaning": "Carpet Cleaning",
  "pet-houses-manufacturing": "Pet Houses",
  "dining-tables-manufacturing": "Dining Tables",
  "console-installation": "Consoles",
  "carpet-supply-installation": "Curtains Supply",
  "painting-works": "Painting Works",
};

export const Footer = () => {
  const { t } = useTranslation();
  const items = t("services.items", { returnObjects: true }) as ServiceItem[];

  // Split services into two columns: primary (first 7) and more (rest)
  const primary = SERVICES.slice(0, 7);
  const more = SERVICES.slice(7);

  const ServiceLink = ({ svc, idx }: { svc: typeof SERVICES[number]; idx: number }) => {
    const Icon = svc.icon;
    const label = SHORT_LABELS[svc.slug] ?? items[idx]?.title ?? svc.slug;
    return (
      <li>
        <Link
          to={`/services/${svc.slug}`}
          className="group flex items-center gap-3 py-1.5 text-sm text-foreground/80 transition-colors hover:text-gold"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <footer className="border-t border-gold/15 bg-emerald-deep/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-12 lg:px-10">
        {/* Brand */}
        <div className="space-y-4 lg:col-span-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Noble Spaces — {t("hero.tagline")}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Services column */}
        <div className="lg:col-span-3">
          <h3 className="mb-5 text-xs uppercase tracking-[0.3em] text-gold">
            {t("services.title")}
          </h3>
          <ul className="space-y-1">
            {primary.map((svc, i) => (
              <ServiceLink key={svc.slug} svc={svc} idx={i} />
            ))}
          </ul>
        </div>

        {/* More services column */}
        <div className="lg:col-span-3">
          <h3 className="mb-5 text-xs uppercase tracking-[0.3em] text-gold">
            {t("footer.more_services")}
          </h3>
          <ul className="space-y-1">
            {more.map((svc, i) => (
              <ServiceLink key={svc.slug} svc={svc} idx={i + 7} />
            ))}
          </ul>
        </div>

        {/* Explore column */}
        <div className="lg:col-span-3">
          <h3 className="mb-5 text-xs uppercase tracking-[0.3em] text-gold">
            {t("footer.explore")}
          </h3>
          <ul className="space-y-2">
            {[
              { to: "/", label: t("nav.home") },
              { to: "/services", label: t("nav.services") },
              { to: "/about", label: t("nav.about") },
              { to: "/gallery", label: t("nav.gallery") },
              { to: "/contact", label: t("nav.contact") },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-foreground/80 transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/10 px-6 py-5 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        © {new Date().getFullYear()} Noble Spaces — {t("footer.rights")}
      </div>
    </footer>
  );
};
