import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { Logo } from "./Logo";
import { SERVICES } from "@/data/services";

type ServiceItem = { title: string; desc: string };

export const Footer = () => {
  const { t } = useTranslation();
  const items = t("services.items", { returnObjects: true }) as ServiceItem[];
  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/about", label: t("nav.about") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/contact", label: t("nav.contact") },
  ];
  return (
    <footer className="border-t border-gold/15 bg-emerald-deep/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-12 lg:px-10">
        {/* Brand */}
        <div className="space-y-4 lg:col-span-4">
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

        {/* Quick links */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">{t("footer.explore")}</h3>
          <ul className="space-y-2">
            {links.map((l) => (
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

        {/* Services list */}
        <div className="lg:col-span-6">
          <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">{t("services.title")}</h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {SERVICES.map((svc, i) => (
              <li key={svc.slug}>
                <Link
                  to={`/services/${svc.slug}`}
                  className="text-sm text-foreground/80 transition-colors hover:text-gold"
                >
                  {items[i]?.title}
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
