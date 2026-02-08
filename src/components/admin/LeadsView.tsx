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
  status: string;
  trial_ends_at: string | null;
  created_at: string;
}

const statusOptions = [
  { value: "new", label: "Nuevo", color: "bg-blue-500" },
  { value: "contacted", label: "Contactado", color: "bg-yellow-500" },
  { value: "active_trial", label: "Demo Activa", color: "bg-whatsapp" },
  { value: "converted", label: "Convertido", color: "bg-primary" },
  { value: "lost", label: "Perdido", color: "bg-destructive" },
];

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Leads / Demos</h1>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
              <th className="px-4 py-3 text-left font-medium">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Demo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No hay leads</td></tr>
            ) : (
              leads.map((l) => {
                const trial = trialProgress(l);
                return (
                  <tr key={l.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{l.business_name}</td>
                    <td className="px-4 py-3">
                      <div>{l.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </td>
                    <td className="px-4 py-3">{l.city || "—"}</td>
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
                            {trial.daysLeft > 0 ? `${trial.daysLeft} días restantes` : "Expirada"}
                          </span>
                        </div>
                      ) : "—"}
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
