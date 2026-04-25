import "@/i18n";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SITE_URL = "https://noblespaces.rw";

type Meta = { title: string; desc: string; keywords?: string };

const titles: Record<string, Meta> = {
  "/": {
    title: "Noble Spaces | Interior Design & Bespoke Furniture in Kigali, Rwanda",
    desc: "Noble Spaces — Kigali's trusted interior design studio in Rwanda. Bespoke furniture, kitchens, wardrobes, ceilings, painting and renovation. Book a consultation.",
    keywords: "Noble Spaces, Noble Spaces Rwanda, Noble Spaces Kigali, interior design Kigali, interior design Rwanda, bespoke furniture Rwanda",
  },
  "/services": {
    title: "Interior Design Services in Kigali, Rwanda | Noble Spaces",
    desc: "Explore 18+ interior services by Noble Spaces in Kigali, Rwanda — wardrobes, modern kitchens, sofas, ceilings, carpets, painting, soundproofing and more.",
    keywords: "interior services Kigali, furniture manufacturing Rwanda, kitchen installation Kigali, wardrobes Rwanda, sofa manufacturing Kigali",
  },
  "/about": {
    title: "About Noble Spaces — Interior Design Studio in Kigali, Rwanda",
    desc: "Learn about Noble Spaces — a Kigali-based interior design studio crafting noble interiors across Rwanda with skilled artisans since 2015.",
    keywords: "about Noble Spaces, interior designers Rwanda, Kigali design studio",
  },
  "/gallery": {
    title: "Gallery — Interior Design Projects in Kigali | Noble Spaces",
    desc: "Browse selected interior design and furniture projects by Noble Spaces in Kigali, Rwanda — bedrooms, kitchens, lounges, offices and more.",
    keywords: "interior design gallery Rwanda, Noble Spaces projects, Kigali interiors",
  },
  "/contact": {
    title: "Contact Noble Spaces — Kigali, Kicukiro, Gikondo | Rwanda",
    desc: "Get in touch with Noble Spaces in Kigali, Kicukiro, Gikondo. Call +250 788 906 410 or email noblespaces4@gmail.com to book your interior design consultation.",
    keywords: "contact Noble Spaces, interior designer Kigali contact, Gikondo design studio",
  },
};

const upsertMeta = (selector: string, attr: string, name: string, content: string) => {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string, hreflang?: string) => {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let tag = document.querySelector(sel);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    if (hreflang) tag.setAttribute("hreflang", hreflang);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

export const SiteLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta =
      titles[pathname] ??
      (pathname.startsWith("/services/")
        ? {
            title: `Service Details — Noble Spaces, Kigali Rwanda`,
            desc: `Discover this interior design service by Noble Spaces in Kigali, Rwanda. Expert craftsmanship and bespoke installation.`,
            keywords: "Noble Spaces service, Kigali interior service, Rwanda furniture",
          }
        : titles["/"]);

    document.title = meta.title;
    upsertMeta('meta[name="description"]', "name", "description", meta.desc);
    if (meta.keywords) {
      upsertMeta('meta[name="keywords"]', "name", "keywords", meta.keywords);
    }

    const url = `${SITE_URL}${pathname}`;
    upsertLink("canonical", url);
    upsertLink("alternate", url, "en");
    upsertLink("alternate", url, "fr");
    upsertLink("alternate", url, "rw");
    upsertLink("alternate", url, "x-default");

    upsertMeta('meta[property="og:title"]', "property", "og:title", meta.title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", meta.desc);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.desc);

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
