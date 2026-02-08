import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Reseller {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  experience_summary: string | null;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pendiente", badge: "bg-yellow-500 text-white" },
  { value: "reviewing", label: "En Revisión", badge: "bg-blue-500 text-white" },
  { value: "approved", label: "Aprobado", badge: "bg-whatsapp text-white" },
  { value: "rejected", label: "Rechazado", badge: "bg-destructive text-destructive-foreground" },
];

export default function ResellersView() {
  const [apps, setApps] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("reseller_applications").select("*").order("created_at", { ascending: false });
    setApps((data as Reseller[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reseller_applications").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Solicitudes de Socios</h1>
        <Badge variant="outline" className="text-xs">
          {apps.filter((a) => a.status === "pending").length} pendientes
        </Badge>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
              <th className="px-4 py-3 text-left font-medium">Experiencia</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay solicitudes</td></tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id} className={`border-b hover:bg-muted/30 transition-colors ${a.status === "pending" ? "bg-yellow-500/5" : ""}`}>
                  <td className="px-4 py-3 font-medium">{a.full_name}</td>
                  <td className="px-4 py-3">{a.city}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{a.email}</div>
                    <div className="text-xs text-muted-foreground">{a.phone}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs text-xs">
                    <p className="line-clamp-2">{a.experience_summary || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
