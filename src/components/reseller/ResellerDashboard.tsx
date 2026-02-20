import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { KeyRound, TicketCheck, DollarSign, TrendingUp, AlertTriangle, GraduationCap, MessageSquare, Wallet, Building2, ScrollText, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ResellerDashboard() {
  const { reseller } = useReseller();
  const { user } = useAuth();
  const [stats, setStats] = useState({ licenses: 0, tickets: 0, openTickets: 0, expiringSoon: 0, pendingCommissions: 0 });
  const [supportPlan, setSupportPlan] = useState<string | null>(null);
  const [licensesByMonth, setLicensesByMonth] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reseller || !user) return;

    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const in30 = new Date();
      in30.setDate(in30.getDate() + 30);
      const in30Str = in30.toISOString().split("T")[0];

      const [licRes, tickRes, payRes, subRes] = await Promise.all([
        supabase.from("licenses").select("id, created_at, expires_at, status", { count: "exact" }).eq("created_by_reseller_id", reseller.id),
        supabase.from("reseller_tickets").select("id, status", { count: "exact" }).eq("reseller_id", reseller.id),
        supabase.from("reseller_commission_payments").select("amount, status").eq("reseller_id", reseller.id).eq("status", "pending"),
        supabase.from("support_subscriptions").select("plan").eq("user_id", user.id).eq("status", "active").limit(1),
      ]);

      const openTickets = (tickRes.data || []).filter(t => t.status === "open").length;
      const expiringSoon = (licRes.data || []).filter(l =>
        l.expires_at && l.expires_at >= today && l.expires_at <= in30Str && l.status !== "suspended"
      ).length;
      const pendingCommissions = (payRes.data || []).reduce((s, p) => s + Number(p.amount), 0);

      setStats({ licenses: licRes.count || 0, tickets: tickRes.count || 0, openTickets, expiringSoon, pendingCommissions });
      setSupportPlan(subRes.data?.[0]?.plan ?? null);

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
  }, [reseller, user]);

  const planLabels: Record<string, string> = {
    autogestion: "Autogestión",
    tranquilidad: "Tranquilidad",
    socio_estrategico: "Socio Estratégico",
  };

  const quickLinks = [
    { label: "Licencias", href: "/socio/licencias", icon: KeyRound, color: "bg-primary/10 text-primary" },
    { label: "Entrenamientos", href: "/socio/entrenamientos", icon: GraduationCap, color: "bg-blue-500/10 text-blue-600" },
    { label: "Tickets", href: "/socio/tickets", icon: MessageSquare, color: "bg-yellow-500/10 text-yellow-600", badge: stats.openTickets },
    { label: "Comisiones", href: "/socio/comisiones", icon: Wallet, color: "bg-green-500/10 text-green-600" },
    { label: "Mi Empresa", href: "/socio/empresa", icon: Building2, color: "bg-violet-500/10 text-violet-600" },
    { label: "Suscripción", href: "/socio/suscripcion", icon: CreditCard, color: "bg-orange-500/10 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        Bienvenido, {reseller?.full_name?.split(" ")[0]}
      </h1>

      {/* Alerts */}
      {!loading && (stats.expiringSoon > 0 || stats.openTickets > 0) && (
        <div className="mb-4 space-y-2">
          {stats.expiringSoon > 0 && (
            <Link to="/socio/licencias" className="block">
              <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm hover:bg-yellow-500/10 transition-colors">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                <span><strong>{stats.expiringSoon}</strong> licencia(s) vencen en los próximos 30 días</span>
              </div>
            </Link>
          )}
          {stats.openTickets > 0 && (
            <Link to="/socio/tickets" className="block">
              <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm hover:bg-blue-500/10 transition-colors">
                <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />
                <span><strong>{stats.openTickets}</strong> ticket(s) abiertos pendientes de respuesta</span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-primary/10 p-2"><KeyRound className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Licencias</p>
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
            <div className="rounded-md bg-green-500/10 p-2"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Comisiones pendientes</p>
              <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : `$${stats.pendingCommissions.toLocaleString()}`}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-violet-500/10 p-2"><CreditCard className="h-5 w-5 text-violet-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Plan de Soporte</p>
              <p className="text-lg font-bold">{loading ? <Skeleton className="h-6 w-20" /> : planLabels[supportPlan ?? ""] ?? "Sin plan"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick access */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mb-6">
        {quickLinks.map((link) => (
          <Link key={link.href} to={link.href}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 pt-5 pb-4">
                <div className={`rounded-md p-2 ${link.color}`}>
                  <link.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[10px]">{link.badge}</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
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
