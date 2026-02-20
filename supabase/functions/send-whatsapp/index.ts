const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Centralized WhatsApp notification sender with anti-block protections.
 *
 * Body:
 *   event_type: string
 *   variables: Record<string, string>
 *   is_test?: boolean
 *   skip_rate_limit?: boolean  — only for admin testing
 *
 * Anti-block protections (CallMeBot compliance):
 *   1. Min 5s cooldown between ANY messages (global)
 *   2. Max 3 messages per hour to the same phone
 *   3. Max 50 messages per day (global)
 *   4. Deduplication: same event_type + phone within 10 min = skip
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ─── Rate Limit Config ────────────────────────────────── */

const GLOBAL_COOLDOWN_SECONDS = 5;
const MAX_PER_PHONE_PER_HOUR = 3;
const MAX_DAILY_TOTAL = 50;
const DEDUP_WINDOW_MINUTES = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const { event_type, variables = {}, is_test = false, skip_rate_limit = false } = await req.json();

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
      await logNotification(sb, event_type, "none", null, null, "skipped", "Template not found or inactive");
      return jsonResponse({ status: "skipped", message: "Template not found or inactive" });
    }

    // 2. Fetch provider — use template's provider_name if set, otherwise the default
    let providerQuery = sb.from("whatsapp_providers").select("*").eq("is_active", true);

    if (template.provider_name) {
      providerQuery = providerQuery.eq("name", template.provider_name);
    } else {
      providerQuery = providerQuery.eq("is_default", true);
    }

    const { data: provider, error: pErr } = await providerQuery.single();

    if (pErr || !provider) {
      await logNotification(sb, event_type, "none", null, null, "failed", "No active default provider");
      return jsonResponse({ status: "failed", message: "No active default provider" });
    }

    // Resolve recipient phone for rate limiting
    const recipientPhone = resolveRecipientPhone(provider);

    // 3. Rate Limit checks (skip for test mode or explicit skip)
    if (!is_test && !skip_rate_limit) {
      const rateLimitResult = await checkRateLimits(sb, event_type, recipientPhone);
      if (rateLimitResult) {
        await logNotification(sb, event_type, provider.name, recipientPhone, null, "rate_limited", rateLimitResult);
        console.warn(`[send-whatsapp] Rate limited: ${rateLimitResult}`);
        return jsonResponse({ status: "rate_limited", message: rateLimitResult });
      }
    }

    // 4. Render template
    let message = template.template_text;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || "-"));
    }
    message = message.replace(/\{\{[^}]+\}\}/g, "-");

    // 5. Send via provider
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

    // 6. Log result
    const status = sendResult.success ? "sent" : "failed";
    await logNotification(sb, event_type, provider.name, sendResult.recipientPhone || null, message, status, sendResult.error || null, variables);

    return jsonResponse({ status, message: sendResult.success ? "Notification sent" : sendResult.error });
  } catch (err) {
    console.error("send-whatsapp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/* ─── Rate Limiting ────────────────────────────────────── */

function resolveRecipientPhone(provider: { provider_type: string; config: Record<string, unknown> }): string | null {
  if (provider.provider_type === "callmebot") {
    if (provider.config.use_env_secrets) {
      return Deno.env.get(String(provider.config.phone_env || "CALLMEBOT_PHONE")) || null;
    }
    return String(provider.config.phone || "") || null;
  }
  if (provider.provider_type === "ycloud") {
    return String(provider.config.to_phone || "") || null;
  }
  return null;
}

async function checkRateLimits(
  sb: ReturnType<typeof createClient>,
  eventType: string,
  recipientPhone: string | null
): Promise<string | null> {
  const now = new Date();

  // 1. Global cooldown — last message sent within GLOBAL_COOLDOWN_SECONDS
  const cooldownThreshold = new Date(now.getTime() - GLOBAL_COOLDOWN_SECONDS * 1000).toISOString();
  const { data: recentGlobal } = await sb
    .from("whatsapp_notification_log")
    .select("id")
    .eq("status", "sent")
    .gte("created_at", cooldownThreshold)
    .limit(1);

  if (recentGlobal && recentGlobal.length > 0) {
    return `Global cooldown: min ${GLOBAL_COOLDOWN_SECONDS}s between messages`;
  }

  // 2. Daily total limit
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const { count: dailyCount } = await sb
    .from("whatsapp_notification_log")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("created_at", todayStart);

  if ((dailyCount ?? 0) >= MAX_DAILY_TOTAL) {
    return `Daily limit reached: ${MAX_DAILY_TOTAL} messages/day`;
  }

  if (recipientPhone) {
    // 3. Per-phone hourly limit
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const { count: phoneHourly } = await sb
      .from("whatsapp_notification_log")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .eq("recipient_phone", recipientPhone)
      .gte("created_at", oneHourAgo);

    if ((phoneHourly ?? 0) >= MAX_PER_PHONE_PER_HOUR) {
      return `Per-phone limit: max ${MAX_PER_PHONE_PER_HOUR}/hour to ${recipientPhone}`;
    }

    // 4. Deduplication — same event_type + phone within DEDUP_WINDOW
    const dedupThreshold = new Date(now.getTime() - DEDUP_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: dupes } = await sb
      .from("whatsapp_notification_log")
      .select("id")
      .eq("status", "sent")
      .eq("event_type", eventType)
      .eq("recipient_phone", recipientPhone)
      .gte("created_at", dedupThreshold)
      .limit(1);

    if (dupes && dupes.length > 0) {
      return `Duplicate: same event '${eventType}' to ${recipientPhone} within ${DEDUP_WINDOW_MINUTES}min`;
    }
  }

  return null; // All checks passed
}

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
    const body = await res.text();

    if (res.ok) {
      console.log(`[CallMeBot] Message sent to ${phone} — response: ${body.substring(0, 100)}`);
      return { success: true, recipientPhone: phone };
    }

    // Handle specific CallMeBot error codes
    if (res.status === 429 || body.toLowerCase().includes("rate limit")) {
      return { success: false, error: `CallMeBot rate limited (HTTP ${res.status}). Try again later.`, recipientPhone: phone };
    }

    return { success: false, error: `CallMeBot HTTP ${res.status}: ${body.substring(0, 200)}`, recipientPhone: phone };
  } catch (e) {
    return { success: false, error: `CallMeBot fetch error: ${String(e)}` };
  }
}

async function sendViaYCloud(
  config: Record<string, unknown>,
  message: string,
  _variables: Record<string, string>,
  _isTest: boolean
): Promise<{ success: boolean; error?: string; recipientPhone?: string }> {
  const apiKey = String(config.api_key || "");
  const fromPhone = String(config.from_phone || "");
  const toPhone = String(config.to_phone || "");

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

    const body = await res.text();
    if (res.ok) {
      return { success: true, recipientPhone: toPhone };
    }
    return { success: false, error: `yCloud HTTP ${res.status}: ${body}`, recipientPhone: toPhone };
  } catch (e) {
    return { success: false, error: `yCloud fetch error: ${String(e)}` };
  }
}

/* ─── Helpers ──────────────────────────────────────────── */

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
