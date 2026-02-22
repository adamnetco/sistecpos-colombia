import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommercialPack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  badge: string | null;
  license_pricing_id: string | null;
  included_module_ids: string[];
  implementation_included: boolean;
  support_months_included: number;
  price_cop: number;
  original_price_cop: number | null;
  savings_cop: number | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  features: string[];
  target_business_types: string[];
  cta_whatsapp_message: string;
  image_url: string | null;
}

export function useCommercialPacks() {
  return useQuery({
    queryKey: ["commercial_packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_packs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as CommercialPack[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
