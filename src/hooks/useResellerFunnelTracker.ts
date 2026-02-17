import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type FunnelEventType =
  | "page_view"
  | "video_started"
  | "video_completed"
  | "cta_clicked"
  | "google_registered"
  | "calendar_booked";

export function useResellerFunnelTracker() {
  const tracked = useRef(new Set<string>());

  const trackEvent = useCallback(
    async (
      email: string,
      eventType: FunnelEventType,
      eventData?: Record<string, unknown>
    ) => {
      // Deduplicate same event per session
      const key = `${email}-${eventType}-${JSON.stringify(eventData || {})}`;
      if (tracked.current.has(key)) return;
      tracked.current.add(key);

      try {
        await supabase.from("reseller_funnel_events").insert({
          reseller_email: email,
          event_type: eventType,
          event_data: (eventData || {}) as Record<string, never>,
          page_url: window.location.pathname,
        });

        // Auto-advance pipeline stage for key events
        if (eventType === "video_completed") {
          await supabase
            .from("reseller_applications")
            .update({ pipeline_stage: "video_watched" })
            .eq("email", email)
            .eq("pipeline_stage", "registered");
        }
      } catch (e) {
        console.error("Funnel tracking error:", e);
      }
    },
    []
  );

  return { trackEvent };
}
