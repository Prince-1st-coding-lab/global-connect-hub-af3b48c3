import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Smartphone, MessageCircle, ArrowLeft, CalendarCheck } from "lucide-react";
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
import { PayOptionsDialog, type BookingPayload } from "@/components/PayOptionsDialog";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
];

type ServicePrice = { slug: string; label: string; amount: number; active: boolean };

const humanize = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const WHATSAPP_NUMBER = "250793521437";

const BookNow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") ?? SERVICES[0]?.slug ?? "";

  const [serviceSlug, setServiceSlug] = useState<string>(initialService);
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<ServicePrice | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    document.title = "Book an Appointment — Noble Spaces";
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
  const canSubmit = serviceSlug && date && slot && name.trim() && phone.trim();

  const bookingPayload: BookingPayload | null = canSubmit
    ? {
        serviceSlug,
        serviceTitle,
        bookingDate: format(date!, "yyyy-MM-dd"),
        timeSlot: slot,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        description: description.trim() || undefined,
        amountLabel: price ? `RWF ${Number(price.amount).toLocaleString()}` : undefined,
      }
    : null;

  const openPay = () => {
    if (!canSubmit) {
      toast({ title: "Please fill service, date, time, name and phone.", variant: "destructive" });
      return;
    }
    setPayOpen(true);
  };

  const sendQuotationDirect = async () => {
    if (!canSubmit || !bookingPayload) {
      toast({ title: "Please fill service, date, time, name and phone.", variant: "destructive" });
      return;
    }
    setQuoting(true);
    const { error } = await supabase.from("bookings").insert({
      service_name: bookingPayload.serviceTitle,
      booking_date: bookingPayload.bookingDate,
      time_slot: bookingPayload.timeSlot,
      status: "pending",
      customer_name: bookingPayload.name,
      phone: bookingPayload.phone,
      email: bookingPayload.email ?? null,
      description: bookingPayload.description ?? null,
      payment_method: "Quotation (WhatsApp)",
    });
    setQuoting(false);
    if (error) {
      toast({ title: "Could not save booking", description: error.message, variant: "destructive" });
      return;
    }
    const message = [
      "*Noble Spaces — Quotation request*",
      "",
      `*Service:* ${bookingPayload.serviceTitle}`,
      `*Date:* ${bookingPayload.bookingDate}`,
      `*Time:* ${bookingPayload.timeSlot}`,
      `*Name:* ${bookingPayload.name}`,
      `*Phone:* ${bookingPayload.phone}`,
      bookingPayload.email ? `*Email:* ${bookingPayload.email}` : "",
      bookingPayload.description ? `\n*Details:*\n${bookingPayload.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const bookOnly = async () => {
    if (!canSubmit || !bookingPayload) {
      toast({ title: "Please fill service, date, time, name and phone.", variant: "destructive" });
      return;
    }
    setBooking(true);
    const { error } = await supabase.from("bookings").insert({
      service_name: bookingPayload.serviceTitle,
      booking_date: bookingPayload.bookingDate,
      time_slot: bookingPayload.timeSlot,
      status: "pending",
      customer_name: bookingPayload.name,
      phone: bookingPayload.phone,
      email: bookingPayload.email ?? null,
      description: bookingPayload.description ?? null,
      payment_method: "Booking (pay later)",
    });
    setBooking(false);
    if (error) {
      toast({ title: "Could not save booking", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Booking received",
      description: "Our team will contact you shortly to confirm your appointment.",
    });
    setDate(undefined); setSlot(""); setName(""); setPhone(""); setEmail(""); setDescription("");
  };

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Book an appointment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a service, day and time. Then pay or request a quotation.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
      </div>

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
            <Label htmlFor="bp">Phone number *</Label>
            <Input id="bp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="be">Email (optional)</Label>
            <Input id="be" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bd">Measurements / Description</Label>
            <Textarea
              id="bd"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="e.g. Door: 2100mm x 900mm, oak veneer. Or describe what you need…"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gold/20 bg-secondary/30 p-3 text-sm">
          <span className="text-muted-foreground">Reference price</span>
          {priceLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : price ? (
            <span className="font-medium text-gold">RWF {Number(price.amount).toLocaleString()}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Ask for a quote</span>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            onClick={bookOnly}
            disabled={!canSubmit || booking}
            className="bg-gold text-primary-foreground hover:bg-gold/90"
          >
            {booking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarCheck className="mr-2 h-4 w-4" />
            )}
            Book Now
          </Button>
          <Button
            onClick={openPay}
            disabled={!canSubmit}
            variant="outline"
            className="border-gold/50 text-gold hover:bg-gold/10"
          >
            <Smartphone className="mr-2 h-4 w-4" /> Pay Now
          </Button>
          <Button
            onClick={sendQuotationDirect}
            disabled={!canSubmit || quoting}
            variant="outline"
            className="border-gold/50 text-gold hover:bg-gold/10"
          >
            {quoting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="mr-2 h-4 w-4" />
            )}
            Send Quotation
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <strong>Book Now</strong> reserves your slot (our team calls to confirm).{" "}
          <strong>Pay Now</strong> opens MoMo Pay & bank transfer options.{" "}
          <strong>Send Quotation</strong> opens WhatsApp so you can negotiate.
        </p>
      </div>

      {bookingPayload && (
        <PayOptionsDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          booking={bookingPayload}
          onDone={() => {
            // Reset the form after a successful confirmation
            setDate(undefined);
            setSlot("");
            setName("");
            setPhone("");
            setEmail("");
            setDescription("");
          }}
        />
      )}
    </section>
  );
};

export default BookNow;
