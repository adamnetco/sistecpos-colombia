import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { DollarSign } from "lucide-react";

interface Commission {
  id: string;
  product_type: string;
  commission_type: string;
  commission_value: number;
  min_amount: number;
  max_amount: number | null;
  is_active: boolean;
}

export default function ResellerCommissionsView() {
  const { reseller } = useReseller();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reseller) return;
    supabase
      .from("reseller_commissions")
      .select("*")
      .eq("reseller_id", reseller.id)
      .eq("is_active", true)
      .order("product_type")
      .then(({ data }) => {
        setCommissions((data as Commission[]) || []);
        setLoading(false);
      });
  }, [reseller]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Mis Comisiones</h1>

      {commissions.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No tienes comisiones configuradas aún.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Producto</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Rango</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-3 font-medium capitalize">{c.product_type}</td>
                  <td className="px-4 py-3 capitalize">{c.commission_type === "percentage" ? "Porcentaje" : "Monto fijo"}</td>
                  <td className="px-4 py-3">
                    {c.commission_type === "percentage" ? `${c.commission_value}%` : `$${c.commission_value.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.min_amount > 0 && `Desde $${c.min_amount.toLocaleString()}`}
                    {c.max_amount && ` hasta $${c.max_amount.toLocaleString()}`}
                    {c.min_amount === 0 && !c.max_amount && "Sin límite"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
