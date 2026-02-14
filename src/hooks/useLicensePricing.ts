import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LicensePricing {
  id: string;
  plan_key: string;
  plan_label: string;
  plan_description: string | null;
  official_price_cop: number;
  selling_price_cop: number;
  implementation_price_cop: number;
  support_monthly_cop: number;
  is_annual: boolean;
  last_synced_at: string | null;
  image_url: string | null;
}

export function useLicensePricing() {
  return useQuery({
    queryKey: ["license_pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("license_pricing")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as LicensePricing[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function monthlyPrice(annualPrice: number) {
  return Math.round(annualPrice / 12);
}

export function discountPct(official: number, selling: number) {
  if (official <= 0) return 0;
  return Math.round(((official - selling) / official) * 100);
}
