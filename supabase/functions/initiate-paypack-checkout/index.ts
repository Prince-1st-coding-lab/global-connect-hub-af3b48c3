// Paypack Checkout — initiate
// Creates an `orders` row (status=pending) and returns a Paypack-hosted
// payment_link. Frontend redirects: window.location.href = data.payment_link
//
// Required Edge Function secrets (Project Settings → Functions → Secrets):
//   PAYPACK_APP_ID            — Paypack application_id from dashboard.paypack.rw
//   PAYPACK_WEBHOOK_SIGN_KEY  — used by paypack-webhook to verify HMAC
//   SUPABASE_URL              — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected
//
// Auth: deployed with verify_jwt = false (public checkout). All inputs validated.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PAYPACK_BASE = "https://payments.paypack.rw/api";

type Body = {
  amount?: number;
  item_name?: string;
  email?: string;
  customer_name?: string;
  phone?: string;
  notes?: string;
  service_slug?: string;
  user_id?: string | null;
  success_url?: string;
  cancel_url?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const APP_ID = Deno.env.get("PAYPACK_APP_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!APP_ID) {
      return json({ error: "PAYPACK_APP_ID not configured" }, 500);
    }

    const body = (await req.json().catch(() => ({}))) as Body;

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
      return json({ error: "Invalid amount" }, 400);
    }
    const item_name = (body.item_name ?? "").toString().slice(0, 200) || "Service";
    const email = (body.email ?? "").toString().slice(0, 200) || null;
    const customer_name = (body.customer_name ?? "").toString().slice(0, 120) || null;
    const phone = (body.phone ?? "").toString().slice(0, 40) || null;
    const notes = (body.notes ?? "").toString().slice(0, 2000) || null;
    const service_slug = (body.service_slug ?? "").toString().slice(0, 120) || null;
    const origin = req.headers.get("origin") ?? "";
    const success_url = (body.success_url || `${origin}/payment-success`).slice(0, 500);
    const cancel_url = (body.cancel_url || `${origin}/payment-cancelled`).slice(0, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const session_id = crypto.randomUUID();
    const { data: order, error: insertErr } = await supabase
      .from("orders")
      .insert({
        user_id: body.user_id ?? null,
        email,
        customer_name,
        phone,
        notes,
        service_slug,
        item_name,
        amount: Math.round(amount),
        status: "pending",
        session_id,
      })
      .select()
      .single();

    if (insertErr) {
      return json({ error: "Could not create order", detail: insertErr.message }, 500);
    }

    const ppRes = await fetch(`${PAYPACK_BASE}/checkout/initiate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        application_id: APP_ID,
        amount: Math.round(amount),
        currency: "RWF",
        reference: session_id,
        description: item_name,
        callback_url: `${SUPABASE_URL}/functions/v1/paypack-webhook`,
        success_url,
        cancel_url,
        customer: { email: email ?? undefined, name: customer_name ?? undefined, phone: phone ?? undefined },
      }),
    });

    const ppText = await ppRes.text();
    let pp: any = {};
    try { pp = JSON.parse(ppText); } catch { pp = { raw: ppText }; }

    if (!ppRes.ok) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return json({ error: "Paypack rejected the request", provider: pp, status: ppRes.status }, 502);
    }

    const payment_link: string | undefined =
      pp.payment_link ?? pp.url ?? pp.checkout_url ?? pp.redirect_url;
    const paypack_ref: string | undefined = pp.ref ?? pp.reference ?? pp.id;

    if (!payment_link) {
      return json({ error: "No payment_link returned by Paypack", provider: pp }, 502);
    }

    await supabase
      .from("orders")
      .update({ paypack_ref: paypack_ref ?? null })
      .eq("id", order.id);

    return json({ ok: true, payment_link, order_id: order.id, session_id });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
