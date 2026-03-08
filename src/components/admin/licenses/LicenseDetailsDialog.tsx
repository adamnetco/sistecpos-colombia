import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, ExternalLink, Clock, CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { planLabel } from "@/data/licensePlans";
import { LicensePOSUsersTab } from "./LicensePOSUsersTab";

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
}

export function LicenseDetailsDialog({ license, onClose }: Props) {
  const [copied, setCopied] = useState(false);

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

  const statusLabel = () => {
    if (license.status === "pending_activation") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 gap-1"><Clock className="h-3 w-3" />Pendiente Activación</Badge>;
    if (license.status === "pending_approval") return <Badge className="bg-amber-100 text-amber-800 gap-1"><Clock className="h-3 w-3" />Pendiente Aprobación</Badge>;
    if (license.status === "rejected") return <Badge variant="destructive">Rechazada</Badge>;
    if (isExpired) return <Badge variant="destructive">Vencida</Badge>;
    if (license.status === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  // Activation timeline steps
  const timelineSteps = [
    {
      label: "Lead convertido",
      done: true,
      detail: license.lead_id ? "Origen: Lead/Demo" : "Creación manual",
    },
    {
      label: "Pago registrado",
      done: license.price_paid > 0,
      detail: license.price_paid > 0 ? formatCOP(license.price_paid) : "Pendiente",
    },
    {
      label: "Solicitud al proveedor",
      done: !!license.activation_requested_at,
      detail: license.activation_requested_at
        ? new Date(license.activation_requested_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "No enviada",
    },
    {
      label: "Licencia activa",
      done: license.status === "active",
      detail: license.status === "active" ? "✅ Confirmada por proveedor" : "Pendiente activación",
    },
  ];

  return (
    <Dialog open={!!license} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {license.business_name} {statusLabel()}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="timeline">Trazabilidad</TabsTrigger>
            <TabsTrigger value="pos-users">Usuarios POS</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="space-y-4 text-sm">
              {/* Expiry warning */}
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

              <div className="grid grid-cols-2 gap-3">
                <Field label="NIT" value={license.business_nit || "—"} />
                <Field label="Plan" value={planLabel(license.plan_type)} />
                <Field label="Contacto" value={license.contact_name} />
                <Field label="Email" value={license.contact_email || "—"} />
                <Field label="Teléfono" value={license.contact_phone || "—"} />
                <Field label="Precio" value={formatCOP(license.price_paid)} />
                <Field label="Inicio" value={license.start_date} />
                <Field label="Vence" value={license.expires_at || "Sin vencimiento (Vitalicio)"} />
                {license.lead_id && (
                  <Field label="Origen" value="Convertido desde Lead/Demo" className="text-amber-600" />
                )}
                {license.created_by_reseller_id && (
                  <Field label="Socio" value="Creada por socio" className="text-amber-600" />
                )}
              </div>

              {/* Payment proof */}
              {license.payment_proof_url && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Comprobante de pago</p>
                  <a
                    href={license.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
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
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="space-y-1 py-2">
              <p className="text-xs text-muted-foreground mb-4">Flujo de activación de la licencia</p>
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.done
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground border"
                    }`}>
                      {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={`w-0.5 h-8 ${step.done ? "bg-green-300" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
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
