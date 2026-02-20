import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // user_id
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(renderHTML("error", `Google denegó el acceso: ${error}`), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (!code || !state) {
      return new Response(renderHTML("error", "Faltan parámetros (code o state)"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const redirectUri = `${supabaseUrl}/functions/v1/google-oauth-callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return new Response(renderHTML("error", "Error al obtener tokens de Google"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Get user's Google email
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();
    const googleEmail = userInfo.email || null;

    // Store encrypted tokens using service role
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();
    const scopes = (tokenData.scope || "").split(" ");

    const { error: dbError } = await supabaseAdmin.rpc("upsert_google_tokens", {
      _user_id: state,
      _access_token: tokenData.access_token,
      _refresh_token: tokenData.refresh_token || "",
      _expires_at: expiresAt,
      _scopes: scopes,
      _google_email: googleEmail,
    });

    if (dbError) {
      console.error("DB error storing tokens:", dbError);
      return new Response(renderHTML("error", "Error al guardar tokens"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Also create default calendar config
    await supabaseAdmin.from("google_calendar_configs").upsert({
      user_id: state,
      calendar_id: "primary",
      label: googleEmail ? `Calendario de ${googleEmail}` : "Mi Calendario",
      is_active: true,
    }, { onConflict: "user_id,calendar_id" });

    return new Response(renderHTML("success", `Google conectado exitosamente como ${googleEmail || "usuario"}`), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("google-oauth-callback error:", err);
    return new Response(renderHTML("error", "Error interno del servidor"), {
      headers: { "Content-Type": "text/html" },
    });
  }
});

function renderHTML(status: "success" | "error", message: string): string {
  const color = status === "success" ? "#22c55e" : "#ef4444";
  const icon = status === "success" ? "✅" : "❌";
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Google ${status === "success" ? "Conectado" : "Error"} - SistecPOS</title>
<style>
  body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb}
  .card{background:#fff;border-radius:12px;padding:2rem;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .icon{font-size:3rem;margin-bottom:1rem}
  h1{font-size:1.25rem;color:${color};margin:0 0 .5rem}
  p{color:#6b7280;font-size:.9rem;margin:0 0 1.5rem}
  button{background:#111827;color:#fff;border:none;padding:.75rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.9rem}
  button:hover{background:#374151}
</style></head>
<body><div class="card">
  <div class="icon">${icon}</div>
  <h1>${status === "success" ? "¡Conexión Exitosa!" : "Error de Conexión"}</h1>
  <p>${message}</p>
  <button onclick="window.close();window.location.href='/'">Cerrar ventana</button>
</div></body></html>`;
}
