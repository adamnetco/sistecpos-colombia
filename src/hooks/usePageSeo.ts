import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PageSeoOverrides {
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_image?: string | null;
  og_type?: string | null;
  robots?: string | null;
  noindex?: boolean;
  json_ld?: any;
}

// Simple in-memory cache
const cache: Record<string, { data: PageSeoOverrides | null; ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export function usePageSeo(path?: string): PageSeoOverrides | null {
  const location = useLocation();
  const pagePath = path || location.pathname;
  const [overrides, setOverrides] = useState<PageSeoOverrides | null>(
    cache[pagePath]?.data ?? null
  );

  useEffect(() => {
    const cached = cache[pagePath];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setOverrides(cached.data);
      return;
    }

    supabase
      .from("page_seo_settings")
      .select("meta_title, meta_description, canonical_url, og_image, og_type, robots, noindex, json_ld")
      .eq("page_path", pagePath)
      .maybeSingle()
      .then(({ data }) => {
        const result = (data as unknown as PageSeoOverrides) || null;
        cache[pagePath] = { data: result, ts: Date.now() };
        setOverrides(result);
      });
  }, [pagePath]);

  return overrides;
}
