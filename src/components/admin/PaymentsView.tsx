import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar } from "recharts";
import { CreditCard, DollarSign, Clock, Wallet, CheckCircle2, XCircle, AlertTriangle, Download, Zap } from "lucide-react";
import { lazy, Suspense } from "react";
const CouponsTab = lazy(() => import("./CouponsTab"));
import { exportToCsv } from "@/lib/exportCsv";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface WompiTransaction {
  id: string;
  reference: string;
  wompi_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  certificate_order_id: string | null;
  cart_quote_id: string | null;
  created_at: string;
  updated_at: string;
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

function paymentStatusBadge(s: string) {
  if (s === "confirmed" || s === "paid") return <Badge className="bg-green-600 text-white text-[10px]">Confirmado</Badge>;
  if (s === "rejected") return <Badge variant="destructive" className="text-[10px]">Rechazado</Badge>;
  return <Badge variant="secondary" className="text-[10px]">Pendiente</Badge>;
}

function wompiStatusBadge(s: string) {
  switch (s) {
    case "APPROVED":
      return <Badge className="bg-green-600 text-white text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Aprobado</Badge>;
    case "DECLINED":
      return <Badge variant="destructive" className="text-[10px] gap-1"><XCircle className="h-3 w-3" />Rechazado</Badge>;
    case "VOIDED":
      return <Badge variant="outline" className="text-[10px] gap-1"><AlertTriangle className="h-3 w-3" />Anulado</Badge>;
    case "ERROR":
      return <Badge variant="destructive" className="text-[10px] gap-1"><XCircle className="h-3 w-3" />Error</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px] gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>;
  }
}

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wompiTxs, setWompiTxs] = useState<WompiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWompi, setLoadingWompi] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [wompiFilter, setWompiFilter] = useState("all");

  useEffect(() => {
    let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    query.then(({ data }) => {
      setPayments((data as Payment[]) || []);
      setLoading(false);
    });
  }, [filterStatus]);

  useEffect(() => {
    let query = supabase.from("wompi_transactions").select("*").order("created_at", { ascending: false });
    if (wompiFilter !== "all") query = query.eq("status", wompiFilter);
    query.then(({ data }) => {
      setWompiTxs((data as WompiTransaction[]) || []);
      setLoadingWompi(false);
    });
  }, [wompiFilter]);

  const confirmed = payments.filter(p => p.status === "confirmed" || p.status === "paid");
  const pending = payments.filter(p => p.status === "pending");
  const totalConfirmed = confirmed.reduce((s, p) => s + p.amount, 0);
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  const wompiApproved = wompiTxs.filter(t => t.status === "APPROVED");
  const wompiPending = wompiTxs.filter(t => t.status === "PENDING");
  const totalWompiApproved = wompiApproved.reduce((s, t) => s + t.amount_cents / 100, 0);
  const totalWompiPending = wompiPending.reduce((s, t) => s + t.amount_cents / 100, 0);

  // Monthly revenue chart (combined)
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
  wompiApproved.forEach(t => {
    const key = new Date(t.created_at).toLocaleDateString("es-CO", { month: "short" });
    if (monthlyData[key] !== undefined) monthlyData[key] += t.amount_cents / 100;
  });
  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-display">Pagos</h1>
        <div className="ml-auto">
          <Button size="sm" variant="outline" onClick={() => {
            const allData = [
              ...payments.map(p => ({ fecha: new Date(p.created_at).toLocaleDateString("es-CO"), cliente: "—", monto: p.amount, metodo: p.payment_method || "—", referencia: p.reference || "—", estado: p.status, tipo: "Manual" })),
              ...wompiTxs.map(t => ({ fecha: new Date(t.created_at).toLocaleDateString("es-CO"), cliente: t.customer_name || "—", monto: t.amount_cents / 100, metodo: t.payment_method || "—", referencia: t.reference, estado: t.status, tipo: "Wompi" })),
            ];
            exportToCsv(allData, [
              { key: "fecha", label: "Fecha" },
              { key: "cliente", label: "Cliente" },
              { key: "monto", label: "Monto COP" },
              { key: "metodo", label: "Método" },
              { key: "referencia", label: "Referencia" },
              { key: "estado", label: "Estado" },
              { key: "tipo", label: "Tipo" },
            ], "pagos");
          }}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Confirmado (Manual)</p>
              <p className="text-xl font-bold">{loading ? <Skeleton className="h-6 w-20" /> : formatCOP(totalConfirmed)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Aprobado (Wompi)</p>
              <p className="text-xl font-bold">{loadingWompi ? <Skeleton className="h-6 w-20" /> : formatCOP(totalWompiApproved)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pendiente Total</p>
              <p className="text-xl font-bold">{loading || loadingWompi ? <Skeleton className="h-6 w-20" /> : formatCOP(totalPending + totalWompiPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-2">Revenue Mensual</p>
            {!loading && !loadingWompi && (
              <ChartContainer config={{ amount: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-20">
                <BarChart data={chartData}>
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wompi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wompi" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            Wompi ({wompiTxs.length})
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5">
            <CreditCard className="h-4 w-4" />
            Manuales ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="coupons" className="gap-1.5">
            <Zap className="h-4 w-4" />
            Cupones
          </TabsTrigger>
        </TabsList>

        {/* Wompi Transactions Tab */}
        <TabsContent value="wompi">
          <div className="mb-4 flex items-center gap-3">
            <Select value={wompiFilter} onValueChange={setWompiFilter}>
              <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="APPROVED">Aprobados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="DECLINED">Rechazados</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">{wompiTxs.length} transacciones</Badge>
          </div>

          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Monto</th>
                  <th className="px-4 py-3 text-left font-medium">Método</th>
                  <th className="px-4 py-3 text-left font-medium">Referencia</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {loadingWompi ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b"><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : wompiTxs.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay transacciones Wompi registradas</td></tr>
                ) : (
                  wompiTxs.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                        <br />
                        <span className="text-muted-foreground">{new Date(t.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium">{t.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{t.customer_email || ""}</div>
                        {t.customer_phone && <div className="text-xs text-muted-foreground">{t.customer_phone}</div>}
                      </td>
                      <td className="px-4 py-3 font-bold whitespace-nowrap">{formatCOP(t.amount_cents / 100)}</td>
                      <td className="px-4 py-3 text-xs uppercase">{t.payment_method || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] break-all">{t.reference}</span>
                        {t.wompi_id && <div className="text-[10px] text-muted-foreground mt-0.5">Wompi: {t.wompi_id}</div>}
                      </td>
                      <td className="px-4 py-3">{wompiStatusBadge(t.status)}</td>
                      <td className="px-4 py-3 text-xs">
                        {t.certificate_order_id
                          ? <Badge variant="outline" className="text-[10px]">Certificado</Badge>
                          : t.cart_quote_id
                          ? <Badge variant="outline" className="text-[10px]">Carrito</Badge>
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Manual Payments Tab */}
        <TabsContent value="manual">
          <div className="mb-4 flex items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
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
                      <td className="px-4 py-3 font-bold">{formatCOP(p.amount)}</td>
                      <td className="px-4 py-3 capitalize text-xs">{p.payment_method || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.reference || "—"}</td>
                      <td className="px-4 py-3">{paymentStatusBadge(p.status)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.license_id ? <Badge variant="outline" className="text-[10px]">Licencia</Badge> : p.certificate_order_id ? <Badge variant="outline" className="text-[10px]">Certificado</Badge> : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
            <CouponsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

