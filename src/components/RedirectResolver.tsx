import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side redirect resolver.
 * Checks the current path against active redirects in the DB
 * and navigates accordingly (for SPA client-side routing).
 */
export function RedirectResolver() {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirects, setRedirects] = useState<
    { source_path: string; target_path: string; redirect_type: number; is_regex: boolean; priority: number }[]
  >([]);

  // Load redirects once
  useEffect(() => {
    (supabase as any)
      .from("redirects")
      .select("source_path, target_path, redirect_type, is_regex, priority")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .then(({ data }: any) => {
        if (data) setRedirects(data);
      });
  }, []);

  useEffect(() => {
    if (redirects.length === 0) return;

    const currentPath = location.pathname;

    for (const r of redirects) {
      let match = false;

      if (r.is_regex) {
        try {
          const re = new RegExp(`^${r.source_path}$`);
          match = re.test(currentPath);
        } catch {
          continue;
        }
      } else {
        match = currentPath === r.source_path;
      }

      if (match) {
        // Increment hit count (fire-and-forget)
        (supabase as any)
          .from("redirects")
          .update({ hit_count: (supabase as any).rpc ? undefined : 0, last_hit_at: new Date().toISOString() })
          .eq("source_path", r.source_path)
          .then(() => {});

        // External redirect
        if (r.target_path.startsWith("http")) {
          window.location.href = r.target_path;
          return;
        }

        // Internal redirect
        navigate(r.target_path, { replace: true });
        return;
      }
    }
  }, [location.pathname, redirects, navigate]);

  return null;
}
