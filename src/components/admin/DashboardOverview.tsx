import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Users, FileCheck, CreditCard, AlertTriangle, Handshake, TrendingUp } from "lucide-react";

interface Stats {
  licenses: number;
  expiredLicenses: number;
  leads: number;
  newLeadsToday: number;
  certificates: number;
  pendingCertificates: number;
  payments: number;
  resellers: number;
  pendingResellers: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    licenses: 0, expiredLicenses: 0, leads: 0, newLeadsToday: 0,
    certificates: 0, pendingCertificates: 0, payments: 0, resellers: 0, pendingResellers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [lic, leads, certs, pays, resellers] = await Promise.all([
        supabase.from("licenses").select("id, expires_at, status", { count: "exact" }),
        supabase.from("leads_trials").select("id, created_at, status", { count: "exact" }),
        supabase.from("certificate_orders").select("id, status", { count: "exact" }),
        supabase.from("payments").select("id", { count: "exact" }),
        supabase.from("reseller_applications").select("id, status", { count: "exact" }),
      ]);

      const now = new Date().toISOString().split("T")[0];
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const expired = (lic.data || []).filter(
        (l) => l.expires_at && l.expires_at < now && l.status !== "expired"
      ).length;

      const newToday = (leads.data || []).filter(
        (l) => new Date(l.created_at) >= todayStart
      ).length;

      const pendingCerts = (certs.data || []).filter(
        (c) => c.status === "pending"
      ).length;

      const pendingRes = (resellers.data || []).filter(
        (r) => r.status === "pending"
      ).length;

      setStats({
        licenses: lic.count || 0,
        expiredLicenses: expired,
        leads: leads.count || 0,
        newLeadsToday: newToday,
        certificates: certs.count || 0,
        pendingCertificates: pendingCerts,
        payments: pays.count || 0,
        resellers: resellers.count || 0,
        pendingResellers: pendingRes,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    {
      title: "Licencias Activas", value: stats.licenses, icon: KeyRound,
      color: "text-primary", href: "/admin/licencias",
      subtitle: stats.expiredLicenses > 0 ? `${stats.expiredLicenses} vencida(s)` : undefined,
      subtitleColor: "text-destructive",
    },
    {
      title: "Leads / Demos", value: stats.leads, icon: Users,
      color: "text-blue-500", href: "/admin/leads",
      subtitle: stats.newLeadsToday > 0 ? `+${stats.newLeadsToday} hoy` : undefined,
      subtitleColor: "text-primary",
    },
    {
      title: "Certificados", value: stats.certificates, icon: FileCheck,
      color: "text-whatsapp", href: "/admin/certificados",
      subtitle: stats.pendingCertificates > 0 ? `${stats.pendingCertificates} pendiente(s)` : undefined,
      subtitleColor: "text-yellow-600",
    },
    {
      title: "Pagos", value: stats.payments, icon: CreditCard,
      color: "text-cta", href: "/admin/pagos",
    },
    {
      title: "Socios", value: stats.resellers, icon: Handshake,
      color: "text-purple-500", href: "/admin/socios",
      subtitle: stats.pendingResellers > 0 ? `${stats.pendingResellers} por revisar` : undefined,
      subtitleColor: "text-yellow-600",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold font-display">Panel de Gestión</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.title} to={c.href} className="group">
            <Card className="transition-all hover:shadow-md hover:border-primary/30 group-hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : c.value}
                </div>
                {c.subtitle && !loading && (
                  <p className={`mt-1 text-xs font-medium ${c.subtitleColor || "text-muted-foreground"}`}>
                    {c.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick alerts */}
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
              <span><strong>{stats.pendingCertificates}</strong> certificado(s) pendiente(s) por procesar</span>
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
