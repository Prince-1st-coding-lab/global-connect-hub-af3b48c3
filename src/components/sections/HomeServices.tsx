import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HOME_SERVICES } from "@/data/homeServices";

export const HomeServices = ({ preview = false }: { preview?: boolean }) => {
  const shown = preview ? HOME_SERVICES.slice(0, 6) : HOME_SERVICES;

  return (
    <section id="home-services" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">— Noble Home Services</span>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight lg:text-5xl">
              Care for your home &amp; workplace
            </h2>
            <p className="mt-4 text-muted-foreground">
              Maintenance, cleaning and set-up services delivered by our trusted in-house team.
            </p>
          </div>
          {preview && (
            <Link
              to="/home-services"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-3 text-xs uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold/10"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <article
                key={svc.slug}
                className="group relative flex flex-col gap-4 bg-card p-7 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-all group-hover:bg-gold group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <h3 className="font-display text-xl font-medium text-foreground">{svc.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{svc.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-gold/90"
          >
            Book a home service
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
