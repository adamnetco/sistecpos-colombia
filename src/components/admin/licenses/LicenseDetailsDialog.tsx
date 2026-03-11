import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, ExternalLink, Clock, CheckCircle2, AlertTriangle, MapPin, Hash, FileText, Calendar, Save, Loader2, MessageSquare, Pencil, X, Store } from "lucide-react";
import { planLabel, LICENSE_PLANS } from "@/data/licensePlans";
import { LicensePOSUsersTab } from "./LicensePOSUsersTab";
import { LicenseBranchesTab } from "./LicenseBranchesTab";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// --- Utility: locale-aware number formatting ---
function formatCOPInput(value: number): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);
}

function parseCOPInput(value: string): number {
  // Remove currency symbols, spaces, dots (thousand sep in es-CO)
  let str = value.replace(/[¤$\s]/g, "").trim();
  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");
  if (lastComma > lastDot) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else {
    str = str.replace(/,/g, "");
  }
  const n = parseFloat(str);
  return isNaN(n) ? 0 : Math.round(n);
}

/**
 * Parse a WhatsApp message from the software provider to extract license data.
 */
function parseWhatsAppMessage(raw: string): Partial<{
  pos_location: string;
  pos_plan_type: string;
  pos_license_hash: string;
  pos_invoice_count: string;
  pos_expires_at: string;
  pos_created_at: string;
}> {
  const result: Record<string, string> = {};
  const locMatch = raw.match(/ubicaci[oó]n[:\s]+([^\n\t]+?)(?:\s{2,}|Tipo|$)/i);
  if (locMatch) result.pos_location = locMatch[1].trim();
  const typeMatch = raw.match(/tipo[:\s]+([^\n]+)/i);
  if (typeMatch) result.pos_plan_type = typeMatch[1].trim();
  const hashMatch = raw.match(/\b([a-f0-9]{32})\b/i);
  if (hashMatch) result.pos_license_hash = hashMatch[1];
  const invMatch = raw.match(/\+?\s*(\d+)\s*facturas/i);
  if (invMatch) result.pos_invoice_count = invMatch[1];
  const dates = [...raw.matchAll(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/g)].map(m => m[1]);
  if (dates.length >= 1) result.pos_expires_at = dates[0].replace(" ", "T").slice(0, 16);
  if (dates.length >= 2) result.pos_created_at = dates[1].replace(" ", "T").slice(0, 16);
  const creacionIdx = raw.toLowerCase().indexOf("creaci");
  if (creacionIdx > -1 && dates.length === 1) {
    const dateIdx = raw.indexOf(dates[0]);
    if (Math.abs(creacionIdx - dateIdx) < 60) {
      result.pos_created_at = result.pos_expires_at;
      delete result.pos_expires_at;
    }
  }
  return result;
}

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
  lead_id?: string | null;
  created_by_reseller_id?: string | null;
  payment_proof_url?: string | null;
  activation_requested_at?: string | null;
  provider_notes?: string | null;
  pos_location?: string | null;
  pos_plan_type?: string | null;
  pos_license_hash?: string | null;
  pos_invoice_count?: number | null;
  pos_expires_at?: string | null;
  pos_created_at?: string | null;
}

