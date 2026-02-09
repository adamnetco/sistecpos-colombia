import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  id: string;
  label: string;
  href: string;
  position: string;
  is_active: boolean;
  is_external: boolean;
  sort_order: number;
  parent_id: string | null;
}

export function useNavItems(position: string) {
  const [items, setItems] = useState<NavItem[]>([]);

  useEffect(() => {
    supabase
      .from("nav_items")
      .select("*")
      .eq("position", position)
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as NavItem[]) || []));
  }, [position]);

  const topItems = items.filter((n) => !n.parent_id);
  const getChildren = (parentId: string) => items.filter((n) => n.parent_id === parentId);

  return { items, topItems, getChildren };
}
