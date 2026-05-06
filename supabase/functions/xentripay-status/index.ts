// Polls XentriPay for the status of a transaction and updates the payment row
// in the external Supabase database.
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
    const { payment_id, transaction_id } = body ?? {};
    if (!payment_id && !transaction_id) {
      return json({ error: "payment_id or transaction_id required" }, 400);
    }

    const supabase = createClient(extUrl, extKey);

    let txId = transaction_id as string | null;
    let payment: any = null;
    if (payment_id) {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("id", payment_id)
        .maybeSingle();
      payment = data;
      txId = txId || data?.transaction_id || null;
    }
    if (!txId) {
      return json({ error: "No transaction_id available" }, 400);
    }

    const xpRes = await fetch(`${XENTRIPAY_BASE}/payments/${txId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const xpText = await xpRes.text();
    let xpJson: any = null;
    try { xpJson = JSON.parse(xpText); } catch { /* */ }

    const rawStatus = String(
      xpJson?.status || xpJson?.data?.status || (xpRes.ok ? "pending" : "failed"),
    ).toLowerCase();
    const status =
      ["success", "successful", "completed", "paid"].includes(rawStatus) ? "completed"
      : ["failed", "declined", "cancelled", "canceled", "error"].includes(rawStatus) ? "failed"
      : "pending";

    if (payment_id) {
      await supabase
        .from("payments")
        .update({ payment_status: status, transaction_id: txId })
        .eq("id", payment_id);
    }

    return json({ status, transaction_id: txId, provider: xpJson ?? xpText });
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
