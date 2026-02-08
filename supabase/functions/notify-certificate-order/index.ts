import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderPayload {
  full_name: string;
  nit: string;
  email: string;
  phone: string;
  plan: string;
  price_cop: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: OrderPayload = await req.json();
    console.log("Received certificate order notification request:", payload.full_name);

    const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
    const phone = Deno.env.get("CALLMEBOT_PHONE");

    if (!apiKey || !phone) {
      console.error("Missing CALLMEBOT_API_KEY or CALLMEBOT_PHONE secrets");
      return new Response(
        JSON.stringify({ error: "Notification service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planLabel = payload.plan === "2_years" ? "2 Años" : "1 Año";
    const priceFormatted = payload.price_cop.toLocaleString("es-CO");

    const message = [
      "🟢 *Nuevo Pedido de Certificado Digital*",
      "",
      `👤 *Nombre:* ${payload.full_name}`,
      `🆔 *NIT:* ${payload.nit}`,
      `📧 *Email:* ${payload.email}`,
      `📱 *WhatsApp:* ${payload.phone}`,
      `📋 *Plan:* ${planLabel}`,
      `💰 *Precio:* $${priceFormatted} COP`,
      "",
      "📎 Documentos adjuntos en el panel.",
      "⚡ Contactar al cliente lo antes posible.",
    ].join("\n");

    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;

    console.log("Sending WhatsApp notification to:", phone);
    const response = await fetch(url);
    const responseText = await response.text();
    console.log("CallMeBot response:", response.status, responseText);

    if (!response.ok) {
      console.error("CallMeBot API error:", responseText);
      return new Response(
        JSON.stringify({ error: "Failed to send notification", details: responseText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in notify-certificate-order:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
