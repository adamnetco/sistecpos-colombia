import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
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

  const copyKey = async () => {
    await navigator.clipboard.writeText(license.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabel = () => {
    if (isExpired) return <Badge variant="destructive">Vencida</Badge>;
    if (license.status === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

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
            <TabsTrigger value="pos-users">Usuarios POS</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="space-y-4 text-sm">
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
                <Field label="Vence" value={license.expires_at || "Sin vencimiento"} />
              </div>

              {license.notes && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Notas</p>
                  <p className="text-sm">{license.notes}</p>
                </div>
              )}
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
