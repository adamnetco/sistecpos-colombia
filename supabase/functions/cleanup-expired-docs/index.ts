import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get retention days from settings
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "doc_retention_days")
      .single();

    const retentionDays = parseInt(setting?.value || "30", 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    // Find orders older than retention period
    const { data: oldOrders, error: fetchErr } = await supabase
      .from("certificate_orders")
      .select("id, rut_url, camara_comercio_url, cedula_url, soporte_pago_url")
      .lt("created_at", cutoffISO);

    if (fetchErr) throw fetchErr;
    if (!oldOrders || oldOrders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired documents to clean", cutoff: cutoffISO }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Collect all file paths to delete
    const filePaths: string[] = [];
    for (const order of oldOrders) {
      if (order.rut_url) filePaths.push(order.rut_url);
      if (order.camara_comercio_url) filePaths.push(order.camara_comercio_url);
      if (order.cedula_url) filePaths.push(order.cedula_url);
      if (order.soporte_pago_url) filePaths.push(order.soporte_pago_url);
    }

    // Delete files from storage in batches
    let deletedFiles = 0;
    if (filePaths.length > 0) {
      const { data: removed, error: storageErr } = await supabase.storage
        .from("certificate-docs")
        .remove(filePaths);

      if (storageErr) {
        console.error("Storage deletion error:", storageErr);
      } else {
        deletedFiles = removed?.length || 0;
      }
    }

    // Clear URLs from orders (keep the order record, just remove file references)
    const orderIds = oldOrders.map((o) => o.id);
    await supabase
      .from("certificate_orders")
      .update({
        rut_url: "",
        camara_comercio_url: "",
        cedula_url: "",
        soporte_pago_url: null,
        notes: `Documentos eliminados automáticamente el ${new Date().toLocaleDateString("es-CO")} (retención: ${retentionDays} días)`,
      })
      .in("id", orderIds);

    return new Response(
      JSON.stringify({
        message: `Cleanup completed`,
        ordersProcessed: oldOrders.length,
        filesDeleted: deletedFiles,
        cutoff: cutoffISO,
        retentionDays,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
