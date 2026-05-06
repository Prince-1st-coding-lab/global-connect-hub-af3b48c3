// Initiates a XentriPay mobile money collection and records the payment in the
// external Supabase project.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const XENTRIPAY_BASE = "https://api.xentripay.com/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("XENTRIPAY_API_KEY");
    const extUrl = Deno.env.get("EXTERNAL_SUPABASE_URL");
    const extKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!apiKey || !extUrl || !extKey) {
      return json({ error: "Missing server configuration" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const {
      customer_name,
      customer_phone,
      amount,
      referral_code,
      service_title,
    } = body ?? {};

    if (!customer_name || !customer_phone || !amount) {
      return json({ error: "customer_name, customer_phone and amount are required" }, 400);
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return json({ error: "amount must be a positive number" }, 400);
    }

    const supabase = createClient(extUrl, extKey);

    // Resolve referral code -> promoter (server-side validation)
    let promoterId: string | null = null;
    let validatedCode: string | null = null;
    if (referral_code && String(referral_code).trim()) {
      const { data: promoter } = await supabase
        .from("promoters")
        .select("id, referral_code")
        .eq("referral_code", String(referral_code).trim())
        .maybeSingle();
      if (promoter) {
        promoterId = promoter.id;
        validatedCode = promoter.referral_code;
      }
    }

    // Call XentriPay collection endpoint
    const xpRes = await fetch(`${XENTRIPAY_BASE}/payments/collect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: numericAmount,
        currency: "RWF",
        phone: customer_phone,
        customer_name,
        description: service_title || "Noble Spaces booking",
      }),
    });

    const xpText = await xpRes.text();
    let xpJson: any = null;
    try { xpJson = JSON.parse(xpText); } catch { /* keep raw */ }

    const txId =
      xpJson?.transaction_id ||
      xpJson?.id ||
      xpJson?.reference ||
      xpJson?.data?.transaction_id ||
      null;

    // Persist payment row regardless of provider success so admins see attempts
    const { data: inserted, error: insertErr } = await supabase
      .from("payments")
      .insert({
        customer_name,
        customer_phone,
        amount: numericAmount,
        referral_code: validatedCode,
        promoter_id: promoterId,
        payment_status: xpRes.ok ? "pending" : "failed",
        transaction_id: txId,
      })
      .select()
      .single();

    if (insertErr) {
      return json({ error: "DB insert failed", details: insertErr.message }, 500);
    }

    return json({
      ok: xpRes.ok,
      payment: inserted,
      provider: xpJson ?? xpText,
    }, xpRes.ok ? 200 : 502);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
