import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { CreditCard, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    query.then(({ data }) => {
      setPayments((data as Payment[]) || []);
      setLoading(false);
    });
  }, [filterStatus]);

  const confirmed = payments.filter(p => p.status === "confirmed");
  const pending = payments.filter(p => p.status === "pending");
  const totalConfirmed = confirmed.reduce((s, p) => s + p.amount, 0);
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  // Monthly revenue chart
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    monthlyData[d.toLocaleDateString("es-CO", { month: "short" })] = 0;
  }
  confirmed.forEach(p => {
    if (p.paid_at) {
      const key = new Date(p.paid_at).toLocaleDateString("es-CO", { month: "short" });
      if (monthlyData[key] !== undefined) monthlyData[key] += p.amount;
    }
  });
  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));

  const statusBadge = (s: string) => {
    if (s === "confirmed") return <Badge className="bg-whatsapp text-white text-[10px]">Confirmado</Badge>;
    if (s === "rejected") return <Badge variant="destructive" className="text-[10px]">Rechazado</Badge>;
    return <Badge variant="secondary" className="text-[10px]">Pendiente</Badge>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-display">Pagos</h1>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <DollarSign className="h-5 w-5 text-whatsapp" />
            <div>
              <p className="text-xs text-muted-foreground">Total Confirmado</p>
              <p className="text-xl font-bold">{loading ? <Skeleton className="h-6 w-20" /> : `$${totalConfirmed.toLocaleString("es-CO")}`}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pendiente</p>
              <p className="text-xl font-bold">{loading ? <Skeleton className="h-6 w-20" /> : `$${totalPending.toLocaleString("es-CO")}`}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-2">Revenue Mensual</p>
            {!loading && (
              <ChartContainer config={{ amount: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-20">
                <BarChart data={chartData}>
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="rejected">Rechazados</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{payments.length} pagos</Badge>
      </div>

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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b"><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
              ))
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay pagos registrados</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs">{new Date(p.created_at).toLocaleDateString("es-CO")}</td>
                  <td className="px-4 py-3 font-bold">${p.amount.toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3 capitalize text-xs">{p.payment_method || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.reference || "—"}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.license_id ? <Badge variant="outline" className="text-[10px]">Licencia</Badge> : p.certificate_order_id ? <Badge variant="outline" className="text-[10px]">Certificado</Badge> : "—"}
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
