import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackingScript {
  id: string;
  placement: string;
  code: string;
  noscript_code: string | null;
}

/**
 * Injects tracking scripts from the database into the DOM.
 * Supports head, body_start, and body_end placements.
 */
export function TrackingScriptInjector() {
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    (async () => {
      const { data } = await supabase
        .from("tracking_scripts")
        .select("id, placement, code, noscript_code")
        .eq("is_enabled", true)
        .order("sort_order");

      if (!data || data.length === 0) return;

      data.forEach((script: TrackingScript) => {
        injectScript(script.code, script.placement);
        // Inject noscript code at body_start (required by GTM)
        if (script.noscript_code) {
          injectScript(script.noscript_code, "body_start");
        }
      });
    })();
  }, []);

  return null;
}

function injectScript(html: string, placement: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const target =
    placement === "head"
      ? document.head
      : placement === "body_start"
        ? document.body
        : document.body;

  const insertBefore = placement === "body_start" ? document.body.firstChild : null;

  // Process all child nodes
  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeName === "SCRIPT") {
      // Scripts need to be re-created to execute
      const script = document.createElement("script");
      const srcNode = node as HTMLScriptElement;
      
      // Copy attributes
      Array.from(srcNode.attributes).forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (srcNode.textContent) {
        script.textContent = srcNode.textContent;
      }

      if (insertBefore) {
        target.insertBefore(script, insertBefore);
      } else {
        target.appendChild(script);
      }
    } else {
      const clone = node.cloneNode(true);
      if (insertBefore) {
        target.insertBefore(clone, insertBefore);
      } else {
        target.appendChild(clone);
      }
    }
  });
}
