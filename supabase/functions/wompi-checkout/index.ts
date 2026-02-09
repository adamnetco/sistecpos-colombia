import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount_cents, customer_email, customer_name, customer_phone, certificate_order_id, cart_items, redirect_url } =
      await req.json();

    if (!amount_cents || amount_cents < 100) {
      return new Response(JSON.stringify({ error: "amount_cents is required and must be >= 100" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicKey = Deno.env.get("WOMPI_PUBLIC_KEY")!;
    const integritySecret = Deno.env.get("WOMPI_INTEGRITY_SECRET")!;
    const environment = Deno.env.get("WOMPI_ENVIRONMENT") || "sandbox";
    const currency = "COP";

    // Generate unique reference
    const reference = `SP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Generate integrity signature: SHA256(reference + amount_cents + currency + integrity_secret)
    const concatenated = `${reference}${amount_cents}${currency}${integritySecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(concatenated);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Save transaction to DB using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const metadata: Record<string, unknown> = {};
    if (cart_items) metadata.cart_items = cart_items;

    const { error: dbError } = await supabase.from("wompi_transactions").insert({
      reference,
      amount_cents,
      currency,
      customer_email: customer_email || null,
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      certificate_order_id: certificate_order_id || null,
      cart_quote_id: cart_items ? reference : null,
      metadata,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to create transaction record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Wompi checkout created: ref=${reference}, amount=${amount_cents}, env=${environment}`);

    return new Response(
      JSON.stringify({
        reference,
        signature,
        public_key: publicKey,
        amount_cents,
        currency,
        environment,
        redirect_url: redirect_url || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("wompi-checkout error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
