import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string | null;
  source: string | null;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
}

const statusOptions = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "active_trial", label: "Demo Activa" },
  { value: "converted", label: "Convertido" },
  { value: "lost", label: "Perdido" },
];

const sourceLabels: Record<string, string> = {
  landing_campana: "📢 Campaña",
  website: "🌐 Web",
  referral: "🤝 Referido",
};

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("leads_trials").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads_trials").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else load();
  };

  const trialProgress = (lead: Lead) => {
    if (!lead.trial_ends_at) return null;
    const start = new Date(lead.created_at).getTime();
    const end = new Date(lead.trial_ends_at).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return { pct, daysLeft };
  };

  const filtered = filterStatus === "all" ? leads : leads.filter((l) => l.status === filterStatus);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: "bg-blue-500 text-white",
      contacted: "bg-yellow-500 text-white",
      active_trial: "bg-whatsapp text-white",
      converted: "bg-primary text-primary-foreground",
      lost: "bg-destructive text-destructive-foreground",
    };
    const label = statusOptions.find((s) => s.value === status)?.label || status;
    return <Badge className={map[status] || ""}>{label}</Badge>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Leads / Demos</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({leads.length})</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} ({leads.filter((l) => l.status === s.value).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
              <th className="px-4 py-3 text-left font-medium">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium">Origen</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Demo</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay leads</td></tr>
            ) : (
              filtered.map((l) => {
                const trial = trialProgress(l);
                return (
                  <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.business_name}</td>
                    <td className="px-4 py-3">
                      <div>{l.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                      <div className="text-xs text-muted-foreground">{l.phone}</div>
                    </td>
                    <td className="px-4 py-3">{l.city || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs">
                        {sourceLabels[l.source || ""] || l.source || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v)}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 w-40">
                      {trial ? (
                        <div className="space-y-1">
                          <Progress value={trial.pct} className="h-2" />
                          <span className={`text-xs ${trial.daysLeft === 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            {trial.daysLeft > 0 ? `${trial.daysLeft}d restantes` : "Expirada"}
                          </span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
