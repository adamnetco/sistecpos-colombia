import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Users, FileCheck, CreditCard, AlertTriangle } from "lucide-react";

interface Stats {
  licenses: number;
  expiredLicenses: number;
  leads: number;
  certificates: number;
  payments: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ licenses: 0, expiredLicenses: 0, leads: 0, certificates: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [lic, leads, certs, pays] = await Promise.all([
        supabase.from("licenses").select("id, expires_at, status", { count: "exact" }),
        supabase.from("leads_trials").select("id", { count: "exact" }),
        supabase.from("certificate_orders").select("id", { count: "exact" }),
        supabase.from("payments").select("id", { count: "exact" }),
      ]);

      const now = new Date().toISOString().split("T")[0];
      const expired = (lic.data || []).filter(
        (l) => l.expires_at && l.expires_at < now && l.status !== "expired"
      ).length;

      setStats({
        licenses: lic.count || 0,
        expiredLicenses: expired,
        leads: leads.count || 0,
        certificates: certs.count || 0,
        payments: pays.count || 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { title: "Licencias Activas", value: stats.licenses, icon: KeyRound, color: "text-primary" },
    { title: "Licencias Vencidas", value: stats.expiredLicenses, icon: AlertTriangle, color: "text-destructive" },
    { title: "Leads / Demos", value: stats.leads, icon: Users, color: "text-accent" },
    { title: "Certificados", value: stats.certificates, icon: FileCheck, color: "text-whatsapp" },
    { title: "Pagos", value: stats.payments, icon: CreditCard, color: "text-cta" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Panel de Gestión</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : c.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
