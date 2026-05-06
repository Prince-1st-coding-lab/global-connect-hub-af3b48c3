import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { externalSupabase, type Payment, type Promoter } from "@/integrations/external-supabase";

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

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Promoter dashboard</h1>
        <Button variant="outline" onClick={() => externalSupabase.auth.signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
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
