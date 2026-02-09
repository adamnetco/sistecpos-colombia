import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { KeyRound, TicketCheck, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ResellerDashboard() {
  const { reseller } = useReseller();
  const [stats, setStats] = useState({ licenses: 0, tickets: 0, openTickets: 0 });
  const [licensesByMonth, setLicensesByMonth] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reseller) return;

    const load = async () => {
      const [licRes, tickRes] = await Promise.all([
        supabase.from("licenses").select("id, created_at", { count: "exact" }).eq("created_by_reseller_id", reseller.id),
        supabase.from("reseller_tickets").select("id, status", { count: "exact" }).eq("reseller_id", reseller.id),
      ]);

      const openTickets = (tickRes.data || []).filter(t => t.status === "open").length;

      setStats({
        licenses: licRes.count || 0,
        tickets: tickRes.count || 0,
        openTickets,
      });

      // Licenses by month
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        months[d.toLocaleDateString("es-CO", { month: "short" })] = 0;
      }
      (licRes.data || []).forEach(l => {
        const key = new Date(l.created_at).toLocaleDateString("es-CO", { month: "short" });
        if (months[key] !== undefined) months[key]++;
      });
      setLicensesByMonth(Object.entries(months).map(([month, count]) => ({ month, count })));
      setLoading(false);
    };

    load();
  }, [reseller]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        Bienvenido, {reseller?.full_name?.split(" ")[0]}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-primary/10 p-2"><KeyRound className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Licencias Creadas</p>
              <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.licenses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-yellow-500/10 p-2"><TicketCheck className="h-5 w-5 text-yellow-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Tickets</p>
              <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : stats.tickets}</p>
              {stats.openTickets > 0 && <Badge variant="outline" className="text-[10px] mt-1">{stats.openTickets} abiertos</Badge>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-whatsapp/10 p-2"><DollarSign className="h-5 w-5 text-whatsapp" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Comisiones</p>
              <p className="text-2xl font-bold">$0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!loading && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Licencias Creadas por Mes</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Licencias", color: "hsl(var(--primary))" } }} className="h-48">
              <BarChart data={licensesByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
