import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarCheck, Loader2, Mail, MessageCircle, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { Availability } from "@/data/services";

const WHATSAPP_NUMBER = "250788906410"; // no + or spaces
const EMAIL = "info@noblespaces.rw";

type Props = {
  serviceTitle: string;
  availability: Availability;
};

export const BookingDialog = ({ serviceTitle, availability }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(
    availability === "service" ? "service" : availability === "custom" ? "custom" : "ready",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Poll status while pending
  useEffect(() => {
    if (!paymentId || paymentStatus === "completed" || paymentStatus === "failed") return;
    const id = setInterval(async () => {
      try {
        const res = await supabase.functions.invoke("xentripay-status", {
          body: { payment_id: paymentId },
        });
        const s = (res.data as any)?.status;
        if (s) {
          setPaymentStatus(s);
          if (s === "completed") {
            toast({ title: t("booking.pay_success", { defaultValue: "Payment received" }) });
          } else if (s === "failed") {
            toast({ title: t("booking.pay_failed", { defaultValue: "Payment failed" }), variant: "destructive" });
          }
        }
      } catch { /* keep polling */ }
    }, 4000);
    return () => clearInterval(id);
  }, [paymentId, paymentStatus, t]);

  const buildMessage = () => {
    const typeLabel =
      type === "ready" ? t("booking.type_ready")
      : type === "custom" ? t("booking.type_custom")
      : t("booking.type_service");
    return [
      `*Noble Spaces — ${t("booking.title")}*`,
      ``,
      `*Service:* ${serviceTitle}`,
      `*${t("booking.type_label")}:* ${typeLabel}`,
      `*${t("booking.name")}:* ${name}`,
      `*${t("booking.phone")}:* ${phone}`,
      email ? `*${t("booking.email")}:* ${email}` : "",
      date ? `*${t("booking.date")}:* ${date}` : "",
      notes ? `\n*${t("booking.notes")}:*\n${notes}` : "",
    ].filter(Boolean).join("\n");
  };

  const validate = () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: t("booking.required"), variant: "destructive" });
      return false;
    }
    return true;
  };

  const sendWhatsApp = () => {
    if (!validate()) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const sendEmail = () => {
    if (!validate()) return;
    const subject = `Booking — ${serviceTitle}`;
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
    window.location.href = url;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-gold/90">
          <Tooltip>
            <TooltipTrigger asChild>
              <CalendarCheck className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("tooltip.book_now")}</p>
            </TooltipContent>
          </Tooltip>
          {t("booking.book_now")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border-gold/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("booking.title")}</DialogTitle>
          <DialogDescription>{t("booking.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-gold/20 bg-secondary/40 p-3 text-sm">
          <span className="text-gold">{serviceTitle}</span>
        </div>

        <div className="space-y-2">
          <Label>{t("booking.type_label")}</Label>
          <RadioGroup value={type} onValueChange={setType} className="grid gap-2">
            {availability !== "service" && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gold/20 p-3 hover:border-gold/50">
                <RadioGroupItem value="ready" id="t-ready" />
                <span className="text-sm">{t("booking.type_ready")}</span>
              </label>
            )}
            {availability !== "service" && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gold/20 p-3 hover:border-gold/50">
                <RadioGroupItem value="custom" id="t-custom" />
                <span className="text-sm">{t("booking.type_custom")}</span>
              </label>
            )}
            {(availability === "service" || availability === "both") && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gold/20 p-3 hover:border-gold/50">
                <RadioGroupItem value="service" id="t-service" />
                <span className="text-sm">{t("booking.type_service")}</span>
              </label>
            )}
          </RadioGroup>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="b-name">{t("booking.name")} *</Label>
            <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-phone">{t("booking.phone")} *</Label>
            <Input id="b-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-email">{t("booking.email")}</Label>
            <Input id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-date">{t("booking.date")}</Label>
            <Input id="b-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="b-notes">{t("booking.notes")}</Label>
          <Textarea
            id="b-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("booking.notes_ph")}
            maxLength={1000}
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={sendWhatsApp}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-gold/90"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <MessageCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltip.send_whatsapp")}</p>
              </TooltipContent>
            </Tooltip>
            {t("booking.submit")}
          </button>
          <button
            onClick={sendEmail}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/10"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Mail className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltip.send_email")}</p>
              </TooltipContent>
            </Tooltip>
            {t("booking.submit_email")}
          </button>
        </div>

        {/* Mobile money payment */}
        <div className="space-y-3 rounded-lg border border-gold/30 bg-secondary/30 p-4">
          <div className="flex items-center gap-2 text-gold">
            <Tooltip>
              <TooltipTrigger asChild>
                <Smartphone className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltip.pay_now")}</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs uppercase tracking-[0.2em]">Pay with MTN / Airtel</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="b-amount">Amount (RWF)</Label>
              <Input
                id="b-amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-referral">Referral code (optional)</Label>
              <Input
                id="b-referral"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="JEAN10"
                maxLength={32}
              />
            </div>
          </div>
          <button
            disabled={paying || paymentStatus === "pending"}
            onClick={async () => {
              if (!validate()) return;
              const amt = Number(amount);
              if (!Number.isFinite(amt) || amt <= 0) {
                toast({ title: "Enter a valid amount", variant: "destructive" });
                return;
              }
              setPaying(true);
              setPaymentStatus(null);
              setPaymentId(null);
              try {
                const { data, error } = await supabase.functions.invoke("xentripay-initiate", {
                  body: {
                    customer_name: name,
                    customer_phone: phone,
                    amount: amt,
                    referral_code: referralCode || undefined,
                    service_title: serviceTitle,
                  },
                });
                if (error) throw error;
                const payment = (data as any)?.payment;
                if (!payment?.id) throw new Error((data as any)?.error || "Payment could not start");
                setPaymentId(payment.id);
                setPaymentStatus(payment.payment_status || "pending");
                toast({
                  title: "Payment requested",
                  description: "Approve the prompt on your phone.",
                });
              } catch (e) {
                toast({ title: "Payment failed", description: (e as Error).message, variant: "destructive" });
              } finally {
                setPaying(false);
              }
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-gold/90 disabled:opacity-60"
          >
            {paying || paymentStatus === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Smartphone className="h-4 w-4" />
            )}
            {paymentStatus === "pending"
              ? "Waiting for confirmation…"
              : paymentStatus === "completed"
              ? "Paid ✓"
              : paymentStatus === "failed"
              ? "Try again"
              : "Pay now"}
          </button>
          {paymentStatus && (
            <p className="text-xs text-muted-foreground">
              Status: <span className="text-foreground">{paymentStatus}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
