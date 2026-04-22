import { useTranslation } from "react-i18next";
import { Instagram, Facebook } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gold/15 bg-emerald-deep/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 lg:flex-row lg:px-10">
        <Logo />
        <div className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
          © {new Date().getFullYear()} Noble Spaces — {t("footer.rights")}
        </div>
        <div className="flex items-center gap-3">
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
    </footer>
  );
};
