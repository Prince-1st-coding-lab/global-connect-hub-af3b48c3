import "@/i18n";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "Noble Spaces — Interior Design Services in Kigali";
    const meta = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "Noble Spaces — bespoke interior design, furniture and renovation services in Kigali, Rwanda. Your space, our passion."
    );
  }, []);

  return (
    <main className="relative overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
