import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-requested-with, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { license_key } = await req.json();

    if (!license_key || typeof license_key !== "string") {
      return new Response(JSON.stringify({ valid: false, error: "license_key is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("licenses")
      .select("id, business_name, plan_type, status, expires_at, start_date")
      .eq("license_key", license_key)
      .maybeSingle();

    if (error || !data) {
      return new Response(JSON.stringify({ valid: false, error: "License not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const isExpired = data.expires_at && data.expires_at < today;
    const isActive = data.status === "active" && !isExpired;

    return new Response(
      JSON.stringify({
        valid: isActive,
        license: {
          business_name: data.business_name,
          plan_type: data.plan_type,
          status: isExpired ? "expired" : data.status,
          expires_at: data.expires_at,
          start_date: data.start_date,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ valid: false, error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