interface Props {
  license: License | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export function LicenseDetailsDialog({ license, onClose, onUpdated }: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // --- Editable info fields ---
  const [editing, setEditing] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    business_name: "",
    business_nit: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    plan_type: "",
    price_paid: "",
    start_date: "",
    expires_at: "",
    notes: "",
    provider_notes: "",
  });

  const initInfoForm = () => {
    if (!license) return;
    setInfoForm({
      business_name: license.business_name || "",
      business_nit: license.business_nit || "",
      contact_name: license.contact_name || "",
      contact_email: license.contact_email || "",
      contact_phone: license.contact_phone || "",
      plan_type: license.plan_type || "",
      price_paid: formatCOPInput(license.price_paid),
      start_date: license.start_date || "",
      expires_at: license.expires_at || "",
      notes: license.notes || "",
      provider_notes: license.provider_notes || "",
    });
    setEditing(false);
  };

  useEffect(() => { initInfoForm(); }, [license?.id]);

  const saveInfoData = async () => {
    if (!license) return;
    const price = parseCOPInput(infoForm.price_paid);
    if (price <= 0) {
      toast({ title: "Precio inválido", variant: "destructive" });
      return;
    }
    setSavingInfo(true);
    const { error } = await supabase.from("licenses").update({
      business_name: infoForm.business_name,
      business_nit: infoForm.business_nit || null,
      contact_name: infoForm.contact_name,
      contact_email: infoForm.contact_email || null,
      contact_phone: infoForm.contact_phone || null,
      plan_type: infoForm.plan_type,
      price_paid: price,
      start_date: infoForm.start_date || null,
      expires_at: infoForm.expires_at || null,
      notes: infoForm.notes || null,
      provider_notes: infoForm.provider_notes || null,
    }).eq("id", license.id);
    setSavingInfo(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Licencia actualizada" });
      setEditing(false);
      onUpdated?.();
    }
  };

  // --- Provider fields state ---
  const [providerData, setProviderData] = useState({
    pos_location: "",
    pos_plan_type: "",
    pos_license_hash: "",
    pos_invoice_count: "",
    pos_expires_at: "",
    pos_created_at: "",
  });
  const [savingProvider, setSavingProvider] = useState(false);
  const [providerDirty, setProviderDirty] = useState(false);

  const initProviderData = () => {
    if (!license) return;
    setProviderData({
      pos_location: license.pos_location || "",
      pos_plan_type: license.pos_plan_type || "",
      pos_license_hash: license.pos_license_hash || "",
      pos_invoice_count: license.pos_invoice_count != null ? String(license.pos_invoice_count) : "",
      pos_expires_at: license.pos_expires_at ? license.pos_expires_at.slice(0, 16) : "",
      pos_created_at: license.pos_created_at ? license.pos_created_at.slice(0, 16) : "",
    });
    setProviderDirty(false);
  };

  useEffect(() => { initProviderData(); }, [license?.id]);

  const updateProviderField = (key: string, value: string) => {
    setProviderData(prev => ({ ...prev, [key]: value }));
    setProviderDirty(true);
  };

  const saveProviderData = async () => {
    if (!license) return;
    setSavingProvider(true);
    const { error } = await supabase.from("licenses").update({
      pos_location: providerData.pos_location || null,
      pos_plan_type: providerData.pos_plan_type || null,
      pos_license_hash: providerData.pos_license_hash || null,
      pos_invoice_count: providerData.pos_invoice_count ? Number(providerData.pos_invoice_count) : null,
      pos_expires_at: providerData.pos_expires_at ? new Date(providerData.pos_expires_at).toISOString() : null,
      pos_created_at: providerData.pos_created_at ? new Date(providerData.pos_created_at).toISOString() : null,
    } as any).eq("id", license.id);
    setSavingProvider(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Datos del proveedor actualizados" });
      setProviderDirty(false);
      onUpdated?.();
    }
  };

  if (!license) return null;

  const today = new Date().toISOString().split("T")[0];
  const isExpired = license.expires_at && license.expires_at < today;
  const daysLeft = license.expires_at
    ? Math.ceil((new Date(license.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const copyKey = async () => {
    await navigator.clipboard.writeText(license.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  const statusLabel = () => {
    if (license.status === "pending_activation") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 gap-1"><Clock className="h-3 w-3" />Pendiente Activación</Badge>;
    if (license.status === "pending_approval") return <Badge className="bg-amber-100 text-amber-800 gap-1"><Clock className="h-3 w-3" />Pendiente Aprobación</Badge>;
    if (license.status === "rejected") return <Badge variant="destructive">Rechazada</Badge>;
    if (isExpired) return <Badge variant="destructive">Vencida</Badge>;
    if (license.status === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  const timelineSteps = [
    { label: "Lead convertido", done: true, detail: license.lead_id ? "Origen: Lead/Demo" : "Creación manual" },
    { label: "Pago registrado", done: license.price_paid > 0, detail: license.price_paid > 0 ? formatCOP(license.price_paid) : "Pendiente" },
    { label: "Solicitud al proveedor", done: !!license.activation_requested_at, detail: license.activation_requested_at ? new Date(license.activation_requested_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "No enviada" },
    { label: "Licencia activa", done: license.status === "active", detail: license.status === "active" ? "✅ Confirmada por proveedor" : "Pendiente activación" },
  ];

  return (
    <Dialog open={!!license} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {license.business_name} {statusLabel()}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2" onValueChange={(v) => { if (v === "provider") initProviderData(); }}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="branches" className="gap-1"><Store className="h-3 w-3" /> Sedes</TabsTrigger>
            <TabsTrigger value="provider" className="gap-1"><MapPin className="h-3 w-3" /> Proveedor</TabsTrigger>
            <TabsTrigger value="timeline">Trazabilidad</TabsTrigger>
            <TabsTrigger value="pos-users">Usuarios POS</TabsTrigger>
          </TabsList>

          {/* ====== INFO TAB — with inline editing ====== */}
          <TabsContent value="info">
            <div className="space-y-4 text-sm">
              {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                <div className="rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/30 p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    ⚠️ Vence en <strong>{daysLeft} días</strong> — considera contactar al cliente para renovación.
                  </p>
                </div>
              )}

              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Clave de Licencia</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all font-mono text-xs">{license.license_key}</code>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={copyKey}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Edit toggle */}
              <div className="flex justify-end">
                {!editing ? (
                  <Button size="sm" variant="outline" onClick={() => { initInfoForm(); setEditing(true); }}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      <X className="h-3 w-3 mr-1" /> Cancelar
                    </Button>
                    <Button size="sm" onClick={saveInfoData} disabled={savingInfo}>
                      {savingInfo ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Negocio</Label>
                      <Input value={infoForm.business_name} onChange={(e) => setInfoForm(p => ({ ...p, business_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">NIT</Label>
                      <Input value={infoForm.business_nit} onChange={(e) => setInfoForm(p => ({ ...p, business_nit: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Contacto</Label>
                      <Input value={infoForm.contact_name} onChange={(e) => setInfoForm(p => ({ ...p, contact_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input value={infoForm.contact_email} onChange={(e) => setInfoForm(p => ({ ...p, contact_email: e.target.value }))} type="email" />
                    </div>
                    <div>
                      <Label className="text-xs">Teléfono</Label>
                      <Input value={infoForm.contact_phone} onChange={(e) => setInfoForm(p => ({ ...p, contact_phone: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Plan</Label>
                      <select
                        value={infoForm.plan_type}
                        onChange={(e) => setInfoForm(p => ({ ...p, plan_type: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {LICENSE_PLANS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                        {/* legacy fallbacks */}
                        {!LICENSE_PLANS.find(p => p.value === infoForm.plan_type) && (
                          <option value={infoForm.plan_type}>{planLabel(infoForm.plan_type)}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Precio pagado (COP)</Label>
                      <Input
                        value={infoForm.price_paid}
                        onChange={(e) => setInfoForm(p => ({ ...p, price_paid: e.target.value }))}
                        onBlur={() => {
                          const n = parseCOPInput(infoForm.price_paid);
                          if (n > 0) setInfoForm(p => ({ ...p, price_paid: formatCOPInput(n) }));
                        }}
                        placeholder="2.500.000"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fecha inicio</Label>
                      <Input type="date" value={infoForm.start_date} onChange={(e) => setInfoForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Fecha vencimiento</Label>
                      <Input type="date" value={infoForm.expires_at} onChange={(e) => setInfoForm(p => ({ ...p, expires_at: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Notas para proveedor</Label>
                    <Textarea rows={2} value={infoForm.provider_notes} onChange={(e) => setInfoForm(p => ({ ...p, provider_notes: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Notas internas</Label>
                    <Textarea rows={2} value={infoForm.notes} onChange={(e) => setInfoForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="NIT" value={license.business_nit || "—"} />
                    <Field label="Plan" value={planLabel(license.plan_type)} />
                    <Field label="Contacto" value={license.contact_name} />
                    <Field label="Email" value={license.contact_email || "—"} />
                    <Field label="Teléfono" value={license.contact_phone || "—"} />
                    <Field label="Precio" value={formatCOP(license.price_paid)} />
                    <Field label="Inicio" value={license.start_date} />
                    <Field label="Vence" value={license.expires_at || "Sin vencimiento (Vitalicio)"} />
                    {license.lead_id && <Field label="Origen" value="Convertido desde Lead/Demo" className="text-amber-600" />}
                    {license.created_by_reseller_id && <Field label="Socio" value="Creada por socio" className="text-amber-600" />}
                  </div>

                  {(license.pos_location || license.pos_plan_type || license.pos_license_hash) && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Datos del proveedor
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-blue-700 dark:text-blue-400">
                        {license.pos_location && <span>📍 {license.pos_location}</span>}
                        {license.pos_plan_type && <span>📋 {license.pos_plan_type}</span>}
                        {license.pos_license_hash && <span className="col-span-2 font-mono">🔑 {license.pos_license_hash}</span>}
                        {license.pos_invoice_count != null && <span>🧾 {license.pos_invoice_count} facturas</span>}
                        {license.pos_expires_at && <span>📅 Vence: {new Date(license.pos_expires_at).toLocaleDateString("es-CO")}</span>}
                      </div>
                    </div>
                  )}

                  {license.payment_proof_url && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Comprobante de pago</p>
                      <a href={license.payment_proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Ver comprobante
                      </a>
                    </div>
                  )}

                  {license.provider_notes && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Notas para proveedor</p>
                      <p className="text-sm bg-muted/50 rounded p-2">{license.provider_notes}</p>
                    </div>
                  )}

                  {license.notes && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Notas internas</p>
                      <p className="text-sm">{license.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ====== BRANCHES TAB ====== */}
          <TabsContent value="branches">
            <LicenseBranchesTab licenseId={license.id} businessName={license.business_name} />
          </TabsContent>

          {/* ====== PROVIDER TAB ====== */}
          <TabsContent value="provider">
            <div className="space-y-4 py-2">
              <WhatsAppParserSection onParsed={(parsed) => {
                setProviderData(prev => ({ ...prev, ...parsed }));
                setProviderDirty(true);
              }} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> Ubicación POS</Label>
                  <Input value={providerData.pos_location} onChange={(e) => updateProviderField("pos_location", e.target.value)} placeholder="Ej: PROVENZA" />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1"><FileText className="h-3 w-3" /> Tipo de plan (proveedor)</Label>
                  <Input value={providerData.pos_plan_type} onChange={(e) => updateProviderField("pos_plan_type", e.target.value)} placeholder="Ej: Basic" />
                </div>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1"><Hash className="h-3 w-3" /> Hash de licencia (proveedor)</Label>
                <Input value={providerData.pos_license_hash} onChange={(e) => updateProviderField("pos_license_hash", e.target.value)} placeholder="Ej: c358a12338902bec32c079148da0164a" className="font-mono text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs flex items-center gap-1">🧾 Facturas emitidas</Label>
                  <Input type="number" min={0} value={providerData.pos_invoice_count} onChange={(e) => updateProviderField("pos_invoice_count", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Fecha creación (proveedor)</Label>
                  <Input type="datetime-local" value={providerData.pos_created_at} onChange={(e) => updateProviderField("pos_created_at", e.target.value)} />
                </div>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Fecha vencimiento (proveedor)</Label>
                <Input type="datetime-local" value={providerData.pos_expires_at} onChange={(e) => updateProviderField("pos_expires_at", e.target.value)} />
                {providerData.pos_expires_at && (() => {
                  const d = Math.ceil((new Date(providerData.pos_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return d > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">⏳ Faltan {d} días</p>
                  ) : (
                    <p className="mt-1 text-xs text-destructive">⚠️ Vencida hace {Math.abs(d)} días</p>
                  );
                })()}
              </div>

              <Button onClick={saveProviderData} disabled={!providerDirty || savingProvider} className="w-full">
                {savingProvider ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {savingProvider ? "Guardando..." : "Guardar datos del proveedor"}
              </Button>
            </div>
          </TabsContent>

          {/* ====== TIMELINE TAB ====== */}
          <TabsContent value="timeline">
            <div className="space-y-1 py-2">
              <p className="text-xs text-muted-foreground mb-4">Flujo de activación de la licencia</p>
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground border"}`}>
                      {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < timelineSteps.length - 1 && <div className={`w-0.5 h-8 ${step.done ? "bg-green-300" : "bg-border"}`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pos-users">
            <LicensePOSUsersTab licenseId={license.id} businessName={license.business_name} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={className}>{value}</p>
    </div>
  );
}

function WhatsAppParserSection({ onParsed }: { onParsed: (data: Record<string, string>) => void }) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<Record<string, string> | null>(null);

  const handleParse = () => {
    const result = parseWhatsAppMessage(raw);
    setParsed(result as Record<string, string>);
  };

  const handleApply = () => {
    if (parsed) {
      onParsed(parsed);
      setRaw("");
      setParsed(null);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
      <Label className="text-xs font-semibold flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5" /> Pegar mensaje de WhatsApp del proveedor
      </Label>
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={4}
        placeholder={`Pega aquí el mensaje tal como lo recibiste, ej:\n\nUbicación: PROVENZA  Tipo: Basic\nc358a12338902bec32c079148da0164a\n+ 0 facturas  2027-03-22 23:53:39`}
        className="text-xs font-mono"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleParse} disabled={!raw.trim()}>
          🔍 Analizar mensaje
        </Button>
        {parsed && Object.keys(parsed).length > 0 && (
          <Button size="sm" onClick={handleApply}>
            ✅ Aplicar datos ({Object.keys(parsed).length} campos)
          </Button>
        )}
      </div>
      {parsed && (
        <div className="rounded border bg-background p-2 text-xs space-y-1">
          {Object.keys(parsed).length === 0 ? (
            <p className="text-muted-foreground">No se pudieron extraer datos del mensaje. Verifica el formato.</p>
          ) : (
            Object.entries(parsed).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k.replace("pos_", "").replace(/_/g, " ")}:</span>
                <span className="font-medium">{v}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
