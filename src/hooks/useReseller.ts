import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ResellerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
}

interface ResellerModule {
  module_key: string;
  is_enabled: boolean;
}

export function useReseller() {
  const { user } = useAuth();
  const [reseller, setReseller] = useState<ResellerProfile | null>(null);
  const [modules, setModules] = useState<ResellerModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReseller, setIsReseller] = useState(false);

  useEffect(() => {
    if (!user) {
      setReseller(null);
      setModules([]);
      setIsReseller(false);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      // Check reseller role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "reseller")
        .maybeSingle();

      if (!roleData) {
        setIsReseller(false);
        setLoading(false);
        return;
      }

      setIsReseller(true);

      // Get reseller application profile
      const { data: resellerData } = await supabase
        .from("reseller_applications")
        .select("id, full_name, email, phone, city, status")
        .eq("user_id", user.id)
        .maybeSingle();

      setReseller(resellerData as ResellerProfile | null);

      if (resellerData) {
        // Get enabled modules
        const { data: modulesData } = await supabase
          .from("reseller_modules")
          .select("module_key, is_enabled")
          .eq("reseller_id", resellerData.id);

        setModules((modulesData as ResellerModule[]) || []);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const hasModule = (key: string): boolean => {
    // "licencias" is always enabled for all resellers
    if (key === "licencias") return true;
    return modules.some((m) => m.module_key === key && m.is_enabled);
  };

  return { reseller, modules, loading, isReseller, hasModule };
}
