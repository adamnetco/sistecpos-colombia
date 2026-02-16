const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://sistecpos.lovable.app";
const DEFAULT_WHATSAPP = "573176268307";

async function getWhatsAppNumbers(): Promise<{ main: string; support: string; sales: string }> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const sb = createClient(supabaseUrl, anonKey);
    const { data } = await sb
      .from("site_settings")
      .select("setting_key, setting_value")
      .eq("setting_group", "whatsapp")
      .in("setting_key", ["main_number", "support_number", "sales_number"]);
    const get = (key: string) => {
      const row = data?.find((r: any) => r.setting_key === key);
      if (!row) return DEFAULT_WHATSAPP;
      const v = row.setting_value;
      return typeof v === "string" ? v.replace(/^"|"$/g, "") : String(v);
    };
    return { main: get("main_number"), support: get("support_number"), sales: get("sales_number") };
  } catch (e) { console.warn("Could not fetch WA numbers:", e); }
  return { main: DEFAULT_WHATSAPP, support: DEFAULT_WHATSAPP, sales: DEFAULT_WHATSAPP };
}

interface LeadPayload {
  type: "demo" | "representante" | "activation_completed";
  name: string;
  email: string;
  phone: string;
  city?: string;
  business?: string;
  experience?: string;
  activationToken?: string;
  requestedBy?: string;
  qualificationData?: {
    uses_software: boolean;
    knows_inventory: boolean;
    main_pain: string;
    ideal_pos_features: string;
    daily_sales: string;
    employee_count: string;
    urgency: string;
  };
}

// ─── EMAIL TEMPLATES ───────────────────────────────────────────────

