import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  const { t } = useTranslation();
  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/about", label: t("nav.about") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/contact", label: t("nav.contact") },
  ];
  return (
    <footer className="border-t border-gold/15 bg-emerald-deep/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-3 lg:px-10">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Noble Spaces — {t("hero.tagline")}
          </p>
        </div>

        <nav className="flex flex-wrap items-start gap-x-6 gap-y-2 lg:justify-center">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-xs uppercase tracking-[0.25em] text-foreground/80 hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 lg:justify-end">
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
      <div className="border-t border-gold/10 px-6 py-5 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        © {new Date().getFullYear()} Noble Spaces — {t("footer.rights")}
      </div>
    </footer>
  );
};
