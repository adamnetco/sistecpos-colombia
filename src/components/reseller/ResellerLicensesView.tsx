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
import { Plus, Search, Eye, Download, KeyRound, AlertTriangle, CheckCircle2, XCircle, Clock, Info } from "lucide-react";
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

type StatusFilter = "all" | "active" | "expired" | "suspended" | "pending_approval";

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
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);

  // Controlled form fields to prevent state loss on mobile file picker
  const [formData, setFormData] = useState({
    business_name: "",
    business_nit: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ business_name: "", business_nit: "", contact_name: "", contact_email: "", contact_phone: "", notes: "" });
    setSelectedPlan(LICENSE_PLANS[0].value);
    setPrice(LICENSE_PLANS[0].defaultPriceCOP);
    setRutFile(null);
  };

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const plan = LICENSE_PLANS.find((p) => p.value === value);
    if (plan) setPrice(plan.defaultPriceCOP);
  };

  const load = async () => {
    if (!reseller) return;
    setLoading(true);
    const [{ data }, { data: domainRows }] = await Promise.all([
      supabase.from("licenses").select("*").eq("created_by_reseller_id", reseller.id).order("created_at", { ascending: false }),
      supabase.from("approved_email_domains").select("domain").eq("is_active", true),
    ]);
    setLicenses((data as License[]) || []);
    if (domainRows) {
      setAllowedDomains(domainRows.map((r: any) => r.domain));
    }
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
    const pending = licenses.filter(l => l.status === "pending_approval").length;
    const active = licenses.filter(l => !isExpired(l) && l.status === "active").length;
    const expired = licenses.filter(l => isExpired(l)).length;
    const expiringSoon = licenses.filter(l => isExpiringSoon(l)).length;
    return { total, pending, active, expired, expiringSoon };
  }, [licenses]);

  const getEffectiveStatus = (l: License): string => {
    if (l.status === "pending_approval") return "pending_approval";
    if (l.status === "rejected") return "rejected";
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
      filtered.map(l => ({ ...l, estado: getEffectiveStatus(l) === "expired" ? "Vencida" : getEffectiveStatus(l) === "suspended" ? "Suspendida" : getEffectiveStatus(l) === "pending_approval" ? "Pendiente" : "Activa" })),
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

  const validateDomain = (email: string | null): boolean => {
    if (!email || allowedDomains.length === 0) return true;
    const domain = email.split("@")[1]?.toLowerCase();
    return allowedDomains.some(d => d.toLowerCase() === domain);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reseller) return;
    if (!rutFile) {
      toast({ title: "Debes adjuntar el RUT del cliente", variant: "destructive" });
      return;
    }

    const contactEmail = formData.contact_email || null;

    // Validate domain
    if (contactEmail && allowedDomains.length > 0 && !validateDomain(contactEmail)) {
      toast({
        title: "Dominio de email no permitido",
        description: `Solo se permiten emails con: ${allowedDomains.map(d => "@" + d).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const fileExt = rutFile.name.split(".").pop();
      const filePath = `rut/${reseller.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("certificate-docs")
        .upload(filePath, rutFile);

      if (uploadError) {
        toast({ title: "Error al subir el RUT", description: uploadError.message, variant: "destructive" });
        return;
      }

      const planType = selectedPlan;
      let expiresAt: string | null = null;

      if (planIsAnnual(planType)) {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        expiresAt = d.toISOString().split("T")[0];
      }

      const { error } = await supabase.from("licenses").insert({
        business_name: formData.business_name,
        business_nit: formData.business_nit || null,
        contact_name: formData.contact_name,
        contact_email: contactEmail,
        contact_phone: formData.contact_phone || null,
        plan_type: planType,
        price_paid: price,
        expires_at: expiresAt,
        notes: formData.notes || null,
        created_by_reseller_id: reseller.id,
        rut_url: filePath,
        status: "pending_approval",
      });

      if (error) {
        toast({ title: "Error al crear licencia", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "✅ Licencia enviada para aprobación" });
        setShowCreate(false);
        resetForm();
        load();

        // Notify admin in background
        supabase.functions.invoke("notify-reseller-license", {
          body: {
            reseller_name: reseller.full_name,
            reseller_email: reseller.email,
            business_name: formData.business_name,
            contact_name: formData.contact_name,
            contact_email: contactEmail,
            plan_type: planType,
            price_paid: price,
          },
        }).catch(console.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (l: License) => {
    const s = getEffectiveStatus(l);
    if (s === "pending_approval") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>;
    if (s === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rechazada</Badge>;
    if (s === "expired") return <Badge variant="destructive">Vencida</Badge>;
    if (s === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `Todas (${stats.total})` },
    { value: "pending_approval", label: `Pendientes (${stats.pending})` },
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

              {/* Domain notice */}
              {allowedDomains.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-3 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Solo se permiten emails con dominio: <strong>{allowedDomains.map(d => "@" + d).join(", ")}</strong>
                  </p>
                </div>
              )}

              {/* Pending notice */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3 flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  La licencia quedará <strong>pendiente de aprobación</strong> por el administrador antes de activarse.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Negocio *</Label>
                    <Input value={formData.business_name} onChange={(e) => updateField("business_name", e.target.value)} required />
                  </div>
                  <div>
                    <Label>NIT</Label>
                    <Input value={formData.business_nit} onChange={(e) => updateField("business_nit", e.target.value)} placeholder="900.123.456-7" />
                  </div>
                </div>
                <div>
                  <Label>Contacto *</Label>
                  <Input value={formData.contact_name} onChange={(e) => updateField("contact_name", e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={(e) => updateField("contact_email", e.target.value)}
                      placeholder={allowedDomains.length > 0 ? `nombre@${allowedDomains[0]}` : ""}
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input value={formData.contact_phone} onChange={(e) => updateField("contact_phone", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Plan *</Label>
                    <select
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
                  <div className="mt-1">
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
                      <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Seleccionar archivo
                      </span>
                      <span className="truncate text-muted-foreground">
                        {rutFile ? rutFile.name : "PDF o imagen del RUT"}
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setRutFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Requerido para facturación electrónica</p>
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar para aprobación"}
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
          <div className="rounded-md bg-amber-500/10 p-2"><Clock className="h-4 w-4 text-amber-600" /></div>
          <div><p className="text-xs text-muted-foreground">Pendientes</p><p className="text-xl font-bold">{stats.pending}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 pt-5 pb-4">
          <div className="rounded-md bg-destructive/10 p-2"><XCircle className="h-4 w-4 text-destructive" /></div>
          <div><p className="text-xs text-muted-foreground">Vencidas</p><p className="text-xl font-bold">{stats.expired}</p></div>
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
                <tr key={l.id} className={`border-b hover:bg-muted/30 ${l.status === "pending_approval" ? "bg-amber-50/50 dark:bg-amber-950/10" : isExpired(l) ? "bg-destructive/5" : ""}`}>
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
              <Row label="Estado" value={
                detailTarget.status === "pending_approval" ? "⏳ Pendiente de aprobación" :
                detailTarget.status === "rejected" ? "❌ Rechazada" :
                detailTarget.status
              } />
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
