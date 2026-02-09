import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  let id = sessionStorage.getItem("sp_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("sp_session_id", id);
  }
  return id;
};

export function useProductTracking() {
  const tracked = useRef(new Set<string>());

  const trackEvent = useCallback(
    async (
      eventType: "view" | "cart_add" | "quote_sent",
      productId: string,
      productName: string,
      metadata?: Record<string, unknown>
    ) => {
      // Deduplicate views per session
      if (eventType === "view") {
        const key = `${eventType}-${productId}`;
        if (tracked.current.has(key)) return;
        tracked.current.add(key);
      }

      try {
        await supabase.from("product_events").insert([{
          event_type: eventType,
          product_id: productId,
          product_name: productName,
          session_id: getSessionId(),
          metadata: (metadata || {}) as unknown as Record<string, never>,
        }]);
      } catch (e) {
        console.error("Tracking error:", e);
      }
    },
    []
  );

  return { trackEvent };
}
