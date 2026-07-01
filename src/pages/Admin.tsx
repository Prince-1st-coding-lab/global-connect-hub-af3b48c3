import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES } from "@/data/services";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { ServicePhotoManager } from "@/components/admin/ServicePhotoManager";

type ServicePrice = {
  slug: string;
  label: string;
  amount: number;
  active: boolean;
};

type Order = {
  id: string;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  service_slug: string | null;
  item_name: string | null;
  amount: number;
  status: string;
  paypack_ref: string | null;
  created_at: string;
};

const Admin = () => {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    document.title = "Admin — Noble Spaces";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (session?.user?.id) checkAdmin(session.user.id).then(setIsAdmin);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setAuthed(!!data.session);
      if (data.session?.user?.id) setIsAdmin(await checkAdmin(data.session.user.id));
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <section className="mx-auto max-w-md px-6 py-40 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </section>
    );
  }
  if (!authed) return <SignIn />;
  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-40 text-center">
        <h1 className="font-display text-2xl">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to administrators. Redirecting you home…
        </p>
        <Navigate to="/" replace />
      </section>
    );
  }
  return <Dashboard />;
};

async function checkAdmin(userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
  };

  return (
    <section className="mx-auto max-w-md px-6 py-40">
      <h1 className="font-display text-3xl">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the admin account configured in Lovable Cloud → Auth.
      </p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pwd">Password</Label>
          <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Sign in
        </Button>
      </form>
    </section>
  );
};

const Dashboard = () => {
  const qc = useQueryClient();

  const prices = useQuery({
    queryKey: ["service-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_prices")
        .select("*");
      if (error) throw error;
      return (data ?? []) as ServicePrice[];
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });

  const priceFor = (slug: string) => prices.data?.find((p) => p.slug === slug);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Admin dashboard</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Service prices */}
      <div className="mt-10">
        <div className="mb-3">
          <h2 className="font-display text-2xl">Service prices</h2>
          <p className="text-xs text-muted-foreground">
            Set the amount (RWF) customers will pay when they click <em>Pay with Paypack</em> on each
            service's booking dialog. Inactive services hide the online payment button.
          </p>
        </div>
        {prices.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid gap-2">
            {SERVICES.map((s) => {
              const p = priceFor(s.slug);
              return (
                <div
                  key={s.slug}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-gold/20 bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{s.slug}</div>
                    <div className="text-xs text-muted-foreground">
                      {p ? p.label : "no price set"} {p && !p.active && "(inactive)"}
                    </div>
                  </div>
                  <span className="rounded bg-gold/15 px-2 py-1 text-sm text-gold">
                    {p ? `RWF ${Number(p.amount).toLocaleString()}` : "—"}
                  </span>
                  <PriceDialog
                    slug={s.slug}
                    existing={p}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["service-prices"] })}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="mt-10">
        <h2 className="font-display text-2xl">Bookings & payments</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Every Pay-with-Paypack click creates an order. Status updates automatically via the
          Paypack webhook.
        </p>
        {orders.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid gap-2">
            {(orders.data ?? []).map((o) => (
              <div key={o.id} className="rounded-lg border border-gold/20 bg-card p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{o.customer_name || o.email || "—"}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {o.phone && <span>{o.phone}</span>}
                  {o.email && <span>{o.email}</span>}
                  {o.service_slug && <span>service: {o.service_slug}</span>}
                  <span>{o.item_name}</span>
                  <span>RWF {Number(o.amount).toLocaleString()}</span>
                  {o.paypack_ref && <span>ref: {o.paypack_ref}</span>}
                  <span>{new Date(o.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {(!orders.data || !orders.data.length) && (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
          </div>
        )}
      </div>

      <AdminBookings />
      <ServicePhotoManager />
    </section>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const cls =
    status === "completed" ? "bg-emerald-500/15 text-emerald-400"
    : status === "failed" ? "bg-destructive/15 text-destructive"
    : status === "cancelled" ? "bg-muted text-muted-foreground"
    : "bg-gold/15 text-gold";
  return <span className={`rounded px-2 py-0.5 text-xs uppercase tracking-wide ${cls}`}>{status}</span>;
};

const PriceDialog = ({
  slug,
  existing,
  onSaved,
}: {
  slug: string;
  existing?: ServicePrice;
  onSaved: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(existing?.label ?? "Service booking");
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? "");
  const [active, setActive] = useState(existing?.active ?? true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLabel(existing?.label ?? "Service booking");
    setAmount(existing?.amount?.toString() ?? "");
    setActive(existing?.active ?? true);
  }, [open, existing]);

  const submit = async () => {
    const amt = Number(amount);
    if (!label.trim() || !Number.isFinite(amt) || amt <= 0) {
      toast({ title: "Label and a positive amount are required", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("service_prices")
      .upsert({ slug, label: label.trim(), amount: amt, active }, { onConflict: "slug" });
    setBusy(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="mr-2 h-3 w-3" /> {existing ? "Edit" : "Set price"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Price for {slug}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Label *</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Consultation deposit" />
          </div>
          <div className="space-y-1.5">
            <Label>Amount (RWF) *</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} id="active" />
            <Label htmlFor="active">Show on booking dialog</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
