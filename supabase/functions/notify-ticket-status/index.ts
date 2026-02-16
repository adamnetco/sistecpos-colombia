import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://sistecpos.lovable.app";
const DEFAULT_WHATSAPP = "573176268307";

async function getWhatsAppNumber(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { createClient: createSbClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const sb = createSbClient(supabaseUrl, anonKey);
    const { data } = await sb
      .from("site_settings")
      .select("setting_value")
      .eq("setting_group", "whatsapp")
      .eq("setting_key", "support_number")
      .single();
    if (data?.setting_value) {
      const v = data.setting_value;
      return typeof v === "string" ? v.replace(/^"|"$/g, "") : String(v);
    }
  } catch (e) { console.warn("Could not fetch WA number:", e); }
  return DEFAULT_WHATSAPP;
}

interface TicketPayload {
  type: "ticket_responded" | "ticket_status_changed";
  ticket_type: "client" | "reseller";
  ticket_id: string;
  subject: string;
  recipient_email: string;
  recipient_name: string;
  new_status: string;
  admin_response?: string;
}

interface ResellerStatusPayload {
  type: "reseller_status_changed";
  reseller_id: string;
  name: string;
  email: string;
  old_status: string;
  new_status: string;
}

interface DemoCredentialsPayload {
  type: "demo_credentials" | "demo_credentials_resend";
  lead_id: string;
  name: string;
  email: string;
  business: string;
  pos_username: string;
  pos_company: string;
  pos_password: string;
}

interface DemoProcessingPayload {
  type: "demo_processing";
  name: string;
  email: string;
  business: string;
}

interface LicenseActivationPayload {
  type: "license_activation_request";
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  nit: string;
  plan_label: string;
  pos_username: string;
  pos_company: string;
  provider_notes: string;
  license_key: string;
  payment_proof_url: string | null;
  price_paid: string;
}

type Payload = TicketPayload | ResellerStatusPayload | DemoCredentialsPayload | DemoProcessingPayload | LicenseActivationPayload;

const statusLabels: Record<string, string> = {
  open: "Abierto",
  resolved: "Resuelto",
  pending: "Pendiente",
  reviewing: "En Revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
};

function ticketResponseHtml(name: string, subject: string, response: string, status: string, portalUrl: string): string {
  const statusLabel = statusLabels[status] || status;
  const statusColor = status === "resolved" ? "#16a34a" : "#eab308";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="${SITE_URL}/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" style="height:36px;" />
      </div>
      <div style="text-align:center;margin-bottom:20px;">
        <span style="display:inline-block;background:${statusColor};color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">${statusLabel}</span>
      </div>
      <h1 style="text-align:center;color:#1a1a2e;font-size:20px;margin:0 0 8px;">Actualización de tu Ticket</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;">Hola <strong>${name}</strong>, tu ticket ha sido actualizado.</p>
      
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 4px;color:#374151;font-size:13px;font-weight:600;">📋 Asunto</p>
        <p style="margin:0;color:#6b7280;font-size:14px;">${subject}</p>
      </div>

      ${response ? `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:600;">💬 Respuesta del equipo</p>
        <p style="margin:0;color:#1e3a5f;font-size:14px;line-height:1.6;white-space:pre-wrap;">${response}</p>
      </div>` : ""}

      <div style="text-align:center;margin:24px 0;">
        <a href="${portalUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;text-decoration:none;">
          Ver en mi Portal
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} SistecPOS · Software POS Colombia</p>
    </div>
  </div>
