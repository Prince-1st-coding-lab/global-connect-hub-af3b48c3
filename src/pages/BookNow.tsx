import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES } from "@/data/services";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
];

type ServicePrice = { slug: string; label: string; amount: number; active: boolean };

const humanize = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const BookNow = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [serviceSlug, setServiceSlug] = useState<string>(SERVICES[0]?.slug ?? "");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState<ServicePrice | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [step, setStep] = useState<"form" | "summary">("form");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    document.title = "Book an Appointment — Noble Spaces";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user?.email) setEmail((e) => e || session.user!.email!);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      if (data.session?.user?.email) setEmail((e) => e || data.session!.user!.email!);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!serviceSlug) return;
    setPriceLoading(true);
    supabase
      .from("service_prices")
      .select("slug,label,amount,active")
      .eq("slug", serviceSlug)
      .eq("active", true)
      .maybeSingle()
      .then(({ data }) => {
        setPrice((data as ServicePrice | null) ?? null);
        setPriceLoading(false);
      });
  }, [serviceSlug]);

  const serviceTitle = useMemo(() => humanize(serviceSlug), [serviceSlug]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
    setAuthBusy(false);
    if (error) toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
  };
  const signUp = async () => {
    if (!authEmail || !authPass) {
      toast({ title: "Email and password required", variant: "destructive" });
      return;
    }
    setAuthBusy(true);
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPass,
      options: { emailRedirectTo: window.location.origin + "/book" },
    });
    setAuthBusy(false);
    if (error) toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
    else toast({ title: "Account created", description: "Check your email if confirmation is required." });
  };

  const canContinue = serviceSlug && date && slot && name.trim() && phone.trim();

  const goSummary = () => {
    if (!canContinue) {
      toast({ title: "Please fill service, date, time, name and phone.", variant: "destructive" });
      return;
    }
    setStep("summary");
  };

  const payAndBook = async () => {
    if (!userId) {
      toast({ title: "Please sign in to book.", variant: "destructive" });
      return;
    }
    if (!price) {
      toast({ title: "Online payment is not configured for this service.", variant: "destructive" });
      return;
    }
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("initiate-paypack-checkout", {
        body: {
          amount: Number(price.amount),
          phone,
          item_name: `${serviceTitle} — ${format(date!, "PPP")} ${slot}`,
          email: email || undefined,
          customer_name: name,
          notes: `Booking ${format(date!, "yyyy-MM-dd")} ${slot}`,
          service_slug: serviceSlug,
        },
      });
      if (error) throw new Error(error.message ?? "Payment request failed");
      if (!data?.ok) throw new Error(data?.error ?? "Payment was rejected");

      const { error: bErr } = await supabase.from("bookings").insert({
        user_id: userId,
        service_name: serviceTitle,
        booking_date: format(date!, "yyyy-MM-dd"),
        time_slot: slot,
        status: "pending",
        order_id: data.order_id ?? null,
      });
      if (bErr) throw new Error(bErr.message);

      toast({
        title: "Check your phone 📱",
        description: data?.message ?? "Approve the Mobile Money PIN prompt to confirm your booking.",
      });
      navigate("/my-bookings");
    } catch (e: any) {
      toast({
        title: "Could not start payment",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  if (!userId) {
    return (
      <section className="mx-auto max-w-md px-6 py-32">
        <h1 className="font-display text-3xl">Sign in to book</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an account or sign in to manage your appointments.
        </p>
        <form className="mt-6 space-y-4" onSubmit={signIn}>
          <div className="space-y-1.5">
            <Label htmlFor="ae">Email</Label>
            <Input id="ae" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ap">Password</Label>
            <Input id="ap" type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={authBusy}>
              {authBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Sign in
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={signUp} disabled={authBusy}>
              Sign up
            </Button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Book an appointment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a service, day and time. Confirm with Mobile Money payment.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/my-bookings")}>My bookings</Button>
      </div>

      {step === "form" ? (
        <div className="mt-8 space-y-6 rounded-2xl border border-gold/20 bg-card p-6">
          <div className="space-y-1.5">
            <Label>Service *</Label>
            <Select value={serviceSlug} onValueChange={setServiceSlug}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {SERVICES.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>{humanize(s.slug)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label>Time slot *</Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bn">Full name *</Label>
              <Input id="bn" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bp">Mobile Money number *</Label>
              <Input id="bp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="be">Email</Label>
              <Input id="be" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gold/20 bg-secondary/30 p-3 text-sm">
            <span className="text-muted-foreground">Price</span>
            {priceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : price ? (
              <span className="font-medium text-gold">RWF {Number(price.amount).toLocaleString()}</span>
            ) : (
              <span className="text-xs text-muted-foreground">Not configured</span>
            )}
          </div>

          <Button onClick={goSummary} className="w-full" disabled={!canContinue}>
            Continue to checkout
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6 rounded-2xl border border-gold/20 bg-card p-6">
          <h2 className="font-display text-2xl">Checkout summary</h2>
          <dl className="grid gap-2 text-sm">
            <Row k="Service" v={serviceTitle} />
            <Row k="Date" v={date ? format(date, "PPP") : "—"} />
            <Row k="Time" v={slot} />
            <Row k="Name" v={name} />
            <Row k="Phone" v={phone} />
            {email && <Row k="Email" v={email} />}
            <Row
              k="Amount"
              v={price ? `RWF ${Number(price.amount).toLocaleString()}` : "—"}
              highlight
            />
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setStep("form")}>
              Back
            </Button>
            <Button
              className="sm:flex-1 bg-gold text-primary-foreground hover:bg-gold/90"
              onClick={payAndBook}
              disabled={paying || !price}
            >
              {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
              Pay with Mobile Money
            </Button>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-gold" />
            You'll receive a Mobile Money PIN prompt on your phone.
          </p>
        </div>
      )}
    </section>
  );
};

const Row = ({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) => (
  <div className="flex items-center justify-between border-b border-gold/10 py-2 last:border-0">
    <dt className="text-muted-foreground">{k}</dt>
    <dd className={highlight ? "font-medium text-gold" : ""}>{v}</dd>
  </div>
);

export default BookNow;
