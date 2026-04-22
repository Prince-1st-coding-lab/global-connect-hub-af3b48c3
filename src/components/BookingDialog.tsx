import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarCheck, Mail, MessageCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import type { Availability } from "@/data/services";

const WHATSAPP_NUMBER = "250788906410"; // no + or spaces
const EMAIL = "noblespaces4@gmail.com";

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
          <CalendarCheck className="h-4 w-4" /> {t("booking.book_now")}
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
            <MessageCircle className="h-4 w-4" /> {t("booking.submit")}
          </button>
          <button
            onClick={sendEmail}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/10"
          >
            <Mail className="h-4 w-4" /> {t("booking.submit_email")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
