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
const WHATSAPP_URL = "https://wa.me/573176268307?text=Hola,%20soy%20socio%20de%20SistecPOS%20y%20necesito%20ayuda";

function welcomeHtml(name: string): string {
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
          <span style="font-size:32px;">📩</span>
        </div>
      </div>
      <h1 style="text-align:center;color:#1a1a2e;font-size:24px;margin:0 0 8px;">¡Postulación Recibida!</h1>
      <p style="text-align:center;color:#6b7280;font-size:16px;margin:0 0 24px;">Hola <strong>${name}</strong>, gracias por tu interés en ser socio de SistecPOS.</p>
      
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
          ✅ Tu postulación ha sido registrada exitosamente.<br/>
          📋 Nuestro equipo revisará tu perfil en las próximas <strong>24 horas</strong>.<br/>
          🔔 Recibirás un correo cuando tu panel de socios sea habilitado.
        </p>
      </div>

      <p style="color:#6b7280;font-size:14px;text-align:center;line-height:1.6;">
        Mientras tanto, si tienes alguna pregunta puedes escribirnos directamente:
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${WHATSAPP_URL}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
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

function approvedHtml(name: string, resetLink: string, email: string): string {
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

      <!-- OPCIÓN 1: Google — acceso inmediato -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 8px;color:#166534;font-size:15px;font-weight:700;">⚡ Opción 1 — Acceso Inmediato con Google</p>
        <p style="margin:0 0 12px;color:#166534;font-size:14px;line-height:1.6;">
          Ingresa a la página de acceso y haz clic en <strong>"Continuar con Google"</strong> usando tu correo <strong>${email}</strong>. Serás redirigido automáticamente a tu panel de socios.
        </p>
        <div style="text-align:center;">
          <a href="${authUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:16px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
            🔑 Ir a Iniciar Sesión con Google
          </a>
        </div>
      </div>

      <!-- OPCIÓN 2: Contraseña -->
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#92400e;font-size:15px;font-weight:700;">🔐 Opción 2 — Crear una Contraseña</p>
        <p style="margin:0 0 12px;color:#a16207;font-size:14px;line-height:1.6;">
          Si prefieres usar email y contraseña, crea tu contraseña haciendo clic en el botón. Luego podrás iniciar sesión desde la página de acceso.
        </p>
        <div style="text-align:center;">
          <a href="${resetLink}" style="display:inline-block;background:#f59e0b;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:8px;text-decoration:none;">
            🔑 Crear mi Contraseña
          </a>
        </div>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${WHATSAPP_URL}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
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

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.type === "welcome") {
      // Send welcome/confirmation email to the applicant
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SistecPOS <notificaciones@sistecpos.com>",
          to: [payload.email],
          subject: "📩 Hemos recibido tu postulación — SistecPOS",
          html: welcomeHtml(payload.name),
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
      // Create Supabase admin client
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
        // Create user with a random password (they'll set their own)
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

      // 2. Assign reseller role (upsert)
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
      ];
      // Delete existing modules first to avoid duplicates
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
          html: approvedHtml(payload.name, resetLink, payload.email),
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
