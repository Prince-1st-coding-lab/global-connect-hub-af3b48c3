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
    s === "completed" || s === "approved" || s === "paid"
      ? "bg-emerald-500/15 text-emerald-500"
      : s === "failed" || s === "rejected" || s === "cancelled"
        ? "bg-destructive/15 text-destructive"
        : s === "done" || s === "read"
          ? "bg-muted text-muted-foreground"
          : "bg-gold/15 text-gold";
  return <span className={`rounded px-2 py-0.5 text-xs uppercase tracking-wide ${cls}`}>{status}</span>;
};

export const EmptyState = ({ text }: { text: string }) => (
  <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
    {text}
  </p>
);
