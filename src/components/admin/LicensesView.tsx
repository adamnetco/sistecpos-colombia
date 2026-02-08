import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";

interface License {
  id: string;
  business_name: string;
  business_nit: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  plan_type: string;
  status: string;
  start_date: string;
  expires_at: string | null;
  license_key: string;
  price_paid: number;
  notes: string | null;
}

export default function LicensesView() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [renewId, setRenewId] = useState<string | null>(null);
  const [renewPeriod, setRenewPeriod] = useState("anual");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("licenses").select("*").order("created_at", { ascending: false });
    setLicenses((data as License[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().split("T")[0];

  const isExpired = (l: License) => l.expires_at && l.expires_at < today;

  const handleRenew = async () => {
    if (!renewId) return;
    const license = licenses.find((l) => l.id === renewId);
    if (!license) return;

    const base = license.expires_at && license.expires_at > today
      ? new Date(license.expires_at)
      : new Date();

    if (renewPeriod === "anual") base.setFullYear(base.getFullYear() + 1);
    else base.setMonth(base.getMonth() + 1);

    const { error } = await supabase
      .from("licenses")
      .update({ expires_at: base.toISOString().split("T")[0], status: "active" })
      .eq("id", renewId);

    if (error) {
      toast({ title: "Error al renovar", variant: "destructive" });
    } else {
      toast({ title: "Licencia renovada" });
      setRenewId(null);
      load();
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const planType = fd.get("plan_type") as string;
    const startDate = new Date();
    let expiresAt: string | null = null;

    if (planType === "mensual") {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + 1);
      expiresAt = d.toISOString().split("T")[0];
    } else if (planType === "anual") {
      const d = new Date(startDate);
      d.setFullYear(d.getFullYear() + 1);
      expiresAt = d.toISOString().split("T")[0];
    }

    const { error } = await supabase.from("licenses").insert({
      business_name: fd.get("business_name") as string,
      contact_name: fd.get("contact_name") as string,
      contact_email: fd.get("contact_email") as string,
      contact_phone: fd.get("contact_phone") as string,
      plan_type: planType,
      price_paid: Number(fd.get("price_paid")),
      expires_at: expiresAt,
    });

    if (error) {
      toast({ title: "Error al crear licencia", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Licencia creada" });
      setShowAdd(false);
      load();
    }
  };

  const statusBadge = (l: License) => {
    if (isExpired(l)) return <Badge variant="destructive">Vencida</Badge>;
    if (l.status === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Licencias</h1>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Licencia</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear Licencia</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label>Negocio</Label><Input name="business_name" required /></div>
              <div><Label>Contacto</Label><Input name="contact_name" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input name="contact_email" type="email" /></div>
                <div><Label>Teléfono</Label><Input name="contact_phone" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Plan</Label>
                  <select name="plan_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                    <option value="vitalicio">Vitalicio</option>
                  </select>
                </div>
                <div><Label>Precio (COP)</Label><Input name="price_paid" type="number" required /></div>
              </div>
              <Button type="submit" className="w-full">Crear</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Renew Dialog */}
      <Dialog open={!!renewId} onOpenChange={(o) => !o && setRenewId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renovar Licencia</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Período</Label>
              <Select value={renewPeriod} onValueChange={setRenewPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensual">+1 Mes</SelectItem>
                  <SelectItem value="anual">+1 Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRenew} className="w-full">Confirmar Renovación</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Vence</th>
              <th className="px-4 py-3 text-left font-medium">Clave</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : licenses.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay licencias</td></tr>
            ) : (
              licenses.map((l) => (
                <tr key={l.id} className={`border-b ${isExpired(l) ? "bg-destructive/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.business_name}</div>
                    <div className="text-xs text-muted-foreground">{l.contact_name}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{l.plan_type}</td>
                  <td className="px-4 py-3">{statusBadge(l)}</td>
                  <td className="px-4 py-3">{l.expires_at || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.license_key.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setRenewId(l.id)}>
                      <RefreshCw className="mr-1 h-3 w-3" />Renovar
                    </Button>
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
