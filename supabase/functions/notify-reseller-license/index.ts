const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://sistecpos.lovable.app";

interface Payload {
  reseller_name: string;
  reseller_email: string;
  business_name: string;
  contact_name: string;
  contact_email: string | null;
  plan_type: string;
  price_paid: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: Payload = await req.json();
    console.log("Reseller license notification:", payload.business_name);

    const results: string[] = [];
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // 1. Email to admin
    if (resendKey) {
      const subject = `🟠 Licencia pendiente: ${payload.business_name} (por ${payload.reseller_name})`;
      const html = `
        <h2>🟠 Nueva Licencia Pendiente de Aprobación</h2>
        <p>El socio <strong>${payload.reseller_name}</strong> (${payload.reseller_email}) ha creado una licencia que requiere tu aprobación.</p>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Negocio</td><td style="padding:8px;border:1px solid #ddd;">${payload.business_name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Contacto</td><td style="padding:8px;border:1px solid #ddd;">${payload.contact_name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${payload.contact_email || "-"}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Plan</td><td style="padding:8px;border:1px solid #ddd;">${payload.plan_type}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Precio</td><td style="padding:8px;border:1px solid #ddd;">$${payload.price_paid.toLocaleString()} COP</td></tr>
        </table>
        <p style="margin-top:16px;"><a href="${SITE_URL}/admin" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">📋 Revisar en Admin</a></p>
      `;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "SistecPOS <notificaciones@sistecpos.com>",
            to: ["eduardotp77@gmail.com"],
            subject,
            html,
          }),
        });
        results.push(res.ok ? "email_sent" : "email_failed");
      } catch { results.push("email_error"); }
    }

    // 2. WhatsApp
    const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
    const phone = Deno.env.get("CALLMEBOT_PHONE");

    if (apiKey && phone) {
      const msg = [
        `🟠 *Licencia Pendiente*`,
        ``,
        `👤 Socio: ${payload.reseller_name}`,
        `🏪 Negocio: ${payload.business_name}`,
        `📧 Email: ${payload.contact_email || "-"}`,
        `💰 Precio: $${payload.price_paid.toLocaleString()} COP`,
        ``,
        `⚡ Requiere aprobación en /admin`,
      ].join("\n");

      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msg)}&apikey=${apiKey}`;
        const res = await fetch(url);
        results.push(res.ok ? "whatsapp_sent" : "whatsapp_failed");
      } catch { results.push("whatsapp_error"); }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
