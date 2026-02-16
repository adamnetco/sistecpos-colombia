import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LICENSE_PLANS, planExpirationDate } from "@/data/licensePlans";
import {
  Loader2, Building2, User, Mail, Phone, MapPin, Trophy, CreditCard,
} from "lucide-react";

interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string | null;
  business_type: string | null;
  source: string | null;
  requested_by_reseller_id?: string | null;
}

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onConverted: () => void;
}

export function LeadConversionDialog({ lead, onClose, onConverted }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(LICENSE_PLANS[0].value);
  const [price, setPrice] = useState(LICENSE_PLANS[0].defaultPriceCOP);
  const [nit, setNit] = useState("");
  const [notes, setNotes] = useState("");

  if (!lead) return null;

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const plan = LICENSE_PLANS.find((p) => p.value === value);
    if (plan) setPrice(plan.defaultPriceCOP);
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  const handleConvert = async () => {
    setSaving(true);
    try {
      const expiresAt = planExpirationDate(selectedPlan);

      // 1. Create license linked to lead
      const { data: newLicense, error: licErr } = await supabase.from("licenses").insert({
        business_name: lead.business_name,
        business_nit: nit || null,
        contact_name: lead.contact_name,
        contact_email: lead.email,
        contact_phone: lead.phone,
        plan_type: selectedPlan,
        price_paid: price,
        expires_at: expiresAt,
        lead_id: lead.id,
        created_by_reseller_id: (lead as any).requested_by_reseller_id || null,
        notes: notes || `Convertido desde Lead/Demo. Origen: ${lead.source || "web"}`,
        status: "active",
      }).select("id").single();

      if (licErr) throw licErr;

      // 2. Update lead status to converted
      await supabase.from("leads_trials").update({
        status: "converted",
        converted_at: new Date().toISOString(),
      }).eq("id", lead.id);

      // 3. Register payment record
      await supabase.from("payments").insert({
        license_id: newLicense.id,
        amount: price,
        status: "confirmed",
        payment_method: "manual",
        paid_at: new Date().toISOString(),
        notes: `Pago por licencia ${selectedPlan} — Lead convertido`,
      });

      toast({ title: "🏆 Lead convertido exitosamente", description: `Licencia creada para ${lead.business_name}` });
      onConverted();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error al convertir", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Convertir Lead a Licencia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lead Summary */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {lead.business_name}</div>
              <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {lead.contact_name}</div>
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {lead.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {lead.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {lead.city || "—"}</div>
              {(lead as any).requested_by_reseller_id && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 w-fit">🤝 Vía Socio</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Plan Selection */}
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4" /> Plan de Licencia
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedPlan}
              onChange={(e) => handlePlanChange(e.target.value)}
            >
              {LICENSE_PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} — {p.description}
                </option>
              ))}
            </select>
          </div>

          {/* Price & NIT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Precio pagado (COP)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Sugerido: {formatCOP(LICENSE_PLANS.find((p) => p.value === selectedPlan)?.defaultPriceCOP || 0)}
              </p>
            </div>
            <div>
              <Label className="text-xs">NIT del negocio</Label>
              <Input
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="900.123.456-7"
              />
            </div>
          </div>

          {/* Expiration preview */}
          {(() => {
            const exp = planExpirationDate(selectedPlan);
            return exp ? (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 text-center">
                📅 Vencimiento estimado: <strong>{exp}</strong>
              </div>
            ) : (
              <div className="text-xs text-green-700 bg-green-50 rounded-lg p-2 text-center">
                ♾️ Licencia vitalicia — sin fecha de vencimiento
              </div>
            );
          })()}

          {/* Notes */}
          <div>
            <Label className="text-xs">Notas internas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Detalles del pago, observaciones..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleConvert}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
            {saving ? "Creando licencia..." : "Convertir y Crear Licencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
