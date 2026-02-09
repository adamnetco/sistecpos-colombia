import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Wompi webhook received:", JSON.stringify(body).slice(0, 500));

    const event = body?.event;
    const eventData = body?.data;
    const signature = body?.signature;
    const checksum = signature?.checksum;
    const properties = signature?.properties || [];

    if (!event || !eventData || !checksum) {
      console.error("Invalid webhook payload: missing event, data, or signature");
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate signature
    // Wompi concatenates the values of the properties listed in signature.properties, plus the events secret
    const eventsSecret = Deno.env.get("WOMPI_EVENTS_SECRET")!;

    // Build the string to hash: concatenate property values from eventData.transaction
    const transaction = eventData.transaction || {};
    let concatenated = "";
    for (const prop of properties) {
      const value = transaction[prop];
      concatenated += value !== undefined && value !== null ? String(value) : "";
    }
    concatenated += body.timestamp + eventsSecret;

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(concatenated));
    const computedChecksum = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedChecksum !== checksum) {
      console.error("Signature mismatch!", { computed: computedChecksum, received: checksum });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Webhook signature validated successfully");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const reference = transaction.reference;
    const wompiStatus = transaction.status; // APPROVED, DECLINED, VOIDED, ERROR
    const wompiId = transaction.id;
    const paymentMethodType = transaction.payment_method_type;

    if (!reference) {
      console.error("No reference in transaction");
      return new Response(JSON.stringify({ error: "No reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update wompi_transactions
    const { data: txData, error: txError } = await supabase
      .from("wompi_transactions")
      .update({
        wompi_id: wompiId,
        status: wompiStatus,
        payment_method: paymentMethodType,
        wompi_response: transaction,
      })
      .eq("reference", reference)
      .select()
      .single();

    if (txError) {
      console.error("Error updating transaction:", txError);
      return new Response(JSON.stringify({ error: "Failed to update transaction" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Transaction ${reference} updated to ${wompiStatus}`);

    // If APPROVED, create payment record and update related orders
    if (wompiStatus === "APPROVED" && txData) {
      // Create payment record
      const paymentData: Record<string, unknown> = {
        amount: Math.round(txData.amount_cents / 100),
        status: "paid",
        payment_method: paymentMethodType,
        reference: reference,
        paid_at: new Date().toISOString(),
        notes: `Pago Wompi - ID: ${wompiId}`,
      };

      if (txData.certificate_order_id) {
        paymentData.certificate_order_id = txData.certificate_order_id;

        // Update certificate order status
        await supabase
          .from("certificate_orders")
          .update({ status: "paid" })
          .eq("id", txData.certificate_order_id);

        console.log(`Certificate order ${txData.certificate_order_id} marked as paid`);
      }

      const { error: payError } = await supabase.from("payments").insert(paymentData);
      if (payError) {
        console.error("Error creating payment:", payError);
      } else {
        console.log(`Payment record created for ${reference}`);
      }

      // Send WhatsApp notification (fire-and-forget)
      try {
        const phone = Deno.env.get("CALLMEBOT_PHONE");
        const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
        if (phone && apiKey) {
          const msg = `💰 *Pago Wompi Aprobado*\n\nRef: ${reference}\nMonto: $${(txData.amount_cents / 100).toLocaleString()} COP\nCliente: ${txData.customer_name || "N/A"}\nEmail: ${txData.customer_email || "N/A"}\nMétodo: ${paymentMethodType}`;
          const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msg)}&apikey=${apiKey}`;
          await fetch(url);
          console.log("WhatsApp notification sent");
        }
      } catch (notifErr) {
        console.error("WhatsApp notification error:", notifErr);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("wompi-webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
