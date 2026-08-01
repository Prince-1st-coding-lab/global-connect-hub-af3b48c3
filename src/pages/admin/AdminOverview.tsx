import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MessageSquare, Package, Quote, Receipt, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminUi";

const Stat = ({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Receipt;
  hint?: string;
}) => (
  <div className="rounded-xl border border-gold/20 bg-card p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-gold" />
    </div>
    <div className="mt-2 font-display text-2xl">{value}</div>
    {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
  </div>
);

const AdminOverview = () => {
  const stats = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [orders, bookings, quotes, messages, products] = await Promise.all([
        supabase.from("orders").select("amount,total,status,created_at").limit(1000),
        supabase.from("bookings").select("id,status,created_at").limit(1000),
        supabase.from("quote_requests").select("id,status").limit(1000),
        supabase.from("contact_messages").select("id,status").limit(1000),
        supabase.from("products").select("id,stock,low_stock_threshold").limit(1000),
      ]);
      const o = orders.data ?? [];
      const revenue = o
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + Number(r.total || r.amount || 0), 0);
      return {
        revenue,
        ordersCount: o.length,
        pendingOrders: o.filter((r) => r.status === "pending").length,
        bookings: (bookings.data ?? []).length,
        pendingBookings: (bookings.data ?? []).filter((b) => b.status === "pending").length,
        quotes: (quotes.data ?? []).filter((q) => q.status === "new").length,
        messages: (messages.data ?? []).filter((m) => m.status === "new").length,
        lowStock: (products.data ?? []).filter((p) => p.stock <= p.low_stock_threshold).length,
        products: (products.data ?? []).length,
      };
    },
  });

  const s = stats.data;

  return (
    <>
      <PageHeader title="Dashboard" description="A live snapshot of your business." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Revenue (completed)"
          value={`RWF ${Number(s?.revenue ?? 0).toLocaleString()}`}
          icon={TrendingUp}
        />
        <Stat label="Orders" value={s?.ordersCount ?? 0} icon={Receipt} hint={`${s?.pendingOrders ?? 0} pending`} />
        <Stat
          label="Bookings"
          value={s?.bookings ?? 0}
          icon={CalendarCheck}
          hint={`${s?.pendingBookings ?? 0} pending`}
        />
        <Stat label="New quotations" value={s?.quotes ?? 0} icon={Quote} />
        <Stat label="Unread messages" value={s?.messages ?? 0} icon={MessageSquare} />
        <Stat
          label="Products"
          value={s?.products ?? 0}
          icon={Package}
          hint={`${s?.lowStock ?? 0} low on stock`}
        />
      </div>
    </>
  );
};

export default AdminOverview;
