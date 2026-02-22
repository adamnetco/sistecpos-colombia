import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupportPlan {
  id: string;
  plan: string;
  price_cop: number;
  plan_label: string;
  plan_description: string;
  features: string[];
  is_popular: boolean;
  sort_order: number;
  show_in_landing: boolean;
  cta_whatsapp_message: string;
  target_audience: string;
}

export function useSupportPlans() {
  return useQuery({
    queryKey: ["support_plans_landing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_subscriptions")
        .select("id, plan, price_cop, plan_label, plan_description, features, is_popular, sort_order, show_in_landing, cta_whatsapp_message, target_audience")
        .eq("show_in_landing", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as SupportPlan[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
