import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, Area, AreaChart } from "recharts";
import { KeyRound, Users, FileCheck, CreditCard, AlertTriangle, Handshake, TrendingUp, Contact2, Bot, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Stats {
  licenses: number;
  expiredLicenses: number;
  leads: number;
  newLeadsToday: number;
  certificates: number;
  pendingCertificates: number;
  payments: number;
  totalRevenue: number;
  resellers: number;
  pendingResellers: number;
  contacts: number;
  unreadContacts: number;
  aiConversationsToday: number;
  aiLeadsToday: number;
}

interface ExpiringLicense {
  id: string;
  business_name: string;
  expires_at: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    licenses: 0, expiredLicenses: 0, leads: 0, newLeadsToday: 0,
    certificates: 0, pendingCertificates: 0, payments: 0, totalRevenue: 0,
    resellers: 0, pendingResellers: 0, contacts: 0, unreadContacts: 0,
    aiConversationsToday: 0, aiLeadsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [leadsWeekly, setLeadsWeekly] = useState<{ day: string; count: number }[]>([]);
  const [expiringLicenses, setExpiringLicenses] = useState<ExpiringLicense[]>([]);

  useEffect(() => {
    async function load() {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const now = new Date().toISOString().split("T")[0];

      const [lic, leads, certs, pays, resellers, contactsRes, aiConvs] = await Promise.all([
        supabase.from("licenses").select("id, expires_at, status, business_name", { count: "exact" }),
        supabase.from("leads_trials").select("id, created_at, status", { count: "exact" }),
        supabase.from("certificate_orders").select("id, status", { count: "exact" }),
        supabase.from("payments").select("id, amount, status, paid_at", { count: "exact" }),
        supabase.from("reseller_applications").select("id, status", { count: "exact" }),
        supabase.from("contacts").select("id, is_read", { count: "exact" }),
        supabase.from("ai_conversations").select("id, created_at, is_lead_captured").gte("created_at", todayStart.toISOString()),
      ]);

      const expired = (lic.data || []).filter(l => l.expires_at && l.expires_at < now && l.status !== "expired").length;
      const newToday = (leads.data || []).filter(l => new Date(l.created_at) >= todayStart).length;
      const pendingCerts = (certs.data || []).filter(c => c.status === "pending").length;
      const pendingRes = (resellers.data || []).filter(r => r.status === "pending").length;
      const unreadContacts = (contactsRes.data || []).filter(c => !c.is_read).length;
      const confirmedPayments = (pays.data || []).filter(p => p.status === "confirmed");
      const totalRevenue = confirmedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Expiring in next 7 days
      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      const expiring = (lic.data || [])
        .filter(l => l.expires_at && l.expires_at >= now && l.expires_at <= sevenDays.toISOString().split("T")[0] && l.status === "active")
        .slice(0, 5) as ExpiringLicense[];
      setExpiringLicenses(expiring);

      setStats({
        licenses: lic.count || 0, expiredLicenses: expired,
        leads: leads.count || 0, newLeadsToday: newToday,
        certificates: certs.count || 0, pendingCertificates: pendingCerts,
        payments: pays.count || 0, totalRevenue,
        resellers: resellers.count || 0, pendingResellers: pendingRes,
        contacts: contactsRes.count || 0, unreadContacts,
        aiConversationsToday: (aiConvs.data || []).length,
        aiLeadsToday: (aiConvs.data || []).filter(c => c.is_lead_captured).length,
      });

      // Revenue by month (last 6 months)
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
        months[key] = 0;
      }
      confirmedPayments.forEach(p => {
        if (p.paid_at) {
          const d = new Date(p.paid_at);
          const key = d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
          if (months[key] !== undefined) months[key] += p.amount || 0;
        }
      });
      setRevenueData(Object.entries(months).map(([month, revenue]) => ({ month, revenue })));

      // Leads by day (last 7 days)
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toLocaleDateString("es-CO", { weekday: "short" })] = 0;
      }
      (leads.data || []).forEach(l => {
        const d = new Date(l.created_at);
        const key = d.toLocaleDateString("es-CO", { weekday: "short" });
        if (days[key] !== undefined) days[key]++;
      });
      setLeadsWeekly(Object.entries(days).map(([day, count]) => ({ day, count })));

      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { title: "Licencias", value: stats.licenses, icon: KeyRound, color: "text-primary", href: "/admin/licencias", subtitle: stats.expiredLicenses > 0 ? `${stats.expiredLicenses} vencida(s)` : undefined, subtitleColor: "text-destructive" },
    { title: "Leads", value: stats.leads, icon: Users, color: "text-blue-500", href: "/admin/leads", subtitle: stats.newLeadsToday > 0 ? `+${stats.newLeadsToday} hoy` : undefined, subtitleColor: "text-primary" },
    { title: "Certificados", value: stats.certificates, icon: FileCheck, color: "text-whatsapp", href: "/admin/certificados", subtitle: stats.pendingCertificates > 0 ? `${stats.pendingCertificates} pendiente(s)` : undefined, subtitleColor: "text-yellow-600" },
    { title: "Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(0)}k`, icon: CreditCard, color: "text-cta", href: "/admin/pagos" },
    { title: "Socios", value: stats.resellers, icon: Handshake, color: "text-purple-500", href: "/admin/socios", subtitle: stats.pendingResellers > 0 ? `${stats.pendingResellers} por revisar` : undefined, subtitleColor: "text-yellow-600" },
    { title: "CRM", value: stats.contacts, icon: Contact2, color: "text-indigo-500", href: "/admin/contactos", subtitle: stats.unreadContacts > 0 ? `${stats.unreadContacts} sin leer` : undefined, subtitleColor: "text-primary" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-display">Panel de Gestión</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Link key={c.title} to={c.href} className="group">
            <Card className="transition-all hover:shadow-md hover:border-primary/30 group-hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{c.title}</CardTitle>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : c.value}</div>
                {c.subtitle && !loading && (
                  <p className={`mt-1 text-[10px] font-medium ${c.subtitleColor || "text-muted-foreground"}`}>{c.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* AI KPIs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Chatbot IA Hoy</p>
              <p className="text-lg font-bold">{loading ? "..." : stats.aiConversationsToday} conversaciones</p>
              {stats.aiLeadsToday > 0 && <Badge className="bg-whatsapp/10 text-whatsapp text-[10px] mt-1">{stats.aiLeadsToday} leads capturados</Badge>}
            </div>
          </CardContent>
        </Card>
        {expiringLicenses.length > 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <p className="text-xs font-medium text-yellow-700">Licencias por vencer (7 días)</p>
              </div>
              <div className="space-y-1">
                {expiringLicenses.map(l => (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[200px]">{l.business_name}</span>
                    <span className="text-yellow-600 font-medium">{new Date(l.expires_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      {!loading && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Revenue Mensual</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-48">
                <AreaChart data={revenueData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" fill="var(--color-revenue)" fillOpacity={0.2} stroke="var(--color-revenue)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Leads por Día (última semana)</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ count: { label: "Leads", color: "hsl(var(--whatsapp))" } }} className="h-48">
                <BarChart data={leadsWeekly}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {!loading && (stats.expiredLicenses > 0 || stats.pendingResellers > 0 || stats.pendingCertificates > 0) && (
        <div className="mt-6 space-y-2">
          {stats.expiredLicenses > 0 && (
            <Link to="/admin/licencias" className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm hover:bg-destructive/10 transition-colors">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span><strong>{stats.expiredLicenses}</strong> licencia(s) vencida(s) requieren atención</span>
            </Link>
          )}
          {stats.pendingCertificates > 0 && (
            <Link to="/admin/certificados" className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm hover:bg-yellow-500/10 transition-colors">
              <FileCheck className="h-4 w-4 text-yellow-600" />
              <span><strong>{stats.pendingCertificates}</strong> certificado(s) pendiente(s)</span>
            </Link>
          )}
          {stats.pendingResellers > 0 && (
            <Link to="/admin/socios" className="flex items-center gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 text-sm hover:bg-purple-500/10 transition-colors">
              <Handshake className="h-4 w-4 text-purple-500" />
              <span><strong>{stats.pendingResellers}</strong> solicitud(es) de socio(s) por revisar</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
