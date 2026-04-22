import "@/i18n";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const titles: Record<string, { title: string; desc: string }> = {
  "/": {
    title: "Noble Spaces — Interior Design Services in Kigali",
    desc: "Bespoke interior design, furniture and renovation services in Kigali, Rwanda. Your space, our passion.",
  },
  "/services": {
    title: "Services — Noble Spaces",
    desc: "Fifteen interior design and craftsmanship disciplines: wardrobes, kitchens, sofas, ceilings and more.",
  },
  "/about": {
    title: "About — Noble Spaces",
    desc: "Learn about Noble Spaces — crafting noble interiors in Kigali with skilled artisans.",
  },
  "/gallery": {
    title: "Gallery — Noble Spaces",
    desc: "Selected interior design projects by Noble Spaces in Kigali, Rwanda.",
  },
  "/contact": {
    title: "Contact — Noble Spaces",
    desc: "Get in touch with Noble Spaces in Kigali, Kicukiro, Gikondo. Phone, email, and location.",
  },
};

export const SiteLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = titles[pathname] ?? titles["/"];
    document.title = meta.title;
    const tag =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    tag.setAttribute("content", meta.desc);

    // Canonical
    const canonical =
      document.querySelector('link[rel="canonical"]') ??
      (() => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        document.head.appendChild(l);
        return l;
      })();
    canonical.setAttribute("href", `${window.location.origin}${pathname}`);

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
