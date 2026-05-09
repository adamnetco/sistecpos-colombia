import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LICENSE_PLANS, planExpirationDate } from "@/data/licensePlans";
import {
  Loader2, Building2, User, Mail, Phone, MapPin, Trophy, CreditCard,
  Upload, FileCheck, Send, CheckCircle2, Package,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  supplier_type: string;
}

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
  pos_username?: string | null;
  pos_company?: string | null;
}

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onConverted: () => void;
}

export function LeadConversionDialog({ lead, onClose, onConverted }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"payment" | "confirm">("payment");
  const [selectedPlan, setSelectedPlan] = useState(LICENSE_PLANS[0].value);
  const [price, setPrice] = useState(String(LICENSE_PLANS[0].defaultPriceCOP));
  const [nit, setNit] = useState("");
  const [notes, setNotes] = useState("");
  const [providerNotes, setProviderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  const priceValue = Number(price || "0");

  useEffect(() => {
    if (!lead) return;
    supabase.from("suppliers").select("id, name, email, supplier_type")
      .eq("supplier_type", "software").eq("status", "active").order("name")
      .then(({ data }) => {
        const list = (data || []) as Supplier[];
        setSuppliers(list);
        if (list.length > 0) setSelectedSupplierId(list[0].id);
      });
  }, [lead]);

  if (!lead) return null;

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const plan = LICENSE_PLANS.find((p) => p.value === value);
    if (plan) setPrice(String(plan.defaultPriceCOP));
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  const uploadPaymentProof = async (): Promise<string | null> => {
    if (!paymentFile) return null;
    setUploading(true);
    try {
      const ext = paymentFile.name.split(".").pop();
      const path = `${lead.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("payment-proofs").upload(path, paymentFile);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);
      return urlData.publicUrl || path;
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Error al subir comprobante", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleConvert = async () => {
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast({ title: "Ingresa un valor de pago válido", variant: "destructive" });
      return;
    }
    if (!paymentRef && !paymentFile) {
      toast({ title: "Adjunta comprobante o referencia de pago", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const proofUrl = await uploadPaymentProof();
      const expiresAt = planExpirationDate(selectedPlan);

      const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
      const { data: newLicense, error: licErr } = await supabase.from("licenses").insert({
        business_name: lead.business_name,
        business_nit: nit || null,
        contact_name: lead.contact_name,
        contact_email: lead.email,
        contact_phone: lead.phone,
        plan_type: selectedPlan,
        price_paid: priceValue,
        expires_at: expiresAt,
        lead_id: lead.id,
        created_by_reseller_id: lead.requested_by_reseller_id || null,
        notes: notes || `Convertido desde Lead/Demo. Origen: ${lead.source || "web"}`,
        provider_notes: providerNotes || null,
        payment_proof_url: proofUrl,
        activation_requested_at: new Date().toISOString(),
        status: "pending_activation",
        supplier_id: selectedSupplierId || null,
      }).select("id, license_key").single();

      if (licErr) throw licErr;

      // Create default branch for the license
      try {
        await supabase.from("license_branches").insert({
          license_id: newLicense.id,
          branch_name: "Sede Principal",
          pos_location: lead.pos_company || lead.business_name,
          sort_order: 0,
        });
      } catch (_) { /* non-critical */ }

      // Migrate POS credentials from demo to new license
      if (lead.pos_username) {
        try {
          await supabase.rpc("insert_pos_user", {
            _license_id: newLicense.id,
            _pos_username: lead.pos_username,
            _pos_store: lead.pos_company || lead.business_name,
            _pos_password: lead.pos_username, // demo password = username by default
            _pos_role: "admin",
            _user_email: lead.email || null,
            _display_name: lead.contact_name || null,
            _notes: `Migrado desde demo. Lead ID: ${lead.id}`,
            _registered_by: null,
            _user_id: null,
            _branch_id: null,
          });
          // Log migration in history
          const { data: posUsers } = await supabase
            .from("license_pos_users")
            .select("id")
            .eq("license_id", newLicense.id)
            .eq("pos_username", lead.pos_username)
            .limit(1);
          if (posUsers && posUsers.length > 0) {
            await supabase.from("pos_credential_history").insert({
              pos_user_id: posUsers[0].id,
              license_id: newLicense.id,
              action: "migrated_from_demo",
              pos_username: lead.pos_username,
              pos_store: lead.pos_company || lead.business_name,
              pos_role: "admin",
              display_name: lead.contact_name,
              notes: `Lead convertido: ${lead.business_name}`,
              source: "conversion",
            });
          }
        } catch (migErr) {
          console.warn("POS user migration failed (non-critical):", migErr);
        }
      }

      // Migrate any lead-bound POS users (from demo) to the new license
      try {
        await supabase.rpc("migrate_lead_pos_users_to_license", {
          _lead_id: lead.id,
          _license_id: newLicense.id,
        });
      } catch (mErr) {
        console.warn("Lead POS users migration failed (non-critical):", mErr);
      }

      const { error: leadUpdateError } = await supabase.from("leads_trials").update({
        status: "converted",
        converted_at: new Date().toISOString(),
      }).eq("id", lead.id);

      if (leadUpdateError) throw leadUpdateError;

      const { error: paymentError } = await supabase.from("payments").insert({
        license_id: newLicense.id,
        amount: priceValue,
        status: "confirmed",
        payment_method: paymentMethod,
        reference: paymentRef || null,
        paid_at: new Date().toISOString(),
        notes: `Pago por licencia ${selectedPlan} — Lead convertido`,
      });

      if (paymentError) throw paymentError;

      try {
        const { error: notifyError } = await supabase.functions.invoke("notify-ticket-status", {
          body: {
            type: "license_activation_request",
            business_name: lead.business_name,
            contact_name: lead.contact_name,
            contact_email: lead.email,
            contact_phone: lead.phone,
            nit: nit || "No proporcionado",
            plan_label: LICENSE_PLANS.find((p) => p.value === selectedPlan)?.label || selectedPlan,
            pos_username: lead.pos_username || "",
            pos_company: lead.pos_company || lead.business_name,
            provider_notes: providerNotes,
            license_key: newLicense.license_key,
            payment_proof_url: proofUrl,
            price_paid: formatCOP(priceValue),
            provider_email: selectedSupplier?.email || undefined,
            provider_name: selectedSupplier?.name || undefined,
          },
        });

        if (notifyError) {
          console.error("Provider email invoke failed:", notifyError);
          toast({ title: "Licencia creada, pero falló notificación", description: "Revisa configuración de correo/notificaciones.", variant: "destructive" });
        }
      } catch (emailErr) {
        console.error("Provider email failed:", emailErr);
      }

      toast({ title: "🏆 Lead convertido exitosamente", description: "Licencia creada y pago registrado." });
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
            Convertir Lead → Licencia de Pago
          </DialogTitle>
        </DialogHeader>

        {step === "payment" && (
          <div className="space-y-4">
            {/* Lead Summary */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {lead.business_name}</div>
                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {lead.contact_name}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {lead.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {lead.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {lead.city || "—"}</div>
                {lead.requested_by_reseller_id && (
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

            {/* Price, NIT & Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Precio cobrado (COP)</Label>
                <Input type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Sugerido: {formatCOP(LICENSE_PLANS.find((p) => p.value === selectedPlan)?.defaultPriceCOP || 0)}
                </p>
              </div>
              <div>
                <Label className="text-xs">NIT del negocio</Label>
                <Input value={nit} onChange={(e) => setNit(e.target.value)} placeholder="900.123.456-7" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Método de pago</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="card">Wompi (en línea)</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Referencia de pago</Label>
                <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="# transacción" />
              </div>
            </div>

            {/* Payment Proof Upload */}
            <div>
              <Label className="text-xs flex items-center gap-1 mb-1">
                <Upload className="h-3.5 w-3.5" /> Comprobante de pago
              </Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                />
                {paymentFile ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <FileCheck className="h-4 w-4" />
                    {paymentFile.name}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Clic para adjuntar imagen o PDF del comprobante</p>
                )}
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
                <div className="text-xs text-green-700 bg-green-50 dark:bg-green-950/30 rounded-lg p-2 text-center">
                  ♾️ Licencia vitalicia — sin fecha de vencimiento
                </div>
              );
            })()}

            <Button className="w-full" onClick={() => setStep("confirm")}>
              Siguiente: Datos para el proveedor <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4 space-y-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Resumen del pago
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-green-700 dark:text-green-400">
                <span>Plan: <strong>{LICENSE_PLANS.find(p => p.value === selectedPlan)?.label}</strong></span>
                <span>Monto: <strong>{formatCOP(priceValue)}</strong></span>
                <span>Método: <strong>{paymentMethod}</strong></span>
                <span>Ref: <strong>{paymentRef || "—"}</strong></span>
                {paymentFile && <span>Comprobante: <strong>✅ Adjunto</strong></span>}
              </div>
            </div>

            <Separator />

            {/* Supplier selector */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" /> Proveedor (casa de software)
              </Label>
              {suppliers.length > 0 ? (
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecciona proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.email ? `— ${s.email}` : "(sin email)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground">No hay proveedores de software registrados. Agrégalos en Proveedores.</p>
              )}
              {(() => {
                const sel = suppliers.find(s => s.id === selectedSupplierId);
                return sel?.email ? (
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Se enviará a: <strong>{sel.email}</strong>
                  </p>
                ) : sel ? (
                  <p className="mt-1 text-xs text-destructive">⚠️ Este proveedor no tiene email configurado</p>
                ) : null;
              })()}
            </div>

            <Separator />

            {/* Provider information */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Send className="h-4 w-4" /> Datos del cliente para activación
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Estos datos se enviarán por correo al proveedor seleccionado.
              </p>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm mb-3">
                <p><strong>Negocio:</strong> {lead.business_name}</p>
                <p><strong>NIT:</strong> {nit || "No proporcionado"}</p>
                <p><strong>Contacto:</strong> {lead.contact_name} — {lead.email}</p>
                <p><strong>Teléfono:</strong> {lead.phone}</p>
                {lead.pos_username && <p><strong>Usuario demo:</strong> {lead.pos_username}</p>}
                {lead.pos_company && <p><strong>Empresa demo:</strong> {lead.pos_company}</p>}
              </div>
            </div>

            {/* Provider Notes */}
            <div>
              <Label className="text-xs">Notas para el proveedor (instrucciones especiales)</Label>
              <Textarea
                value={providerNotes}
                onChange={(e) => setProviderNotes(e.target.value)}
                rows={2}
                placeholder="Ej: Migrar datos de la demo, habilitar módulo contable, etc."
              />
            </div>

            {/* Internal Notes */}
            <div>
              <Label className="text-xs">Notas internas (solo admin)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Detalles internos, comisión del socio, etc."
              />
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep("payment")}>← Atrás</Button>
              <Button
                onClick={handleConvert}
                disabled={saving || uploading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
                {saving ? "Procesando..." : "Convertir y Solicitar Activación"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