</body>
</html>`;
}

function resellerStatusHtml(name: string, oldStatus: string, newStatus: string, waNumber: string): string {
  const oldLabel = statusLabels[oldStatus] || oldStatus;
  const newLabel = statusLabels[newStatus] || newStatus;
  const isPositive = newStatus === "approved" || newStatus === "reviewing";
  const bgColor = isPositive ? "#f0fdf4" : "#fef2f2";
  const borderColor = isPositive ? "#bbf7d0" : "#fecaca";
  const textColor = isPositive ? "#166534" : "#991b1b";
  const emoji = newStatus === "approved" ? "🎉" : newStatus === "reviewing" ? "🔍" : newStatus === "rejected" ? "❌" : "📋";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="text-align:center;margin-bottom:24px;">
        <img src="${SITE_URL}/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" style="height:36px;" />
      </div>
      <h1 style="text-align:center;color:#1a1a2e;font-size:20px;margin:0 0 8px;">${emoji} Actualización de Estado</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;">Hola <strong>${name}</strong>, el estado de tu solicitud de socio ha cambiado.</p>
      
      <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
          <span style="text-decoration:line-through;">${oldLabel}</span> → <strong style="color:${textColor};font-size:16px;">${newLabel}</strong>
        </p>
      </div>

      ${newStatus === "approved" ? `
      <p style="color:#166534;font-size:14px;text-align:center;line-height:1.6;">
        🚀 Tu panel de socios ha sido activado. Revisa tu correo de bienvenida para acceder.
      </p>` : newStatus === "rejected" ? `
      <p style="color:#991b1b;font-size:14px;text-align:center;line-height:1.6;">
        Lamentamos informarte que tu solicitud no fue aprobada en esta ocasión. Si tienes dudas, no dudes en contactarnos.
      </p>` : `
      <p style="color:#6b7280;font-size:14px;text-align:center;line-height:1.6;">
        Nuestro equipo está revisando tu solicitud. Te notificaremos cuando haya novedades.
      </p>`}

      <div style="text-align:center;margin:24px 0;">
        <a href="https://wa.me/${waNumber}?text=Hola,+soy+socio+y+tengo+una+consulta" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          💬 Soporte por WhatsApp
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} SistecPOS · Software POS Colombia</p>
    </div>
  </div>
</body>
</html>`;
}

function demoCredentialsHtml(name: string, business: string, username: string, company: string, password: string, waNumber: string): string {
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
        <span style="display:inline-block;background:#16a34a;color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">🎯 ¡Tu Demo Está Lista!</span>
      </div>

      <h1 style="text-align:center;color:#1a1a2e;font-size:22px;margin:0 0 8px;">¡Hola ${name}!</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Hemos creado un entorno exclusivo para <strong>${business}</strong> con tus datos. ¡Tienes <strong>30 días</strong> para explorar todas las funciones!
      </p>

      <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#166534;font-size:15px;font-weight:700;text-align:center;">🔐 Tus Credenciales de Acceso</p>
        <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;width:100px;">Usuario:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${username}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;">Empresa:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${company}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;">Contraseña:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${password}</td></tr>
          </table>
        </div>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}/clientes#pos" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;">
          🚀 Ingresar a Mi POS
        </a>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#1e40af;font-size:14px;font-weight:600;">📅 ¿Necesitas ayuda para parametrizar?</p>
        <p style="margin:0;color:#1e3a5f;font-size:13px;line-height:1.6;">
          Agenda una reunión gratuita con nuestro equipo para configurar tu negocio dentro del software.
        </p>
      </div>

      <div style="text-align:center;margin:16px 0;">
        <a href="https://calendly.com/sistecpos" style="display:inline-block;background:#8b5cf6;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;margin-right:8px;">
          📆 Agendar Reunión
        </a>
        <a href="https://wa.me/${waNumber}?text=Hola,+ya+tengo+mi+demo+personalizada+y+necesito+ayuda" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          💬 WhatsApp
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} SistecPOS · Software POS Colombia</p>
    </div>
  </div>
