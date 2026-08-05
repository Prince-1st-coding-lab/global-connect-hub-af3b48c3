import type { ReactNode } from "react";

export const PageHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="font-display text-2xl md:text-3xl">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);

export const StatusChip = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  const cls =
    s === "completed" || s === "approved" || s === "paid" || s === "active"
      ? "bg-emerald-500/15 text-emerald-500"
      : s === "failed" || s === "rejected" || s === "cancelled"
        ? "bg-destructive/15 text-destructive"
        : s === "done" || s === "read" || s === "hidden"
          ? "bg-muted text-muted-foreground"
          : "bg-gold/15 text-gold";
  return <span className={`rounded px-2 py-0.5 text-xs uppercase tracking-wide ${cls}`}>{status}</span>;
};

export const EmptyState = ({ text }: { text: string }) => (
  <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
    {text}
  </p>
);

/**
 * Wraps a table so it scrolls horizontally instead of squeezing on small screens,
 * and keeps rows readable on mobile.
 */
export const ResponsiveTable = ({ children }: { children: ReactNode }) => (
  <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
    <div className="min-w-[640px]">{children}</div>
  </div>
);

/** Mobile-friendly stacked record card used in place of table rows below md. */
export const RecordCard = ({
  title,
  subtitle,
  meta,
  actions,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="rounded-xl border border-border p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {meta}
    </div>
    {children && <div className="mt-3 space-y-1 text-sm text-muted-foreground">{children}</div>}
    {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
  </div>
);
