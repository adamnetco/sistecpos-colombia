import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { KeyRound, TicketCheck, DollarSign } from "lucide-react";

export default function ResellerDashboard() {
  const { reseller } = useReseller();
  const [stats, setStats] = useState({ licenses: 0, tickets: 0, commissions: 0 });

  useEffect(() => {
    if (!reseller) return;

    const load = async () => {
      const [licRes, tickRes] = await Promise.all([
        supabase.from("licenses").select("id", { count: "exact", head: true }).eq("created_by_reseller_id", reseller.id),
        supabase.from("reseller_tickets").select("id", { count: "exact", head: true }).eq("reseller_id", reseller.id),
      ]);

      setStats({
        licenses: licRes.count || 0,
        tickets: tickRes.count || 0,
        commissions: 0,
      });
    };

    load();
  }, [reseller]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">
        Bienvenido, {reseller?.full_name?.split(" ")[0]}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={KeyRound} label="Licencias Creadas" value={stats.licenses} />
        <StatCard icon={TicketCheck} label="Tickets Abiertos" value={stats.tickets} />
        <StatCard icon={DollarSign} label="Comisiones" value={`$${stats.commissions.toLocaleString()}`} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
