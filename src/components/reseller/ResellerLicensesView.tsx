import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Eye, Download, KeyRound, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { LICENSE_PLANS, planLabel, planIsAnnual } from "@/data/licensePlans";
import { exportToCsv } from "@/lib/exportCsv";

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
  rut_url: string | null;
}

type StatusFilter = "all" | "active" | "expired" | "suspended";

export default function ResellerLicensesView() {
  const { reseller } = useReseller();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [detailTarget, setDetailTarget] = useState<License | null>(null);
  const [rutFile, setRutFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(LICENSE_PLANS[0].value);
  const [price, setPrice] = useState(LICENSE_PLANS[0].defaultPriceCOP);

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const plan = LICENSE_PLANS.find((p) => p.value === value);
    if (plan) setPrice(plan.defaultPriceCOP);
  };

  const load = async () => {
    if (!reseller) return;
    setLoading(true);
    const { data } = await supabase
      .from("licenses")
      .select("*")
      .eq("created_by_reseller_id", reseller.id)
      .order("created_at", { ascending: false });
    setLicenses((data as License[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [reseller]);

  const today = new Date().toISOString().split("T")[0];
  const isExpired = (l: License) => l.expires_at && l.expires_at < today;
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().split("T")[0];
  const isExpiringSoon = (l: License) => l.expires_at && l.expires_at >= today && l.expires_at <= in30Str && l.status !== "suspended";

  const stats = useMemo(() => {
    const total = licenses.length;
    const active = licenses.filter(l => !isExpired(l) && l.status !== "suspended").length;
    const expired = licenses.filter(l => isExpired(l)).length;
    const expiringSoon = licenses.filter(l => isExpiringSoon(l)).length;
    return { total, active, expired, expiringSoon };
  }, [licenses]);

  const getEffectiveStatus = (l: License): string => {
    if (l.status === "suspended") return "suspended";
    if (isExpired(l)) return "expired";
    return "active";
  };

  const filtered = useMemo(() => {
    return licenses
      .filter((l) =>
        l.business_name.toLowerCase().includes(search.toLowerCase()) ||
        l.contact_name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((l) => {
        if (statusFilter === "all") return true;
        return getEffectiveStatus(l) === statusFilter;
      });
  }, [licenses, search, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      filtered.map(l => ({ ...l, estado: getEffectiveStatus(l) === "expired" ? "Vencida" : getEffectiveStatus(l) === "suspended" ? "Suspendida" : "Activa" })),
      [
        { key: "business_name", label: "Negocio" },
        { key: "contact_name", label: "Contacto" },
        { key: "contact_email", label: "Email" },
        { key: "contact_phone", label: "Teléfono" },
        { key: "plan_type", label: "Plan" },
        { key: "estado", label: "Estado" },
        { key: "start_date", label: "Inicio" },
        { key: "expires_at", label: "Vence" },
        { key: "price_paid", label: "Precio" },
      ],
      "licencias-socio"
    );
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reseller) return;
    if (!rutFile) {
      toast({ title: "Debes adjuntar el RUT del cliente", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const fileExt = rutFile.name.split(".").pop();
      const filePath = `rut/${reseller.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("certificate-docs")
        .upload(filePath, rutFile);

      if (uploadError) {
        toast({ title: "Error al subir el RUT", description: uploadError.message, variant: "destructive" });
        return;
      }

      const fd = new FormData(e.currentTarget);
      const planType = fd.get("plan_type") as string;
      let expiresAt: string | null = null;

      if (planIsAnnual(planType)) {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        expiresAt = d.toISOString().split("T")[0];
      }

      const { error } = await supabase.from("licenses").insert({
        business_name: fd.get("business_name") as string,
        business_nit: (fd.get("business_nit") as string) || null,
        contact_name: fd.get("contact_name") as string,
        contact_email: (fd.get("contact_email") as string) || null,
        contact_phone: (fd.get("contact_phone") as string) || null,
        plan_type: planType,
        price_paid: Number(fd.get("price_paid")),
        expires_at: expiresAt,
        notes: (fd.get("notes") as string) || null,
        created_by_reseller_id: reseller.id,
        rut_url: filePath,
      });

      if (error) {
        toast({ title: "Error al crear licencia", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Licencia creada exitosamente ✅" });
        setShowCreate(false);
        setRutFile(null);
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (l: License) => {
    const s = getEffectiveStatus(l);
    if (s === "expired") return <Badge variant="destructive">Vencida</Badge>;
    if (s === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `Todas (${stats.total})` },
    { value: "active", label: `Activas (${stats.active})` },
    { value: "expired", label: `Vencidas (${stats.expired})` },
    { value: "suspended", label: "Suspendidas" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold font-display">Mis Licencias</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />CSV
          </Button>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nueva Licencia</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Crear Licencia</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Negocio *</Label><Input name="business_name" required /></div>
                  <div><Label>NIT</Label><Input name="business_nit" placeholder="900.123.456-7" /></div>
                </div>
                <div><Label>Contacto *</Label><Input name="contact_name" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input name="contact_email" type="email" /></div>
                  <div><Label>Teléfono</Label><Input name="contact_phone" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Plan *</Label>
                    <select
                      name="plan_type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                      value={selectedPlan}
                      onChange={(e) => handlePlanChange(e.target.value)}
                    >
                      {LICENSE_PLANS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Precio (COP) *</Label>
                    <Input
                      name="price_paid"
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sugerido: ${LICENSE_PLANS.find((p) => p.value === selectedPlan)?.defaultPriceCOP.toLocaleString("es-CO")} COP
                    </p>
                  </div>
                </div>
                <div>
                  <Label>RUT del cliente (obligatorio) *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setRutFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">PDF o imagen del RUT para facturación electrónica</p>
                </div>
                <div><Label>Notas</Label><Textarea name="notes" rows={2} /></div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear Licencia"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-4">
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-primary/10 p-2"><KeyRound className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-whatsapp/10 p-2"><CheckCircle2 className="h-4 w-4 text-whatsapp" /></div>
          <div><p className="text-xs text-muted-foreground">Activas</p><p className="text-xl font-bold">{stats.active}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-destructive/10 p-2"><XCircle className="h-4 w-4 text-destructive" /></div>
          <div><p className="text-xs text-muted-foreground">Vencidas</p><p className="text-xl font-bold">{stats.expired}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-yellow-500/10 p-2"><AlertTriangle className="h-4 w-4 text-yellow-600" /></div>
          <div><p className="text-xs text-muted-foreground">Por vencer</p><p className="text-xl font-bold">{stats.expiringSoon}</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filterButtons.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? "default" : "outline"}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por negocio o contacto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Vence</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No hay licencias</td></tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className={`border-b hover:bg-muted/30 ${isExpired(l) ? "bg-destructive/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.business_name}</div>
                    <div className="text-xs text-muted-foreground">{l.contact_name}</div>
                  </td>
                  <td className="px-4 py-3">{planLabel(l.plan_type)}</td>
                  <td className="px-4 py-3">{statusBadge(l)}</td>
                  <td className="px-4 py-3">{l.expires_at || "—"}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => setDetailTarget(l)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailTarget} onOpenChange={() => setDetailTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de Licencia</DialogTitle></DialogHeader>
          {detailTarget && (
            <div className="space-y-3 text-sm">
              <Row label="Negocio" value={detailTarget.business_name} />
              <Row label="NIT" value={detailTarget.business_nit || "—"} />
              <Row label="Contacto" value={detailTarget.contact_name} />
              <Row label="Email" value={detailTarget.contact_email || "—"} />
              <Row label="Teléfono" value={detailTarget.contact_phone || "—"} />
              <Row label="Plan" value={planLabel(detailTarget.plan_type)} />
              <Row label="Estado" value={detailTarget.status} />
              <Row label="Inicio" value={detailTarget.start_date} />
              <Row label="Vence" value={detailTarget.expires_at || "Sin vencimiento"} />
              <Row label="Clave" value={detailTarget.license_key} mono />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{value}</span>
    </div>
  );
}
