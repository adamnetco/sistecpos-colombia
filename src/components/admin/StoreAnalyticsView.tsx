import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Eye, ShoppingCart, MessageCircle, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

interface EventRow {
  event_type: string;
  product_name: string;
  created_at: string;
  session_id: string | null;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function StoreAnalyticsView() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  const load = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const { data, error } = await supabase
      .from("product_events")
      .select("event_type, product_name, created_at, session_id")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (!error) setEvents((data as EventRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [days]);

  const views = events.filter(e => e.event_type === "view");
  const cartAdds = events.filter(e => e.event_type === "cart_add");
  const quotes = events.filter(e => e.event_type === "quote_sent");

  const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;
  const quoteSessions = new Set(quotes.map(e => e.session_id).filter(Boolean)).size;
  const conversionRate = uniqueSessions > 0 ? ((quoteSessions / uniqueSessions) * 100).toFixed(1) : "0";

  // Top products by event type
  const topBy = (list: EventRow[], limit = 8) => {
    const counts: Record<string, number> = {};
    list.forEach(e => { counts[e.product_name] = (counts[e.product_name] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 25) + "…" : name, count }));
  };

  const topViewed = topBy(views);
  const topCarted = topBy(cartAdds);
  const topQuoted = topBy(quotes);

  // Daily trend
  const dailyTrend = (() => {
    const map: Record<string, { views: number; carts: number; quotes: number }> = {};
    events.forEach(e => {
      const day = e.created_at.slice(0, 10);
      if (!map[day]) map[day] = { views: 0, carts: 0, quotes: 0 };
      if (e.event_type === "view") map[day].views++;
      if (e.event_type === "cart_add") map[day].carts++;
      if (e.event_type === "quote_sent") map[day].quotes++;
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, v]) => ({ date: date.slice(5), ...v }));
  })();

  const pieData = [
    { name: "Vistas", value: views.length },
    { name: "Carrito", value: cartAdds.length },
    { name: "Cotizaciones", value: quotes.length },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Analytics — Tienda
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Métricas de la tienda pública</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="h-9"><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Eye className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{views.length}</p>
                  <p className="text-xs text-muted-foreground">Vistas de producto</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><ShoppingCart className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{cartAdds.length}</p>
                  <p className="text-xs text-muted-foreground">Agregados al carrito</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><MessageCircle className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{quotes.length}</p>
                  <p className="text-xs text-muted-foreground">Cotizaciones enviadas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversión visita→cotización</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tendencia diaria</CardTitle></CardHeader>
              <CardContent className="h-64">
                {dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="views" name="Vistas" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="carts" name="Carrito" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="quotes" name="Cotización" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sin datos en el periodo</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribución de eventos</CardTitle></CardHeader>
              <CardContent className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sin datos</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top products tables */}
          <div className="grid md:grid-cols-3 gap-6">
            <TopTable title="🔥 Más vistos" data={topViewed} />
            <TopTable title="🛒 Más al carrito" data={topCarted} />
            <TopTable title="💬 Más cotizados" data={topQuoted} />
          </div>
        </>
      )}
    </div>
  );
}

function TopTable({ title, data }: { title: string; data: { name: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Sin datos</p>
        ) : (
          <div className="space-y-2">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-[10px]">{i + 1}</Badge>
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-semibold text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
