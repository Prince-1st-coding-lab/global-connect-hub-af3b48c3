import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Booking = {
  id: string;
  user_id: string;
  service_name: string;
  booking_date: string;
  time_slot: string;
  status: string;
  order_id: string | null;
  created_at: string;
};

type Order = { id: string; amount: number; status: string };

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const AdminBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: bData } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: false })
        .limit(500);
      const b = (bData ?? []) as Booking[];
      if (!alive) return;
      setBookings(b);

      const orderIds = Array.from(new Set(b.map((x) => x.order_id).filter(Boolean) as string[]));
      if (orderIds.length) {
        const { data: oData } = await supabase
          .from("orders")
          .select("id,amount,status")
          .in("id", orderIds);
        const map: Record<string, Order> = {};
        (oData ?? []).forEach((o: any) => (map[o.id] = o));
        if (!alive) return;
        setOrders(map);
      }
      setLoading(false);
    })();

    const ch = supabase
      .channel("bookings-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        supabase
          .from("bookings")
          .select("*")
          .order("booking_date", { ascending: false })
          .limit(500)
          .then(({ data }) => setBookings((data ?? []) as Booking[]));
      })
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter],
  );

  const metrics = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const revenue = bookings.reduce((sum, b) => {
      const o = b.order_id ? orders[b.order_id] : null;
      if (o && (o.status === "successful" || o.status === "completed")) return sum + Number(o.amount || 0);
      return sum;
    }, 0);
    return { total, confirmed, pending, revenue };
  }, [bookings, orders]);

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Bookings</h2>
          <p className="text-xs text-muted-foreground">All customer appointments across the platform.</p>
        </div>
        <div className="w-44">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Total" value={metrics.total} />
        <Metric label="Confirmed" value={metrics.confirmed} />
        <Metric label="Pending" value={metrics.pending} />
        <Metric label="Revenue (RWF)" value={metrics.revenue.toLocaleString()} />
      </div>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <div className="grid gap-2">
          {filtered.map((b) => {
            const o = b.order_id ? orders[b.order_id] : null;
            return (
              <div key={b.id} className="rounded-lg border border-gold/20 bg-card p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{b.service_name}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs uppercase tracking-wider ${statusStyles[b.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {b.status}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{b.booking_date} · {b.time_slot}</span>
                  {o && <span>RWF {Number(o.amount).toLocaleString()} ({o.status})</span>}
                  <span>user: {b.user_id.slice(0, 8)}…</span>
                </div>
              </div>
            );
          })}
          {!filtered.length && <p className="text-sm text-muted-foreground">No bookings match this filter.</p>}
        </div>
      )}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border border-gold/20 bg-card p-3">
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-2xl text-gold">{value}</div>
  </div>
);
