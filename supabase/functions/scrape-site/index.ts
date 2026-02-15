import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IGNORED_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|zip|mp4|mp3|woff2?|ttf|eot|css|js)$/i;
const MAX_PAGES = 40;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, job_id } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update job status
    if (job_id) {
      await supabase.from("ai_scraping_jobs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", job_id);
    }

    const baseUrl = new URL(url);
    const visited = new Set<string>();
    const queue = [baseUrl.href];
    const results: { title: string; content: string; url: string }[] = [];

    while (queue.length > 0 && visited.size < MAX_PAGES) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      if (IGNORED_EXTENSIONS.test(current)) continue;
      visited.add(current);

      try {
        const resp = await fetch(current, {
          headers: { "User-Agent": "SistecPOS-Bot/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) continue;
        const ct = resp.headers.get("content-type") || "";
        if (!ct.includes("text/html")) continue;

        const html = await resp.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (!doc) continue;

        // Remove scripts, styles, nav, footer, header
        for (const tag of ["script", "style", "nav", "footer", "header", "noscript", "iframe"]) {
          doc.querySelectorAll(tag).forEach((el: any) => el.remove());
        }

        const title = doc.querySelector("title")?.textContent?.trim() || current;
        const mainEl = doc.querySelector("main") || doc.querySelector("article") || doc.querySelector("body");
        const text = mainEl?.textContent?.replace(/\s+/g, " ").trim() || "";

        if (text.length > 50) {
          results.push({ title, content: text.slice(0, 3000), url: current });
        }

        // Discover internal links
        doc.querySelectorAll("a[href]").forEach((a: any) => {
          try {
            const href = new URL(a.getAttribute("href"), current);
            if (href.origin === baseUrl.origin && !visited.has(href.href) && !IGNORED_EXTENSIONS.test(href.pathname)) {
              href.hash = "";
              queue.push(href.href);
            }
          } catch { /* invalid URL */ }
        });
      } catch (e) {
        console.warn("Fetch error:", current, e);
      }
    }

    // Upsert results into knowledge base
    let entriesCreated = 0;
    for (const r of results) {
      const entryTitle = `[Scraping] ${r.title}`;
      // Upsert by title to avoid duplicates
      const { data: existing } = await supabase
        .from("ai_knowledge_base")
        .select("id")
        .eq("title", entryTitle)
        .maybeSingle();

      if (existing) {
        await supabase.from("ai_knowledge_base").update({
          content: `Fuente: ${r.url}\n\n${r.content}`,
          is_active: true,
        }).eq("id", existing.id);
      } else {
        await supabase.from("ai_knowledge_base").insert({
          entry_type: "document",
          title: entryTitle,
          content: `Fuente: ${r.url}\n\n${r.content}`,
          category: "scraping",
          is_active: true,
          sort_order: 999,
        });
      }
      entriesCreated++;
    }

    // Update job
    if (job_id) {
      await supabase.from("ai_scraping_jobs").update({
        status: "completed",
        pages_scraped: visited.size,
        entries_created: entriesCreated,
        completed_at: new Date().toISOString(),
      }).eq("id", job_id);
    }

    return new Response(
      JSON.stringify({ success: true, pages_scraped: visited.size, entries_created: entriesCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scrape-site error:", e);

    // Try to update job with error
    try {
      const { job_id } = await req.clone().json().catch(() => ({}));
      if (job_id) {
        const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await supabase.from("ai_scraping_jobs").update({
          status: "failed",
          error_message: e instanceof Error ? e.message : "Unknown error",
          completed_at: new Date().toISOString(),
        }).eq("id", job_id);
      }
    } catch { /* ignore */ }

    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
