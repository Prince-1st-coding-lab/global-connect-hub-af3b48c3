import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { to: "/", label: t("nav.home"), end: true },
    { to: "/services", label: t("nav.services") },
    { to: "/about", label: t("nav.about") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-light uppercase tracking-[0.2em] transition-colors ${
      isActive ? "text-gold" : "text-foreground/80 hover:text-gold"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled || pathname !== "/" ? "bg-background/85 backdrop-blur-xl border-b border-gold/10" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Logo />
        <div className="hidden items-center gap-10 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden rounded-full border border-gold/40 p-2 text-gold"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-gold/10 bg-background/95 backdrop-blur-xl">
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `py-2 text-sm uppercase tracking-[0.2em] ${isActive ? "text-gold" : "text-foreground/80 hover:text-gold"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