</body>
</html>`;
}

function demoCredentialsResendHtml(name: string, business: string, username: string, company: string, password: string, waNumber: string): string {
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
        <span style="display:inline-block;background:#2563eb;color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">🔑 Recordatorio de Credenciales</span>
      </div>

      <h1 style="text-align:center;color:#1a1a2e;font-size:22px;margin:0 0 8px;">Hola ${name}, aquí están tus credenciales</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Te reenviamos los datos de acceso de tu demo personalizada para <strong>${business}</strong>. Si necesitas ayuda, estamos a un clic de distancia.
      </p>

      <div style="background:#eff6ff;border:2px solid #93c5fd;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#1e40af;font-size:15px;font-weight:700;text-align:center;">🔐 Tus Credenciales de Acceso</p>
        <div style="background:#ffffff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;width:100px;">Usuario:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${username}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;">Empresa:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${company}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;font-weight:600;">Contraseña:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${password}</td></tr>
          </table>
        </div>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}/clientes#pos" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;">
          🚀 Ingresar a Mi POS
        </a>
      </div>

      <div style="text-align:center;margin:16px 0;">
        <a href="https://wa.me/${waNumber}?text=Hola,+necesito+ayuda+con+mi+demo+de+SistecPOS" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
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

function demoProcessingHtml(name: string, business: string, waNumber: string): string {
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
        <span style="display:inline-block;background:#8b5cf6;color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">⚙️ En Proceso</span>
      </div>

      <h1 style="text-align:center;color:#1a1a2e;font-size:22px;margin:0 0 8px;">¡Estamos preparando tu demo, ${name}!</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Nuestro equipo de soporte está gestionando la activación de tu licencia demo personalizada para <strong>${business}</strong>. ¡Falta poco!
      </p>

      <div style="background:linear-gradient(135deg, #f5f3ff, #ede9fe);border:1px solid #c4b5fd;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 16px;color:#5b21b6;font-size:15px;font-weight:700;">⏳ ¿Qué estamos haciendo?</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:28px;height:28px;background:#16a34a;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">✓</div>
            </td>
            <td style="padding:8px 0;">
              <p style="margin:0;color:#5b21b6;font-size:13px;font-weight:600;">Revisamos tu perfil y necesidades</p>
              <p style="margin:2px 0 0;color:#7c3aed;font-size:12px;">Completado</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:28px;height:28px;background:#8b5cf6;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">⚙️</div>
            </td>
            <td style="padding:8px 0;">
              <p style="margin:0;color:#5b21b6;font-size:13px;font-weight:600;">Creando tu entorno personalizado</p>
              <p style="margin:2px 0 0;color:#7c3aed;font-size:12px;">En progreso...</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:28px;height:28px;background:#e5e7eb;color:#9ca3af;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">3</div>
            </td>
            <td style="padding:8px 0;">
              <p style="margin:0;color:#9ca3af;font-size:13px;font-weight:600;">Envío de credenciales por correo</p>
              <p style="margin:2px 0 0;color:#9ca3af;font-size:12px;">Próximamente</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;color:#166534;font-size:14px;font-weight:600;">🖥️ Mientras tanto</p>
        <p style="margin:0;color:#374151;font-size:13px;">Puedes seguir explorando con la demo genérica: <strong>demo / demo / demo</strong></p>
      </div>

      <div style="text-align:center;margin:20px 0;">
        <a href="${SITE_URL}/clientes?quick=demo#pos" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">
          🖥️ Ir a la Demo Genérica
        </a>
      </div>

      <div style="text-align:center;margin:16px 0;">
        <a href="https://wa.me/${waNumber}?text=Hola,+quiero+saber+el+estado+de+mi+demo+personalizada" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          💬 Consultar por WhatsApp
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
    const payload: Payload = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const waNumber = await getWhatsAppNumber();

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Demo Processing email ─────────────────────────────
    if (payload.type === "demo_processing") {
      const p = payload as DemoProcessingPayload;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [p.email],
          subject: `⚙️ Estamos preparando tu demo personalizada, ${p.name} — SistecPOS`,
          html: demoProcessingHtml(p.name, p.business, waNumber),
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Demo credentials (first send) ─────────────────────
    if (payload.type === "demo_credentials") {
      const p = payload as DemoCredentialsPayload;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [p.email],
          subject: `🎯 ¡Tu Demo Personalizada de SistecPOS está Lista, ${p.name}!`,
          html: demoCredentialsHtml(p.name, p.business, p.pos_username, p.pos_company, p.pos_password, waNumber),
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Demo credentials resend ───────────────────────────
    if (payload.type === "demo_credentials_resend") {
      const p = payload as DemoCredentialsPayload;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [p.email],
          subject: `🔑 Aquí están tus credenciales de acceso, ${p.name} — SistecPOS`,
          html: demoCredentialsResendHtml(p.name, p.business, p.pos_username, p.pos_company, p.pos_password, waNumber),
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── License Activation Request to Provider ─────────
    if (payload.type === "license_activation_request") {
      const p = payload as LicenseActivationPayload;
      const providerEmail = "eduardotp77@gmail.com"; // Admin/provider email
      const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
<div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <div style="text-align:center;margin-bottom:24px;">
    <img src="${SITE_URL}/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" style="height:40px;" />
  </div>
  <div style="text-align:center;margin-bottom:20px;">
    <span style="display:inline-block;background:#f97316;color:#fff;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;text-transform:uppercase;">🔑 Solicitud de Activación</span>
  </div>
  <h1 style="text-align:center;color:#1a1a2e;font-size:20px;margin:0 0 16px;">Nueva Licencia Pagada — Activar</h1>
  <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 24px;">Se requiere la activación de la siguiente licencia en el sistema POS.</p>
  
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:20px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#9a3412;font-size:13px;font-weight:600;width:130px;">Negocio:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.business_name}</td></tr>
      <tr><td style="padding:6px 0;color:#9a3412;font-size:13px;font-weight:600;">NIT:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.nit}</td></tr>
      <tr><td style="padding:6px 0;color:#9a3412;font-size:13px;font-weight:600;">Contacto:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.contact_name}</td></tr>
      <tr><td style="padding:6px 0;color:#9a3412;font-size:13px;font-weight:600;">Email:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.contact_email}</td></tr>
      <tr><td style="padding:6px 0;color:#9a3412;font-size:13px;font-weight:600;">Teléfono:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.contact_phone}</td></tr>
    </table>
  </div>
  
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:20px;">
    <p style="margin:0 0 12px;color:#1e40af;font-size:14px;font-weight:700;">📋 Detalles de la Licencia</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#1e3a5f;font-size:13px;font-weight:600;width:130px;">Plan:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:700;">${p.plan_label}</td></tr>
      <tr><td style="padding:6px 0;color:#1e3a5f;font-size:13px;font-weight:600;">Precio pagado:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.price_paid}</td></tr>
      <tr><td style="padding:6px 0;color:#1e3a5f;font-size:13px;font-weight:600;">Clave licencia:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-family:monospace;">${p.license_key}</td></tr>
      ${p.pos_username ? `<tr><td style="padding:6px 0;color:#1e3a5f;font-size:13px;font-weight:600;">Usuario demo:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.pos_username}</td></tr>` : ''}
      ${p.pos_company ? `<tr><td style="padding:6px 0;color:#1e3a5f;font-size:13px;font-weight:600;">Empresa demo:</td><td style="padding:6px 0;color:#1a1a2e;font-size:14px;">${p.pos_company}</td></tr>` : ''}
    </table>
  </div>
  
  ${p.provider_notes ? `
  <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:20px;">
    <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:600;">📝 Instrucciones especiales</p>
    <p style="margin:0;color:#78350f;font-size:13px;">${p.provider_notes}</p>
  </div>` : ''}
  
  ${p.payment_proof_url ? `
  <div style="text-align:center;margin:20px 0;">
    <a href="${p.payment_proof_url}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
      📎 Ver Comprobante de Pago
    </a>
  </div>` : ''}
  
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;">
    <p style="margin:0;color:#166534;font-size:13px;text-align:center;">
      ⚡ <strong>Acción requerida:</strong> Activar la licencia y enviar mensaje de bienvenida al cliente.
    </p>
  </div>
  
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} SistecPOS · Solicitud de Activación</p>
</div></div></body></html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [providerEmail],
          subject: `🔑 Activar Licencia: ${p.business_name} — Plan ${p.plan_label}`,
          html,
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
      
      // Also send WhatsApp notification
      try {
        const waPhone = Deno.env.get("CALLMEBOT_PHONE");
        const waKey = Deno.env.get("CALLMEBOT_API_KEY");
        if (waPhone && waKey) {
          const msg = `🔑 *Activar Licencia*\n${p.business_name}\nPlan: ${p.plan_label}\nPago: ${p.price_paid}\nContacto: ${p.contact_name} - ${p.contact_phone}`;
          await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${encodeURIComponent(msg)}&apikey=${waKey}`);
        }
      } catch (e) { console.warn("WA notification failed:", e); }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Ticket notifications ──────────────────────────────
    if (payload.type === "ticket_responded" || payload.type === "ticket_status_changed") {
      const p = payload as TicketPayload;
      const portalUrl = p.ticket_type === "client" ? `${SITE_URL}/clientes` : `${SITE_URL}/socio`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [p.recipient_email],
          subject: p.new_status === "resolved"
            ? `✅ Tu ticket "${p.subject}" fue resuelto — SistecPOS`
            : `📋 Actualización de tu ticket "${p.subject}" — SistecPOS`,
          html: ticketResponseHtml(p.recipient_name, p.subject, p.admin_response || "", p.new_status, portalUrl),
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Reseller status change ────────────────────────────
    if (payload.type === "reseller_status_changed") {
      const p = payload as ResellerStatusPayload;
      if (p.new_status === "approved") {
        return new Response(JSON.stringify({ success: true, skipped: "handled_by_approval_flow" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [p.email],
          subject: `📋 Actualización de tu solicitud de socio — SistecPOS`,
          html: resellerStatusHtml(p.name, p.old_status, p.new_status, waNumber),
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
