import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, Clock } from "lucide-react";

interface Commission {
  id: string;
  product_type: string;
  commission_type: string;
  commission_value: number;
  min_amount: number;
  max_amount: number | null;
  is_active: boolean;
}

interface Payment {
  id: string;
  amount: number;
  period: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export default function ResellerCommissionsView() {
  const { reseller } = useReseller();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reseller) return;
    Promise.all([
      supabase
        .from("reseller_commissions")
        .select("*")
        .eq("reseller_id", reseller.id)
        .eq("is_active", true)
        .order("product_type"),
      supabase
        .from("reseller_commission_payments")
        .select("*")
        .eq("reseller_id", reseller.id)
        .order("created_at", { ascending: false }),
    ]).then(([commRes, payRes]) => {
      setCommissions((commRes.data as Commission[]) || []);
      setPayments((payRes.data as Payment[]) || []);
      setLoading(false);
    });
  }, [reseller]);

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Mis Comisiones</h1>

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mb-6">
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-whatsapp/10 p-2"><DollarSign className="h-4 w-4 text-whatsapp" /></div>
          <div><p className="text-xs text-muted-foreground">Pagado</p><p className="text-xl font-bold">${totalPaid.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-yellow-500/10 p-2"><Clock className="h-4 w-4 text-yellow-600" /></div>
          <div><p className="text-xs text-muted-foreground">Pendiente</p><p className="text-xl font-bold">${totalPending.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-primary/10 p-2"><Wallet className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Reglas activas</p><p className="text-xl font-bold">{commissions.length}</p></div>
        </CardContent></Card>
      </div>

      {/* Commission rules */}
      <h2 className="text-lg font-semibold mb-3">Reglas de Comisión</h2>
      {commissions.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center mb-6">
          <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No tienes comisiones configuradas aún.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto mb-6">
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

      {/* Payment history */}
      <h2 className="text-lg font-semibold mb-3">Historial de Pagos</h2>
      {payments.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No hay pagos registrados aún.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Período</th>
                <th className="px-4 py-3 text-left font-medium">Monto</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Fecha Pago</th>
                <th className="px-4 py-3 text-left font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{p.period}</td>
                  <td className="px-4 py-3">${Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge className={p.status === "paid" ? "bg-green-600 text-white" : "bg-yellow-500 text-white"}>
                      {p.status === "paid" ? "Pagado" : "Pendiente"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString("es-CO") : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
