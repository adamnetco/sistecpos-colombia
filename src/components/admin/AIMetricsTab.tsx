import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Bot, Users, TrendingUp, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyMetric {
  date: string;
  conversations: number;
  leads: number;
}

interface PageMetric {
  page: string;
  count: number;
}

export default function AIMetricsTab() {
  const [dailyData, setDailyData] = useState<DailyMetric[]>([]);
  const [pageData, setPageData] = useState<PageMetric[]>([]);
  const [totals, setTotals] = useState({ conversations: 0, leads: 0, messages: 0, captureRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: convs } = await supabase
        .from("ai_conversations")
        .select("id, created_at, is_lead_captured, source_page, message_count")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const conversations = convs || [];
      const totalConvs = conversations.length;
      const totalLeads = conversations.filter(c => c.is_lead_captured).length;
      const totalMsgs = conversations.reduce((sum, c) => sum + (c.message_count || 0), 0);

      setTotals({
        conversations: totalConvs,
        leads: totalLeads,
        messages: totalMsgs,
        captureRate: totalConvs > 0 ? Math.round((totalLeads / totalConvs) * 100) : 0,
      });

      // Group by day
      const byDay: Record<string, { conversations: number; leads: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        byDay[key] = { conversations: 0, leads: 0 };
      }
      conversations.forEach(c => {
        const day = c.created_at.split("T")[0];
        if (byDay[day]) {
          byDay[day].conversations++;
          if (c.is_lead_captured) byDay[day].leads++;
        }
      });
      setDailyData(Object.entries(byDay).map(([date, v]) => ({
        date: new Date(date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        ...v,
      })));

      // Group by page
      const byPage: Record<string, number> = {};
      conversations.forEach(c => {
        const page = c.source_page || "Desconocida";
        byPage[page] = (byPage[page] || 0) + 1;
      });
      setPageData(
        Object.entries(byPage)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([page, count]) => ({ page, count }))
      );

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const kpis = [
    { title: "Conversaciones", value: totals.conversations, icon: MessageSquare, color: "text-blue-500" },
    { title: "Leads Capturados", value: totals.leads, icon: Users, color: "text-primary" },
    { title: "Tasa de Captura", value: `${totals.captureRate}%`, icon: TrendingUp, color: "text-whatsapp" },
    { title: "Total Mensajes", value: totals.messages, icon: Bot, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.title}>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-muted p-2.5">
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.title}</p>
                <p className="text-2xl font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Conversaciones / Día (últimos 30 días)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{
              conversations: { label: "Conversaciones", color: "hsl(var(--primary))" },
              leads: { label: "Leads", color: "hsl(var(--whatsapp))" },
            }} className="h-56">
              <BarChart data={dailyData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="conversations" fill="var(--color-conversations)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Páginas con más interacción</CardTitle></CardHeader>
          <CardContent>
            {pageData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin datos aún</p>
            ) : (
              <div className="space-y-3">
                {pageData.map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[180px] text-muted-foreground">{p.page}</span>
                    <span className="font-bold">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
