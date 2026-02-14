import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Parse COP price from FacilPOS HTML text like "$472,966" or "$1,272,241" */
function parseCOP(text: string): number | null {
  // Remove currency symbol, dots, commas used as thousands separators
  const cleaned = text.replace(/[^0-9.,]/g, "");
  // FacilPOS uses comma as thousands separator (e.g. "472,966")
  const num = Number(cleaned.replace(/,/g, ""));
  return isNaN(num) || num === 0 ? null : num;
}

interface PriceMatch {
  planKey: string;
  officialPrice: number;
}

// Map FacilPOS product URL slugs to our plan keys
const PRODUCT_MAP: Record<string, string> = {
  "licencia-vip-anual-facil-pos-2-tiendas-ahorre-un-20": "emprendedor",
  "software-pos-licencia-anual-muti-tienda-3-sucursales": "negocio",
  "software-pos-licencia-anual-1-sucursal": "empresarial",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch FacilPOS store page
    const res = await fetch("https://facilpos.co/tienda/?currency=COP", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SistecPOS PriceSync/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`FacilPOS responded with ${res.status}`);
    }

    const html = await res.text();

    // Extract prices using regex patterns on the HTML
    // FacilPOS uses WooCommerce with structured price elements
    // Pattern: <a href="...producto/SLUG/">...<bdi>PRICE</bdi>... (current price is the last <bdi> in each product)
    const matches: PriceMatch[] = [];

    for (const [urlSlug, planKey] of Object.entries(PRODUCT_MAP)) {
      // Find the product block by its URL slug
      const productRegex = new RegExp(
        `producto/${urlSlug}/[^"]*"[\\s\\S]*?El precio actual es:[^\\d]*([\\d,.]+)`,
        "i"
      );
      const match = html.match(productRegex);

      if (match) {
        const price = parseCOP(match[1]);
        if (price) {
          matches.push({ planKey, officialPrice: price });
        }
      }
    }

    // Also try a simpler approach: look for price patterns near product URLs
    if (matches.length < Object.keys(PRODUCT_MAP).length) {
      // Fallback: parse from structured data or meta tags
      for (const [urlSlug, planKey] of Object.entries(PRODUCT_MAP)) {
        if (matches.find((m) => m.planKey === planKey)) continue;

        // Try finding amount in woocommerce-Price-amount near the product URL
        const fallbackRegex = new RegExp(
          `${urlSlug}[\\s\\S]{0,2000}?woocommerce-Price-amount[^>]*>.*?([\\d,.]+)`,
          "i"
        );
        const fallbackMatch = html.match(fallbackRegex);
        if (fallbackMatch) {
          const price = parseCOP(fallbackMatch[1]);
          if (price) {
            matches.push({ planKey, officialPrice: price });
          }
        }
      }
    }

    // Update database
    const results = [];
    for (const { planKey, officialPrice } of matches) {
      const { error } = await supabase
        .from("license_pricing")
        .update({
          official_price_cop: officialPrice,
          last_synced_at: new Date().toISOString(),
        })
        .eq("plan_key", planKey);

      results.push({
        planKey,
        officialPrice,
        error: error?.message || null,
      });
    }

    // Check for plans where selling_price > official_price and log warning
    const { data: pricing } = await supabase
      .from("license_pricing")
      .select("plan_key, official_price_cop, selling_price_cop")
      .order("sort_order");

    const warnings = (pricing || [])
      .filter((p) => p.selling_price_cop > p.official_price_cop && p.official_price_cop > 0)
      .map(
        (p) =>
          `⚠️ ${p.plan_key}: venta ($${p.selling_price_cop}) > oficial ($${p.official_price_cop})`
      );

    return new Response(
      JSON.stringify({
        success: true,
        synced: matches.length,
        total_plans: Object.keys(PRODUCT_MAP).length,
        results,
        warnings,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
