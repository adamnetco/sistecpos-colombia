import { useState, useEffect, useCallback } from "react";
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

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // Run role check and reseller profile fetch in parallel
      const [roleRes, resellerRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "reseller")
          .maybeSingle(),
        supabase
          .from("reseller_applications")
          .select("id, full_name, email, phone, city, status")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (!roleRes.data) {
        setIsReseller(false);
        setReseller(null);
        setModules([]);
        setLoading(false);
        return;
      }

      setIsReseller(true);
      const profile = resellerRes.data as ResellerProfile | null;
      setReseller(profile);

      if (profile) {
        const { data: modulesData } = await supabase
          .from("reseller_modules")
          .select("module_key, is_enabled")
          .eq("reseller_id", profile.id);

        if (!cancelled) {
          setModules((modulesData as ResellerModule[]) || []);
        }
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const hasModule = useCallback((key: string): boolean => {
    if (key === "licencias") return true;
    return modules.some((m) => m.module_key === key && m.is_enabled);
  }, [modules]);

  return { reseller, modules, loading, isReseller, hasModule };
}
