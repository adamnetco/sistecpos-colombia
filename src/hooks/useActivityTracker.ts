import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type ActivityAction =
  | "portal_access"
  | "video_view"
  | "chatbot_interaction"
  | "ticket_create"
  | "license_activate"
  | "demo_request";

export function useActivityTracker() {
  const { user, roles } = useAuth();
  const tracked = useRef(new Set<string>());

  const trackActivity = useCallback(
    async (
      action: ActivityAction,
      portal: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!user) return;

      // Deduplicate portal_access per session per portal
      if (action === "portal_access") {
        const key = `${action}-${portal}`;
        if (tracked.current.has(key)) return;
        tracked.current.add(key);
      }

      const userRole = roles.includes("admin")
        ? "admin"
        : roles.includes("reseller")
        ? "reseller"
        : roles.includes("customer")
        ? "customer"
        : "visitor";

      try {
        await supabase.from("user_access_logs").insert({
          user_id: user.id,
          user_email: user.email || null,
          user_role: userRole,
          portal,
          action,
          metadata: (metadata || {}) as Record<string, never>,
        });
      } catch (e) {
        console.error("Activity tracking error:", e);
      }
    },
    [user, roles]
  );

  return { trackActivity };
}
