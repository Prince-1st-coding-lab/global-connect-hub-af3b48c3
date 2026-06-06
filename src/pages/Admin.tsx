import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { externalSupabase, type Payment, type PaymentLink, type Promoter } from "@/integrations/external-supabase";

const Admin = () => {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    document.title = "Admin — Noble Spaces";
    externalSupabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      if (session?.user?.id) checkAdmin(session.user.id).then(setIsAdmin);
      else setIsAdmin(false);
    });
    externalSupabase.auth.getSession().then(async ({ data }) => {
      setAuthed(!!data.session);
      if (data.session?.user?.id) setIsAdmin(await checkAdmin(data.session.user.id));
      setReady(true);
    });
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
          Your account is not an admin.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => externalSupabase.auth.signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </section>
    );
  }
  return <Dashboard />;
};

async function checkAdmin(userId: string) {
  const { data } = await externalSupabase
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
    const { error } = await externalSupabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
  };

  return (
    <section className="mx-auto max-w-md px-6 py-40">
      <h1 className="font-display text-3xl">Admin sign in</h1>
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
  const promoters = useQuery({
    queryKey: ["ext-promoters"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("promoters")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Promoter[];
    },
  });
  const payments = useQuery({
    queryKey: ["ext-payments"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Payment[];
    },
  });
  const paymentLinks = useQuery({
    queryKey: ["ext-payment-links"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("payment_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PaymentLink[];
    },
  });

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Admin dashboard</h1>
        <Button variant="outline" onClick={() => externalSupabase.auth.signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Payment Links section */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl">Payment Links</h2>
            <p className="text-xs text-muted-foreground">
              Set an amount and a payment URL. Customers will see these in the booking dialog and open them in a new tab.
            </p>
          </div>
          <PaymentLinkDialog
            onSaved={() => qc.invalidateQueries({ queryKey: ["ext-payment-links"] })}
          />
        </div>
        {paymentLinks.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid gap-2">
            {(paymentLinks.data ?? []).map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-gold/20 bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{l.label}</span>
                    {!l.active && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        inactive
                      </span>
                    )}
                  </div>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-gold"
                  >
                    {l.url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <span className="rounded bg-gold/15 px-2 py-1 text-sm text-gold">
                  RWF {Number(l.amount).toLocaleString()}
                </span>
                <PaymentLinkDialog
                  existing={l}
                  onSaved={() => qc.invalidateQueries({ queryKey: ["ext-payment-links"] })}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm(`Delete payment link "${l.label}"?`)) return;
                    const { error } = await externalSupabase
                      .from("payment_links")
                      .delete()
                      .eq("id", l.id);
                    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
                    else qc.invalidateQueries({ queryKey: ["ext-payment-links"] });
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {(!paymentLinks.data || !paymentLinks.data.length) && (
              <p className="text-sm text-muted-foreground">
                No payment links yet. Add one — it will appear instantly inside every booking dialog.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Promoters */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl">Promoters</h2>
            <NewPromoterDialog onCreated={() => qc.invalidateQueries({ queryKey: ["ext-promoters"] })} />
          </div>
          {promoters.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="grid gap-2">
              {(promoters.data ?? []).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-gold/20 bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.name || "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.phone || "no phone"}</div>
                  </div>
                  <code className="rounded bg-muted px-2 py-1 text-xs text-gold">{p.referral_code}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Delete promoter "${p.name || p.referral_code}"?`)) return;
                      const { error } = await externalSupabase.from("promoters").delete().eq("id", p.id);
                      if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
                      else qc.invalidateQueries({ queryKey: ["ext-promoters"] });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {(!promoters.data || !promoters.data.length) && (
                <p className="text-sm text-muted-foreground">No promoters yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Payments */}
        <div>
          <h2 className="mb-3 font-display text-2xl">Payments</h2>
          {payments.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="grid gap-2">
              {(payments.data ?? []).map((p) => (
                <div key={p.id} className="rounded-lg border border-gold/20 bg-card p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{p.customer_name || "—"}</span>
                    <StatusBadge status={p.payment_status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{p.customer_phone}</span>
                    <span>RWF {Number(p.amount).toLocaleString()}</span>
                    {p.referral_code && <span>ref: {p.referral_code}</span>}
                    <span>{new Date(p.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {(!payments.data || !payments.data.length) && (
                <p className="text-sm text-muted-foreground">No payments yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const cls =
    status === "completed" ? "bg-emerald-500/15 text-emerald-400"
    : status === "failed" ? "bg-destructive/15 text-destructive"
    : "bg-gold/15 text-gold";
  return <span className={`rounded px-2 py-0.5 text-xs uppercase tracking-wide ${cls}`}>{status}</span>;
};

const PaymentLinkDialog = ({
  existing,
  onSaved,
}: {
  existing?: PaymentLink;
  onSaved: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(existing?.label ?? "");
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [active, setActive] = useState(existing?.active ?? true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLabel(existing?.label ?? "");
    setAmount(existing?.amount?.toString() ?? "");
    setUrl(existing?.url ?? "");
    setActive(existing?.active ?? true);
  }, [open, existing]);

  const submit = async () => {
    const amt = Number(amount);
    if (!label.trim() || !url.trim() || !Number.isFinite(amt) || amt <= 0) {
      toast({ title: "Label, amount and URL are required", variant: "destructive" });
      return;
    }
    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid payment URL", variant: "destructive" });
      return;
    }
    setBusy(true);
    const payload = { label: label.trim(), amount: amt, url: url.trim(), active };
    const { error } = existing
      ? await externalSupabase.from("payment_links").update(payload).eq("id", existing.id)
      : await externalSupabase.from("payment_links").insert(payload);
    setBusy(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: existing ? "Payment link updated" : "Payment link created" });
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing ? (
          <Button size="icon" variant="ghost" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New payment link</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit payment link" : "New payment link"}</DialogTitle>
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
          <div className="space-y-1.5">
            <Label>Payment URL *</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://pay.xentripay.com/..."
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

const NewPromoterDialog = ({ onCreated }: { onCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!code.trim()) {
      toast({ title: "Referral code required", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await externalSupabase.from("promoters").insert({
      name: name || null,
      phone: phone || null,
      referral_code: code.trim().toUpperCase(),
    });
    setBusy(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Promoter added" });
    setOpen(false);
    setName(""); setPhone(""); setCode("");
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New promoter</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New promoter</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Referral code *</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. JEAN10" />
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
