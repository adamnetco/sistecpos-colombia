import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  amount: number;
  payment_method: string | null;
  reference: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  license_id: string | null;
  certificate_order_id: string | null;
}

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("payments").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayments((data as Payment[]) || []);
        setLoading(false);
      });
  }, []);

  const statusBadge = (s: string) => {
    if (s === "confirmed") return <Badge className="bg-whatsapp text-white">Confirmado</Badge>;
    if (s === "rejected") return <Badge variant="destructive">Rechazado</Badge>;
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Pagos</h1>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Monto</th>
              <th className="px-4 py-3 text-left font-medium">Método</th>
              <th className="px-4 py-3 text-left font-medium">Referencia</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Vinculado a</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay pagos registrados</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="px-4 py-3 font-bold">${p.amount.toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3 capitalize">{p.payment_method || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.reference || "—"}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.license_id ? "Licencia" : p.certificate_order_id ? "Certificado" : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
