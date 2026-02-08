const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LeadPayload {
  type: "demo" | "representante";
  name: string;
  email: string;
  phone: string;
  city?: string;
  business?: string;
  experience?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: LeadPayload = await req.json();
    console.log(`New ${payload.type} lead:`, payload.name);

    const results: string[] = [];

    // 1. Send email notification via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const isDemo = payload.type === "demo";
      const subject = isDemo
        ? `🟢 Nuevo Lead Demo: ${payload.name} - ${payload.business || "N/A"}`
        : `🔵 Nuevo Prospecto Representante: ${payload.name} - ${payload.city || "N/A"}`;

      const htmlBody = isDemo
        ? `
          <h2>🟢 Nuevo Lead - Solicitud de Demo</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nombre</td><td style="padding:8px;border:1px solid #ddd;">${payload.name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Negocio</td><td style="padding:8px;border:1px solid #ddd;">${payload.business || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">WhatsApp</td><td style="padding:8px;border:1px solid #ddd;">${payload.phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${payload.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ciudad</td><td style="padding:8px;border:1px solid #ddd;">${payload.city || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Origen</td><td style="padding:8px;border:1px solid #ddd;">Landing Campaña</td></tr>
          </table>
          <p style="margin-top:16px;">⚡ Contactar al prospecto lo antes posible.</p>
        `
        : `
          <h2>🔵 Nuevo Prospecto - Programa de Representantes</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nombre</td><td style="padding:8px;border:1px solid #ddd;">${payload.name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${payload.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">WhatsApp</td><td style="padding:8px;border:1px solid #ddd;">${payload.phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ciudad</td><td style="padding:8px;border:1px solid #ddd;">${payload.city || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Experiencia</td><td style="padding:8px;border:1px solid #ddd;">${payload.experience || "-"}</td></tr>
          </table>
          <p style="margin-top:16px;">📋 Revisar perfil y contactar en menos de 24 horas.</p>
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
            subject,
            html: htmlBody,
          }),
        });

        if (emailRes.ok) {
          results.push("email_sent");
          console.log("Email notification sent");
        } else {
          const errText = await emailRes.text();
          console.error("Resend error:", errText);
          results.push("email_failed");
        }
      } catch (emailErr) {
        console.error("Email error:", emailErr);
        results.push("email_error");
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping email");
      results.push("email_skipped");
    }

    // 2. Send WhatsApp notification via CallMeBot
    const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
    const whatsappPhone = Deno.env.get("CALLMEBOT_PHONE");

    if (apiKey && whatsappPhone) {
      const isDemo = payload.type === "demo";
      const emoji = isDemo ? "🟢" : "🔵";
      const label = isDemo ? "Nuevo Lead Demo" : "Nuevo Prospecto Representante";

      const message = [
        `${emoji} *${label}*`,
        "",
        `👤 *Nombre:* ${payload.name}`,
        isDemo ? `🏪 *Negocio:* ${payload.business || "-"}` : null,
        `📱 *WhatsApp:* ${payload.phone}`,
        `📧 *Email:* ${payload.email}`,
        `📍 *Ciudad:* ${payload.city || "-"}`,
        "",
        "⚡ Ver detalles en el panel admin.",
      ].filter(Boolean).join("\n");

      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${whatsappPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
        const waRes = await fetch(url);
        if (waRes.ok) {
          results.push("whatsapp_sent");
          console.log("WhatsApp notification sent");
        } else {
          results.push("whatsapp_failed");
        }
      } catch (waErr) {
        console.error("WhatsApp error:", waErr);
        results.push("whatsapp_error");
      }
    } else {
      results.push("whatsapp_skipped");
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in notify-new-lead:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
