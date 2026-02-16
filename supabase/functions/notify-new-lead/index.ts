const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://sistecpos.lovable.app";
const DEFAULT_WHATSAPP = "573176268307";

async function getWhatsAppNumber(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const sb = createClient(supabaseUrl, anonKey);
    const { data } = await sb
      .from("site_settings")
      .select("setting_value")
      .eq("setting_group", "whatsapp")
      .eq("setting_key", "main_number")
      .single();
    if (data?.setting_value) {
      const v = data.setting_value;
      return typeof v === "string" ? v.replace(/^"|"$/g, "") : String(v);
    }
  } catch (e) { console.warn("Could not fetch WA number:", e); }
  return DEFAULT_WHATSAPP;
}

interface LeadPayload {
  type: "demo" | "representante";
  name: string;
  email: string;
  phone: string;
  city?: string;
  business?: string;
  experience?: string;
  activationToken?: string;
  requestedBy?: string;
}

function welcomeDemoHtml(name: string, business: string, waNumber: string, activationToken?: string): string {
  const activationUrl = activationToken ? `${SITE_URL}/activar-demo/${activationToken}` : null;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="${SITE_URL}/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" style="height:40px;" />
      </div>

      <div style="text-align:center;margin-bottom:20px;">
        <span style="display:inline-block;background:#16a34a;color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">🎉 ¡Bienvenido!</span>
      </div>

      <h1 style="text-align:center;color:#1a1a2e;font-size:22px;margin:0 0 8px;">¡Hola ${name}!</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Gracias por registrarte. Estamos emocionados de que <strong>${business}</strong> esté dando el siguiente paso con SistecPOS.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#166534;font-size:14px;font-weight:600;">🖥️ Explora el software ahora mismo</p>
        <p style="margin:0 0 4px;color:#374151;font-size:13px;">Mientras preparamos tu demo personalizada, puedes explorar el sistema con estas credenciales genéricas:</p>
        <div style="background:#ffffff;border:1px solid #d1d5db;border-radius:8px;padding:12px;margin-top:10px;">
          <p style="margin:0;font-size:13px;color:#374151;"><strong>Usuario:</strong> demo</p>
          <p style="margin:0;font-size:13px;color:#374151;"><strong>Empresa:</strong> demo</p>
          <p style="margin:0;font-size:13px;color:#374151;"><strong>Contraseña:</strong> demo</p>
        </div>
      </div>

      ${activationUrl ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${activationUrl}" style="display:inline-block;background:#f97316;color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(249,115,22,0.3);">
          🚀 Activar mi Demo Personalizada
        </a>
        <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">Completa unas breves preguntas para recibir tu demo a la medida</p>
      </div>
      ` : ''}

      <div style="text-align:center;margin:20px 0;">
        <a href="${SITE_URL}/clientes" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">
          🖥️ Explorar Demo Genérica
        </a>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#1e40af;font-size:14px;font-weight:600;">📅 ¿Qué sigue?</p>
        <ul style="margin:0;padding-left:18px;color:#1e3a5f;font-size:13px;line-height:1.8;">
          <li>Recibirás una <strong>demo personalizada</strong> con tu nombre de negocio y correo por <strong>30 días</strong>.</li>
          <li>Puedes <strong>agendar una reunión</strong> para parametrizar el software a tu medida.</li>
        </ul>
      </div>

      <div style="text-align:center;margin:20px 0;">
        <a href="https://calendly.com/sistecpos" style="display:inline-block;background:#8b5cf6;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          📆 Agendar Reunión en Calendly
        </a>
      </div>

      <div style="text-align:center;margin:20px 0;">
        <a href="https://wa.me/${waNumber}?text=Hola,%20acabo%20de%20registrarme%20para%20una%20demo%20de%20SistecPOS" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          💬 WhatsApp Soporte
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} SistecPOS · Software POS Colombia</p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: LeadPayload = await req.json();
    console.log(`New ${payload.type} lead:`, payload.name);

    const results: string[] = [];
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const waNumber = await getWhatsAppNumber();

    // 1. Send internal notification email via Resend
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
          results.push("internal_email_sent");
        } else {
          const errText = await emailRes.text();
          console.error("Resend error (internal):", errText);
          results.push("internal_email_failed");
        }
      } catch (emailErr) {
        console.error("Email error:", emailErr);
        results.push("internal_email_error");
      }

      // 2. Send welcome email TO THE LEAD (only for demo leads)
      if (isDemo && payload.email) {
        try {
          const welcomeRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SistecPOS <notificaciones@sistecpos.com>",
              to: [payload.email],
              subject: `🎉 ¡Bienvenido a SistecPOS, ${payload.name}! Tu demo está lista`,
              html: welcomeDemoHtml(payload.name, payload.business || "tu negocio", waNumber, payload.activationToken),
            }),
          });

          if (welcomeRes.ok) {
            results.push("welcome_email_sent");
            console.log("Welcome email sent to:", payload.email);
          } else {
            const errText = await welcomeRes.text();
            console.error("Welcome email error:", errText);
            results.push("welcome_email_failed");
          }
        } catch (err) {
          console.error("Welcome email error:", err);
          results.push("welcome_email_error");
        }
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping email");
      results.push("email_skipped");
    }

    // 3. Send WhatsApp notification via CallMeBot
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
