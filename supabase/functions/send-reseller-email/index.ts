import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomePayload {
  type: "welcome";
  name: string;
  email: string;
}

interface ApprovedPayload {
  type: "approved";
  resellerId: string;
  name: string;
  email: string;
}

type Payload = WelcomePayload | ApprovedPayload;

const SITE_URL = "https://sistecpos.lovable.app";
const DEFAULT_WHATSAPP = "573176268307";

async function getWhatsAppNumber(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceRoleKey);
    const { data } = await sb
      .from("app_settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();
    if (data?.value) {
      const v = data.value;
      return typeof v === "string" ? v.replace(/^"|"$/g, "") : String(v);
    }
  } catch (e) { console.warn("Could not fetch WA number, using default:", e); }
  return DEFAULT_WHATSAPP;
}

function buildWaUrl(number: string, msg: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

function welcomeHtml(name: string, waUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${SITE_URL}/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" style="height:40px;" />
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#dbeafe;border-radius:50%;padding:16px;">
          <span style="font-size:32px;">🚀</span>
        </div>
      </div>
      <h1 style="text-align:center;color:#1a1a2e;font-size:24px;margin:0 0 8px;">¡Tu Postulación fue Recibida!</h1>
      <p style="text-align:center;color:#6b7280;font-size:16px;margin:0 0 24px;">Hola <strong>${name}</strong>, gracias por tu interés en ser socio de SistecPOS.</p>
      
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
          ✅ Tu postulación ha sido registrada exitosamente.<br/>
          📋 Nuestro equipo revisará tu perfil en las próximas <strong>24 horas</strong>.<br/>
          📞 Recibirás una llamada de calificación para conocerte mejor.<br/>
          🔔 Luego te enviaremos un correo con tu acceso al panel de socios.
        </p>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#1e40af;font-size:15px;font-weight:700;">📺 Mientras tanto, no te pierdas:</p>
        <p style="margin:0 0 12px;color:#1e40af;font-size:14px;line-height:1.6;">
          • <strong>Video de presentación</strong> del programa de socios<br/>
          • <strong>Propuesta de valor</strong> y modelo de comisiones<br/>
          • <strong>Siguiente paso</strong> para avanzar en tu proceso
        </p>
        <div style="text-align:center;">
          <a href="${SITE_URL}/lp/representantes/bienvenida" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:16px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
            🎯 Ver mi Página de Bienvenida
          </a>
        </div>
      </div>

      <p style="color:#6b7280;font-size:14px;text-align:center;line-height:1.6;">
        ¿Preguntas? Escríbenos directamente:
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${waUrl}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
          💬 Escríbenos por WhatsApp
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">
        © ${new Date().getFullYear()} SistecPOS · Software POS Colombia
      </p>
    </div>
  </div>
</body>
</html>`;
}

function approvedHtml(name: string, resetLink: string, email: string, waUrl: string): string {
  const authUrl = `${SITE_URL}/auth`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${SITE_URL}/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png" alt="SistecPOS" style="height:40px;" />
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#dbeafe;border-radius:50%;padding:16px;">
          <span style="font-size:32px;">🎉</span>
        </div>
      </div>
      <h1 style="text-align:center;color:#1a1a2e;font-size:24px;margin:0 0 8px;">¡Bienvenido al equipo, ${name}!</h1>
      <p style="text-align:center;color:#6b7280;font-size:16px;margin:0 0 24px;">Tu cuenta de socio ha sido <strong>aprobada y activada</strong>.</p>
      
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.8;">
          🚀 Ya puedes acceder a tu <strong>Panel de Socios</strong> donde podrás:<br/>
          • Gestionar licencias y ventas<br/>
          • Acceder a entrenamientos exclusivos<br/>
          • Crear tickets de soporte<br/>
          • Consultar tus comisiones
        </p>
      </div>

      <!-- Onboarding link -->
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 8px;color:#92400e;font-size:15px;font-weight:700;">📚 Guía de Primeros Pasos</p>
        <p style="margin:0 0 12px;color:#a16207;font-size:14px;line-height:1.6;">
          Antes de empezar, revisa nuestra guía rápida para conocer todas las herramientas de tu panel.
        </p>
        <div style="text-align:center;">
          <a href="${SITE_URL}/lp/socio/primeros-pasos" style="display:inline-block;background:#f59e0b;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;">
            📖 Ver Guía de Primeros Pasos
          </a>
        </div>
      </div>

      <!-- Google access -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 8px;color:#166534;font-size:15px;font-weight:700;">⚡ Acceso Inmediato con Google</p>
        <p style="margin:0 0 12px;color:#166534;font-size:14px;line-height:1.6;">
          Ingresa a la página de acceso y haz clic en <strong>"Continuar con Google"</strong> usando tu correo <strong>${email}</strong>.
        </p>
        <div style="text-align:center;">
          <a href="${authUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:16px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
            🔑 Ir a Iniciar Sesión
          </a>
        </div>
      </div>

      <!-- Password option -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">🔐 ¿Prefieres usar contraseña?</p>
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
          Crea tu contraseña con el siguiente enlace:
        </p>
        <div style="text-align:center;">
          <a href="${resetLink}" style="display:inline-block;color:#2563eb;font-size:13px;text-decoration:underline;">
            Crear mi Contraseña
          </a>
        </div>
      </div>

      <!-- Sales pitch link -->
      <div style="text-align:center;margin-bottom:24px;">
        <p style="color:#6b7280;font-size:13px;margin-bottom:12px;">
          También puedes consultar nuestra <strong>Guía de Presentación del Software</strong> para saber qué comunicar a tus clientes:
        </p>
        <a href="${SITE_URL}/lp/socio/presentacion" style="display:inline-block;color:#2563eb;font-size:14px;font-weight:600;text-decoration:underline;">
          Ver Guía de Ventas →
        </a>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${waUrl}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
          💬 Soporte por WhatsApp
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0;">
        © ${new Date().getFullYear()} SistecPOS · Software POS Colombia
      </p>
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
    const waUrl = buildWaUrl(waNumber, "Hola, soy socio de SistecPOS y necesito ayuda");

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.type === "welcome") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [payload.email],
          subject: "🚀 ¡Tu postulación fue recibida! — SistecPOS",
          html: welcomeHtml(payload.name, waUrl),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        return new Response(JSON.stringify({ error: "Email send failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, action: "welcome_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.type === "approved") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // 1. Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      let userId: string | null = null;
      const existingUser = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === payload.email.toLowerCase()
      );

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const tempPassword = crypto.randomUUID();
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: payload.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: payload.name },
        });

        if (createError) {
          console.error("Create user error:", createError);
          return new Response(JSON.stringify({ error: "Failed to create user" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        userId = newUser.user.id;
      }

      // 2. Assign reseller role
      await supabase.from("user_roles").upsert(
        { user_id: userId, role: "reseller" },
        { onConflict: "user_id,role" }
      );

      // 3. Link user_id to reseller_applications
      await supabase
        .from("reseller_applications")
        .update({ user_id: userId })
        .eq("id", payload.resellerId);

      // 4. Initialize default modules
      const defaultModules = [
        { reseller_id: payload.resellerId, module_key: "licencias", is_enabled: true },
        { reseller_id: payload.resellerId, module_key: "entrenamientos", is_enabled: true },
        { reseller_id: payload.resellerId, module_key: "tickets", is_enabled: true },
        { reseller_id: payload.resellerId, module_key: "comisiones", is_enabled: false },
        { reseller_id: payload.resellerId, module_key: "solicitar-demo", is_enabled: true },
      ];
      await supabase.from("reseller_modules").delete().eq("reseller_id", payload.resellerId);
      await supabase.from("reseller_modules").insert(defaultModules);

      // 5. Generate password reset link
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: payload.email,
        options: { redirectTo: `${SITE_URL}/auth?type=recovery` },
      });

      let resetLink = `${SITE_URL}/auth`;
      if (linkData?.properties?.action_link) {
        resetLink = linkData.properties.action_link;
      } else {
        console.warn("Could not generate reset link:", linkError);
      }

      // 6. Send activation email
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [payload.email],
          subject: "🎉 ¡Tu panel de socios está activo! — SistecPOS",
          html: approvedHtml(payload.name, resetLink, payload.email, waUrl),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
      }

      return new Response(
        JSON.stringify({ success: true, action: "approved_processed", userId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
