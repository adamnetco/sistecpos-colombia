import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALEGRA_API_BASE = "https://api.alegra.com/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Try Supabase secrets first, then app_settings fallback
    let alegraEmail = Deno.env.get("ALEGRA_EMAIL");
    let alegraToken = Deno.env.get("ALEGRA_TOKEN");
    if (!alegraEmail || !alegraToken) {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["secret_alegra_email", "secret_alegra_token"]);
      alegraEmail = alegraEmail || settings?.find((s: any) => s.key === "secret_alegra_email")?.value;
      alegraToken = alegraToken || settings?.find((s: any) => s.key === "secret_alegra_token")?.value;
    }

    if (!alegraEmail || !alegraToken) {
      return new Response(
        JSON.stringify({ error: "Alegra credentials not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = "Basic " + btoa(`${alegraEmail}:${alegraToken}`);
    const payload = await req.json();
    const { action = "create_invoice", ...invoiceData } = payload;

    if (action === "create_invoice") {
      // Create invoice in Alegra
      const { client, items, dueDate, observations } = invoiceData;

      if (!client || !items || !items.length) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: client, items" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const alegraPayload = {
        date: new Date().toISOString().split("T")[0],
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        client,
        items: items.map((item: any) => ({
          id: item.id || undefined,
          name: item.name,
          description: item.description || "",
          quantity: item.quantity || 1,
          price: item.price,
          tax: item.tax || [],
        })),
        observations: observations || "",
        status: "open",
      };

      const alegraRes = await fetch(`${ALEGRA_API_BASE}/invoices`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alegraPayload),
      });

      const alegraResult = await alegraRes.json();

      if (!alegraRes.ok) {
        return new Response(
          JSON.stringify({ error: "Alegra API error", details: alegraResult }),
          { status: alegraRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Optionally dispatch to n8n
      try {
        const { data: n8nSetting } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "secret_n8n_webhook_url")
          .single();

        if (n8nSetting?.value) {
          await fetch(n8nSetting.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "invoice_created",
              data: { invoice_id: alegraResult.id, invoice_number: alegraResult.numberTemplate?.fullNumber },
              timestamp: new Date().toISOString(),
              source: "sistecpos",
            }),
          });
        }
      } catch (_) {
        // n8n dispatch is best-effort
      }

      return new Response(
        JSON.stringify({ success: true, invoice: alegraResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_contacts") {
      const { search } = invoiceData;
      const url = search
        ? `${ALEGRA_API_BASE}/contacts?name=${encodeURIComponent(search)}`
        : `${ALEGRA_API_BASE}/contacts?limit=25`;

      const res = await fetch(url, {
        headers: { Authorization: authHeader },
      });
      const data = await res.json();

      return new Response(
        JSON.stringify({ contacts: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_items") {
      const res = await fetch(`${ALEGRA_API_BASE}/items?limit=50`, {
        headers: { Authorization: authHeader },
      });
      const data = await res.json();

      return new Response(
        JSON.stringify({ items: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
