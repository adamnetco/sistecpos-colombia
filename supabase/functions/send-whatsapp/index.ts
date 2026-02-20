const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Centralized WhatsApp notification sender.
 *
 * Body:
 *   event_type: string         — matches whatsapp_templates.event_type
 *   variables: Record<string, string>  — template variables (name, business, phone, etc.)
 *   is_test?: boolean          — if true, sends to the provider's own phone (for testing)
 *
 * Flow:
 *   1. Fetch the template by event_type
 *   2. Fetch the default active provider
 *   3. Render template with variables
 *   4. Send via the provider's API
 *   5. Log the result
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const { event_type, variables = {}, is_test = false } = await req.json();

    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch template
    const { data: template, error: tErr } = await sb
      .from("whatsapp_templates")
      .select("*")
      .eq("event_type", event_type)
      .eq("is_active", true)
      .single();

    if (tErr || !template) {
      // Template not found or inactive — log and skip silently
      await logNotification(sb, event_type, "none", null, null, "skipped", "Template not found or inactive");
      return new Response(JSON.stringify({ status: "skipped", message: "Template not found or inactive" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch default provider
    const { data: provider, error: pErr } = await sb
      .from("whatsapp_providers")
      .select("*")
      .eq("is_default", true)
      .eq("is_active", true)
      .single();

    if (pErr || !provider) {
      await logNotification(sb, event_type, "none", null, null, "failed", "No active default provider");
      return new Response(JSON.stringify({ status: "failed", message: "No active default provider" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Render template
    let message = template.template_text;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || "-"));
    }
    // Clean any remaining unreplaced variables
    message = message.replace(/\{\{[^}]+\}\}/g, "-");

    // 4. Send via provider
    let sendResult: { success: boolean; error?: string; recipientPhone?: string };

    switch (provider.provider_type) {
      case "callmebot":
        sendResult = await sendViaCallMeBot(provider.config, message, is_test);
        break;
      case "ycloud":
        sendResult = await sendViaYCloud(provider.config, message, variables, is_test);
        break;
      default:
        sendResult = { success: false, error: `Unknown provider type: ${provider.provider_type}` };
    }

    // 5. Log
    const status = sendResult.success ? "sent" : "failed";
    await logNotification(sb, event_type, provider.name, sendResult.recipientPhone || null, message, status, sendResult.error || null, variables);

    return new Response(
      JSON.stringify({ status, message: sendResult.success ? "Notification sent" : sendResult.error }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-whatsapp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/* ─── Provider Implementations ─────────────────────────── */

async function sendViaCallMeBot(
  config: Record<string, unknown>,
  message: string,
  _isTest: boolean
): Promise<{ success: boolean; error?: string; recipientPhone?: string }> {
  let phone: string | undefined;
  let apiKey: string | undefined;

  if (config.use_env_secrets) {
    phone = Deno.env.get(String(config.phone_env || "CALLMEBOT_PHONE"));
    apiKey = Deno.env.get(String(config.apikey_env || "CALLMEBOT_API_KEY"));
  } else {
    phone = String(config.phone || "");
    apiKey = String(config.api_key || "");
  }

  if (!phone || !apiKey) {
    return { success: false, error: "CallMeBot credentials not configured" };
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      return { success: true, recipientPhone: phone };
    }
    const body = await res.text();
    return { success: false, error: `CallMeBot HTTP ${res.status}: ${body}`, recipientPhone: phone };
  } catch (e) {
    return { success: false, error: `CallMeBot fetch error: ${String(e)}` };
  }
}

async function sendViaYCloud(
  config: Record<string, unknown>,
  message: string,
  variables: Record<string, string>,
  _isTest: boolean
): Promise<{ success: boolean; error?: string; recipientPhone?: string }> {
  const apiKey = String(config.api_key || "");
  const fromPhone = String(config.from_phone || "");
  const toPhone = String(config.to_phone || ""); // admin notification phone

  if (!apiKey || !toPhone) {
    return { success: false, error: "yCloud credentials not configured (api_key, to_phone required)" };
  }

  try {
    const res = await fetch("https://api.ycloud.com/v2/whatsapp/messages", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromPhone,
        to: toPhone,
        type: "text",
        text: { body: message },
      }),
    });

    if (res.ok) {
      return { success: true, recipientPhone: toPhone };
    }
    const body = await res.text();
    return { success: false, error: `yCloud HTTP ${res.status}: ${body}`, recipientPhone: toPhone };
  } catch (e) {
    return { success: false, error: `yCloud fetch error: ${String(e)}` };
  }
}

/* ─── Logging ──────────────────────────────────────────── */

async function logNotification(
  sb: ReturnType<typeof createClient>,
  eventType: string,
  providerName: string,
  recipientPhone: string | null,
  messageSent: string | null,
  status: string,
  errorMessage: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    await sb.from("whatsapp_notification_log").insert({
      event_type: eventType,
      provider_name: providerName,
      recipient_phone: recipientPhone,
      message_sent: messageSent,
      status,
      error_message: errorMessage,
      metadata: metadata || {},
    });
  } catch (e) {
    console.error("Failed to log notification:", e);
  }
}
