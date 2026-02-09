import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price_cop: number;
}

interface QuotePayload {
  items: QuoteItem[];
  total_cop: number;
  session_id?: string;
  visitor_name?: string;
  visitor_phone?: string;
  visitor_email?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: QuotePayload = await req.json();
    console.log("Quote received:", JSON.stringify(payload));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const results: string[] = [];

    // 1. Log quote_sent events for each product
    const events = payload.items.map((item) => ({
      event_type: "quote_sent",
      product_id: item.product_id,
      product_name: item.product_name,
      session_id: payload.session_id || null,
      metadata: { quantity: item.quantity, price_cop: item.price_cop, total_cop: payload.total_cop },
    }));

    const { error: evError } = await supabase.from("product_events").insert(events);
    if (evError) {
      console.error("Event insert error:", evError);
    } else {
      results.push("events_logged");
      console.log(`Logged ${events.length} quote events`);
    }

    // 2. Smart upsert contact in CRM (only if identifiable data exists)
    const visitorName = (payload.visitor_name || "").trim();
    const visitorPhone = (payload.visitor_phone || "").trim().replace(/\D/g, "");
    const visitorEmail = (payload.visitor_email || "").trim().toLowerCase();

    const hasIdentifiableData = visitorPhone.length >= 10 || visitorEmail.length > 0;

    const itemSummary = payload.items
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join(", ");

    const formatCOP = (n: number) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(n);

    const activityDescription = `Cotización WhatsApp: ${itemSummary}. Total: ${formatCOP(payload.total_cop)}`;

    if (hasIdentifiableData) {
      // Search for existing contact by phone or email
      let existingId: string | null = null;

      if (visitorPhone.length >= 10) {
        const { data } = await supabase
          .from("contacts")
          .select("id")
          .eq("phone", visitorPhone)
          .limit(1)
          .maybeSingle();
        if (data) existingId = data.id;
      }

      if (!existingId && visitorEmail) {
        const { data } = await supabase
          .from("contacts")
          .select("id")
          .eq("email", visitorEmail)
          .limit(1)
          .maybeSingle();
        if (data) existingId = data.id;
      }

      if (existingId) {
        // Update existing contact with latest info & add activity
        console.log("Existing contact found:", existingId);
        await supabase.from("contacts").update({
          full_name: visitorName || undefined,
          phone: visitorPhone || undefined,
          email: visitorEmail || undefined,
          updated_at: new Date().toISOString(),
        }).eq("id", existingId);

        await supabase.from("contact_activities").insert({
          contact_id: existingId,
          activity_type: "quote",
          description: activityDescription,
        });
        results.push("contact_updated");
      } else {
        // Create new contact with real data
        const { data: contact, error: contactErr } = await supabase.from("contacts").insert({
          full_name: visitorName || "Sin nombre",
          email: visitorEmail || null,
          phone: visitorPhone || null,
          source: "cotizacion_web",
          contact_type: "prospect",
          pipeline_stage: "new",
          notes: activityDescription,
          captured_by_ai: false,
        }).select("id").single();

        if (contactErr) {
          console.error("Contact insert error:", contactErr);
          results.push("contact_failed");
        } else {
          results.push("contact_created");
          console.log("Contact created:", contact.id);

          await supabase.from("contact_activities").insert({
            contact_id: contact.id,
            activity_type: "quote",
            description: activityDescription,
          });
        }
      }
    } else {
      console.log("No identifiable data — skipping contact creation");
      results.push("contact_skipped");
    }

    // 3. Send notifications (email + WhatsApp)
    const contactInfo = hasIdentifiableData
      ? `\n👤 *${visitorName || "Sin nombre"}*\n📱 ${visitorPhone || "N/A"}\n✉️ ${visitorEmail || "N/A"}`
      : "";

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const itemsHtml = payload.items
        .map(
          (i) =>
            `<tr><td style="padding:8px;border:1px solid #ddd;">${i.product_name}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${i.quantity}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCOP(i.price_cop * i.quantity)}</td></tr>`
        )
        .join("");

      const contactHtml = hasIdentifiableData
        ? `<p><strong>👤 Cliente:</strong> ${visitorName || "Sin nombre"}<br><strong>📱 WhatsApp:</strong> ${visitorPhone || "N/A"}<br><strong>✉️ Email:</strong> ${visitorEmail || "N/A"}</p>`
        : "";

      const html = `
        <h2>🛒 Nueva Cotización desde la Tienda Web</h2>
        ${contactHtml}
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <thead>
            <tr style="background:#f3f4f6;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Producto</th><th style="padding:8px;border:1px solid #ddd;">Cant.</th><th style="padding:8px;border:1px solid #ddd;text-align:right;">Subtotal</th></tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr><td colspan="2" style="padding:8px;border:1px solid #ddd;font-weight:bold;">Total Estimado</td><td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCOP(payload.total_cop)}</td></tr>
          </tfoot>
        </table>
        <p style="margin-top:16px;">⚡ Revisar cotización y responder al cliente lo antes posible.</p>
      `;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SistecPOS <notificaciones@sistecpos.com>",
            to: ["eduardotp77@gmail.com"],
            subject: `🛒 Nueva Cotización Web — ${formatCOP(payload.total_cop)}`,
            html,
          }),
        });
        results.push(emailRes.ok ? "email_sent" : "email_failed");
      } catch {
        results.push("email_error");
      }
    }

    // WhatsApp via CallMeBot
    const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
    const waPhone = Deno.env.get("CALLMEBOT_PHONE");
    if (apiKey && waPhone) {
      const msg = [
        "🛒 *Nueva Cotización Web*",
        contactInfo,
        "",
        ...payload.items.map((i) => `• ${i.product_name} x${i.quantity}`),
        "",
        `💰 *Total: ${formatCOP(payload.total_cop)}*`,
        "",
        "⚡ Revisar en el panel admin.",
      ].join("\n");

      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${encodeURIComponent(msg)}&apikey=${apiKey}`;
        await fetch(url);
        results.push("whatsapp_sent");
      } catch {
        results.push("whatsapp_error");
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in register-quote:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