function welcomeDemoHtml(name: string, business: string, supportNumber: string, activationToken?: string): string {
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
        <a href="${SITE_URL}/clientes?quick=demo#pos" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">
          🖥️ Ingresar a la Demo con 1 Clic
        </a>
        <p style="margin:6px 0 0;color:#9ca3af;font-size:11px;">Se abrirá directamente el panel con credenciales demo/demo/demo</p>
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
        <a href="https://wa.me/${supportNumber}?text=Hola,%20acabo%20de%20registrarme%20para%20una%20demo%20de%20SistecPOS" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
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

function activationCompletedClientHtml(name: string, business: string, supportNumber: string): string {
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
        <span style="display:inline-block;background:#f97316;color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">✅ Activación Completada</span>
      </div>

      <h1 style="text-align:center;color:#1a1a2e;font-size:22px;margin:0 0 8px;">¡Excelente, ${name}!</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Tu perfil de <strong>${business}</strong> ha sido completado exitosamente. Nuestro equipo ya está preparando tu demo personalizada.
      </p>

      <!-- Timeline / Next Steps -->
      <div style="background:linear-gradient(135deg, #fef3c7, #fff7ed);border:1px solid #fde68a;border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 16px;color:#92400e;font-size:15px;font-weight:700;">⏳ ¿Qué sigue ahora?</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:28px;height:28px;background:#f97316;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">1</div>
            </td>
            <td style="padding:8px 0;">
              <p style="margin:0;color:#78350f;font-size:13px;font-weight:600;">Revisión de tu perfil</p>
              <p style="margin:2px 0 0;color:#92400e;font-size:12px;">Nuestro equipo revisa tus necesidades para personalizar la demo.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:28px;height:28px;background:#f97316;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">2</div>
            </td>
            <td style="padding:8px 0;">
              <p style="margin:0;color:#78350f;font-size:13px;font-weight:600;">Creación de credenciales</p>
              <p style="margin:2px 0 0;color:#92400e;font-size:12px;">Te generamos un usuario y empresa exclusiva con tu marca.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:28px;height:28px;background:#16a34a;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">3</div>
            </td>
            <td style="padding:8px 0;">
              <p style="margin:0;color:#78350f;font-size:13px;font-weight:600;">Recibirás tus accesos por correo</p>
              <p style="margin:2px 0 0;color:#92400e;font-size:12px;">En las próximas horas te enviaremos todo para que empieces.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#166534;font-size:14px;font-weight:600;">🖥️ Mientras tanto, sigue explorando</p>
        <p style="margin:0;color:#374151;font-size:13px;">Puedes continuar usando la demo genérica con las credenciales: <strong>demo / demo / demo</strong></p>
      </div>

      <div style="text-align:center;margin:20px 0;">
        <a href="${SITE_URL}/clientes" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">
          🖥️ Ir a la Demo Genérica
        </a>
      </div>

      <div style="text-align:center;margin:16px 0;">
        <a href="https://wa.me/${supportNumber}?text=Hola,%20ya%20completé%20mi%20activación%20de%20demo%20y%20quiero%20agendar%20mi%20capacitación" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          💬 Agendar capacitación por WhatsApp
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} SistecPOS · Software POS Colombia</p>
    </div>
  </div>
</body>
</html>`;
}

function activationCompletedInternalHtml(payload: LeadPayload): string {
  const q = payload.qualificationData;
  return `
    <h2>🟠 Lead Avanzó en el Embudo — Activación Completada</h2>
    <p style="color:#92400e;background:#fef3c7;padding:12px;border-radius:8px;font-weight:600;">
      ⚡ ${payload.name} completó el formulario de calificación. Está listo para recibir sus credenciales personalizadas.
    </p>
    <table style="border-collapse:collapse;width:100%;max-width:500px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nombre</td><td style="padding:8px;border:1px solid #ddd;">${payload.name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Negocio</td><td style="padding:8px;border:1px solid #ddd;">${payload.business || "-"}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">WhatsApp</td><td style="padding:8px;border:1px solid #ddd;">${payload.phone}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${payload.email}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ciudad</td><td style="padding:8px;border:1px solid #ddd;">${payload.city || "-"}</td></tr>
    </table>
    ${q ? `
    <h3 style="margin-top:20px;">📋 Datos de Calificación</h3>
    <table style="border-collapse:collapse;width:100%;max-width:500px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">¿Usa software?</td><td style="padding:8px;border:1px solid #ddd;">${q.uses_software ? "✅ Sí" : "❌ No"}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">¿Conoce inventario?</td><td style="padding:8px;border:1px solid #ddd;">${q.knows_inventory ? "✅ Sí" : "❌ No"}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Mayor dolor</td><td style="padding:8px;border:1px solid #ddd;">${q.main_pain}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">POS ideal</td><td style="padding:8px;border:1px solid #ddd;">${q.ideal_pos_features}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ventas/día</td><td style="padding:8px;border:1px solid #ddd;">${q.daily_sales}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Empleados</td><td style="padding:8px;border:1px solid #ddd;">${q.employee_count}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Urgencia</td><td style="padding:8px;border:1px solid #ddd;">${q.urgency}</td></tr>
    </table>
    ` : ''}
    <p style="margin-top:16px;">🎯 <strong>Acción requerida:</strong> Crear credenciales POS y enviarlas desde el panel de admin.</p>
  `;
}

// ─── MAIN HANDLER ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: LeadPayload = await req.json();
    console.log(`New ${payload.type} lead:`, payload.name);

    const results: string[] = [];
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const waNumbers = await getWhatsAppNumbers();

    if (resendKey) {
      const isDemo = payload.type === "demo";
      const isActivation = payload.type === "activation_completed";

      // ─── Internal notification email ─────────────────────────
      let subject: string;
      let htmlBody: string;

      if (isActivation) {
        subject = `🟠 Activación Completada: ${payload.name} - ${payload.business || "N/A"} — ¡Listo para credenciales!`;
        htmlBody = activationCompletedInternalHtml(payload);
      } else if (isDemo) {
        subject = `🟢 Nuevo Lead Demo: ${payload.name} - ${payload.business || "N/A"}`;
        htmlBody = `
          <h2>🟢 Nuevo Lead - Solicitud de Demo</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nombre</td><td style="padding:8px;border:1px solid #ddd;">${payload.name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Negocio</td><td style="padding:8px;border:1px solid #ddd;">${payload.business || "-"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">WhatsApp</td><td style="padding:8px;border:1px solid #ddd;">${payload.phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${payload.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ciudad</td><td style="padding:8px;border:1px solid #ddd;">${payload.city || "-"}</td></tr>
          </table>
          <p style="margin-top:16px;">⚡ Contactar al prospecto lo antes posible.</p>
        `;
      } else {
        subject = `🔵 Nuevo Prospecto Representante: ${payload.name} - ${payload.city || "N/A"}`;
        htmlBody = `
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
      }

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

      // ─── Client-facing email ──────────────────────────────────
      if (payload.email) {
        let clientSubject: string | null = null;
        let clientHtml: string | null = null;

        if (isDemo) {
          clientSubject = `🎉 ¡Bienvenido a SistecPOS, ${payload.name}! Tu demo está lista`;
          clientHtml = welcomeDemoHtml(payload.name, payload.business || "tu negocio", waNumbers.support, payload.activationToken);
        } else if (isActivation) {
          clientSubject = `✅ ¡Perfil completado, ${payload.name}! Tu demo personalizada está en camino`;
          clientHtml = activationCompletedClientHtml(payload.name, payload.business || "tu negocio", waNumbers.support);
        }

        if (clientSubject && clientHtml) {
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
                subject: clientSubject,
                html: clientHtml,
              }),
            });

            if (welcomeRes.ok) {
              results.push("client_email_sent");
              console.log("Client email sent to:", payload.email);
            } else {
              const errText = await welcomeRes.text();
              console.error("Client email error:", errText);
              results.push("client_email_failed");
            }
          } catch (err) {
            console.error("Client email error:", err);
            results.push("client_email_error");
          }
        }
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping email");
      results.push("email_skipped");
    }

    // ─── WhatsApp notification via CallMeBot ─────────────────────
    const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
    const whatsappPhone = Deno.env.get("CALLMEBOT_PHONE");

    if (apiKey && whatsappPhone) {
      const isDemo = payload.type === "demo";
      const isActivation = payload.type === "activation_completed";

      let emoji: string, label: string;
      if (isActivation) {
        emoji = "🟠";
        label = "Activación Completada — Listo para credenciales";
      } else if (isDemo) {
        emoji = "🟢";
        label = "Nuevo Lead Demo";
      } else {
        emoji = "🔵";
        label = "Nuevo Prospecto Representante";
      }

      const message = [
        `${emoji} *${label}*`,
        "",
        `👤 *Nombre:* ${payload.name}`,
        isDemo || isActivation ? `🏪 *Negocio:* ${payload.business || "-"}` : null,
        `📱 *WhatsApp:* ${payload.phone}`,
        `📧 *Email:* ${payload.email}`,
        `📍 *Ciudad:* ${payload.city || "-"}`,
        isActivation && payload.qualificationData ? `🎯 *Urgencia:* ${payload.qualificationData.urgency}` : null,
        "",
        isActivation ? "🔐 Crear credenciales POS desde el panel admin." : "⚡ Ver detalles en el panel admin.",
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
