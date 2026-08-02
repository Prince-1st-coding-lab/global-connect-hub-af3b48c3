import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { formatRwf } from "@/hooks/useProducts";
import { useSeo } from "@/hooks/useSeo";

const DELIVERY_FEES: Record<string, number> = {
  Kigali: 5000,
  Other: 15000,
};

const PAYMENT_METHODS = [
  { value: "momo", label: "Mobile Money (MoMo Pay 0793521437 — NOBLE SPACES Ltd)" },
  { value: "bank", label: "Bank transfer (4002201390383 — NOBLE SPACES Ltd)" },
  { value: "cod", label: "Cash on delivery" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { lines, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    country: "Rwanda",
    province: "Kigali",
    district: "",
    sector: "",
    cell: "",
    village: "",
    street_address: "",
    postal_code: "",
    delivery_instructions: "",
    payment_method: "momo",
  });

  useSeo({
    title: "Checkout | Noble Spaces",
    description: "Complete your Noble Spaces order — mobile money, bank transfer or cash on delivery, with delivery across Rwanda.",
    path: "/checkout",
  });

  const deliveryFee = useMemo(
    () => (subtotal === 0 ? 0 : DELIVERY_FEES[form.province === "Kigali" ? "Kigali" : "Other"]),
    [form.province, subtotal],
  );
  const total = subtotal + deliveryFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (lines.length === 0) return;
    if (!form.customer_name.trim() || !form.phone.trim() || !form.district.trim()) {
      toast({ title: "Please fill name, phone and district.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        item_name: lines.map((l) => `${l.name} x${l.quantity}`).join(", "),
        amount: total,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: "pending",
        order_type: "product",
        payment_method: PAYMENT_METHODS.find((m) => m.value === form.payment_method)?.label ?? form.payment_method,
        country: form.country,
        province: form.province,
        district: form.district.trim(),
        sector: form.sector.trim() || null,
        cell: form.cell.trim() || null,
        village: form.village.trim() || null,
        street_address: form.street_address.trim() || null,
        postal_code: form.postal_code.trim() || null,
        delivery_instructions: form.delivery_instructions.trim() || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      setSubmitting(false);
      toast({ title: "Could not place order", description: error?.message, variant: "destructive" });
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        product_name: l.name,
        unit_price: l.price,
        quantity: l.quantity,
        line_total: l.price * l.quantity,
      })),
    );
    if (itemsError) {
      setSubmitting(false);
      toast({ title: "Order saved but items failed", description: itemsError.message, variant: "destructive" });
      return;
    }

    if (form.email.trim()) {
      void supabase.functions.invoke("send-email", {
        body: {
          event: "order_confirmation",
          to: form.email.trim(),
          dedupeKey: `order-${order.id}`,
          subject: `Your Noble Spaces order #${order.id.slice(0, 8)}`,
          heading: "Thank you for your order",
          intro: `Hi ${form.customer_name.trim()}, we've received your order and will contact you shortly to confirm delivery.`,
          rows: [
            ...lines.map((l) => ({ label: `${l.name} × ${l.quantity}`, value: formatRwf(l.price * l.quantity) })),
            { label: "Delivery", value: formatRwf(deliveryFee) },
            { label: "Total", value: formatRwf(total) },
          ],
        },
      });
    }

    setSubmitting(false);
    clear();
    toast({ title: "Order placed", description: "We'll call you shortly to confirm delivery and payment." });
    navigate("/payment-success");
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-40 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Button asChild variant="outline" className="mt-6"><Link to="/shop">Browse products</Link></Button>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">Delivery details and payment preference.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 rounded-2xl border border-gold/20 bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Full name *</Label><Input value={form.customer_name} onChange={set("customer_name")} /></div>
            <div className="space-y-1.5"><Label>Phone *</Label><Input value={form.phone} onChange={set("phone")} placeholder="07…" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={set("country")} /></div>
            <div className="space-y-1.5"><Label>Province / City</Label><Input value={form.province} onChange={set("province")} /></div>
            <div className="space-y-1.5"><Label>District *</Label><Input value={form.district} onChange={set("district")} /></div>
            <div className="space-y-1.5"><Label>Sector</Label><Input value={form.sector} onChange={set("sector")} /></div>
            <div className="space-y-1.5"><Label>Cell</Label><Input value={form.cell} onChange={set("cell")} /></div>
            <div className="space-y-1.5"><Label>Village</Label><Input value={form.village} onChange={set("village")} /></div>
            <div className="space-y-1.5"><Label>Street address</Label><Input value={form.street_address} onChange={set("street_address")} /></div>
            <div className="space-y-1.5"><Label>Postal code</Label><Input value={form.postal_code} onChange={set("postal_code")} /></div>
          </div>

          <div className="space-y-1.5">
            <Label>Delivery instructions</Label>
            <Textarea rows={3} value={form.delivery_instructions} onChange={set("delivery_instructions")} />
          </div>

          <div className="space-y-3">
            <Label>Payment method</Label>
            <RadioGroup value={form.payment_method} onValueChange={(v) => setForm((f) => ({ ...f, payment_method: v }))}>
              {PAYMENT_METHODS.map((m) => (
                <label key={m.value} htmlFor={m.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm hover:border-gold/50">
                  <RadioGroupItem value={m.value} id={m.value} />
                  {m.label}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-gold/20 bg-card p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-4">
                <span className="text-muted-foreground">{l.name} × {l.quantity}</span>
                <span>{formatRwf(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRwf(subtotal)}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatRwf(deliveryFee)}</span></div>
            <div className="mt-3 flex justify-between font-display text-lg text-gold"><span>Total</span><span>{formatRwf(total)}</span></div>
          </div>
          <Button className="w-full" size="lg" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Place order
          </Button>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" /> No card details stored. We confirm every order by phone.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default CheckoutPage;
