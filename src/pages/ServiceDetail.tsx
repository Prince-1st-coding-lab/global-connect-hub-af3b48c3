import "@/i18n";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Phone, Mail, CheckCircle2, Hammer, CalendarClock, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingDialog } from "@/components/BookingDialog";
import { SERVICES, getServiceBySlug, getServiceIndex } from "@/data/services";

type ServiceItem = { title: string; desc: string };

const ServiceDetail = () => {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const svc = getServiceBySlug(slug);
  const idx = getServiceIndex(slug);
  const items = t("services.items", { returnObjects: true }) as ServiceItem[];
  const item = idx >= 0 ? items[idx] : undefined;

  useEffect(() => {
    if (item) {
      document.title = `${item.title} — Noble Spaces`;
      const meta =
        document.querySelector('meta[name="description"]') ??
        (() => {
          const m = document.createElement("meta");
          m.setAttribute("name", "description");
          document.head.appendChild(m);
          return m;
        })();
      meta.setAttribute("content", item.desc);
    }
  }, [item]);

  if (!svc || !item) {
    return (
      <main className="relative overflow-x-hidden bg-background text-foreground">
        <Navbar />
        <section className="mx-auto max-w-3xl px-6 py-40 text-center">
          <h1 className="font-display text-4xl">Service not found</h1>
          <Link to="/services" className="mt-6 inline-flex items-center gap-2 text-gold">
            <ArrowLeft className="h-4 w-4" /> Back to services
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const prev = SERVICES[(idx - 1 + SERVICES.length) % SERVICES.length];
  const next = SERVICES[(idx + 1) % SERVICES.length];
  const prevTitle = items[(idx - 1 + SERVICES.length) % SERVICES.length].title;
  const nextTitle = items[(idx + 1) % SERVICES.length].title;
  const Icon = svc.icon;

  return (
    <main className="relative overflow-x-hidden bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 lg:pt-44">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80 hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("nav.services")}
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">
                  — {String(idx + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
                </span>
              </div>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-tight lg:text-6xl">
                {item.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {item.desc}
              </p>

              {/* Availability card */}
              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gold/20 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold/80">
                    {svc.availability === "both" ? <CheckCircle2 className="h-4 w-4" />
                      : svc.availability === "custom" ? <Hammer className="h-4 w-4" />
                      : <CalendarClock className="h-4 w-4" />}
                    {t("booking.availability")}
                  </div>
                  <div className="mt-2 font-display text-base text-foreground">
                    {svc.availability === "both" && t("booking.ready_stock")}
                    {svc.availability === "custom" && t("booking.custom_only")}
                    {svc.availability === "service" && t("booking.on_site")}
                  </div>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold/80">
                    <Clock className="h-4 w-4" /> {t("booking.lead_time")}
                  </div>
                  <div className="mt-2 font-display text-base text-foreground">
                    {svc.leadTimeDays[0]}–{svc.leadTimeDays[1]} {t("booking.days")}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <BookingDialog serviceTitle={item.title} availability={svc.availability} />
                <a
                  href="tel:+250788906410"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/10"
                >
                  <Phone className="h-4 w-4" /> {t("hero.cta_primary")}
                </a>
                <a
                  href="mailto:noblespaces4@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/10"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-deep">
              <img
                src={svc.cover}
                alt={item.title}
                width={1280}
                height={896}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold">— Gallery</span>
              <h2 className="mt-3 font-display text-3xl lg:text-4xl">{t("gallery.title")}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {svc.gallery.map((src, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl border border-gold/15 ${
                  i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"
                }`}
              >
                <img
                  src={src}
                  alt={`${item.title} ${i + 1}`}
                  loading="lazy"
                  width={1280}
                  height={896}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prev / Next */}
      <section className="border-t border-gold/10 py-16">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-2xl border border-gold/15 bg-gold/15 px-6 sm:grid-cols-2 lg:px-10">
          <Link
            to={`/services/${prev.slug}`}
            className="group flex items-center justify-between gap-6 bg-card p-8 transition-colors hover:bg-secondary"
          >
            <div className="flex items-center gap-4">
              <ArrowLeft className="h-5 w-5 text-gold transition-transform group-hover:-translate-x-1" />
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-gold/70">Previous</div>
                <div className="mt-1 font-display text-lg">{prevTitle}</div>
              </div>
            </div>
          </Link>
          <Link
            to={`/services/${next.slug}`}
            className="group flex items-center justify-between gap-6 bg-card p-8 transition-colors hover:bg-secondary sm:text-right"
          >
            <div className="flex flex-1 items-center justify-end gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-gold/70">Next</div>
                <div className="mt-1 font-display text-lg">{nextTitle}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ServiceDetail;
