import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Try Supabase secret first, then app_settings fallback
    let webhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!webhookUrl) {
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "secret_n8n_webhook_url")
        .single();
      webhookUrl = setting?.value;
    }
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "n8n webhook URL not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const { event, data } = payload;

    if (!event) {
      return new Response(
        JSON.stringify({ error: "Missing 'event' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward to n8n
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
        source: "sistecpos",
      }),
    });

    const result = await n8nResponse.text();

    return new Response(
      JSON.stringify({
        success: true,
        n8n_status: n8nResponse.status,
        event,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
