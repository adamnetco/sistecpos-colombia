import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus, ArrowRight, ArrowLeft, Building2, User, CreditCard,
  MapPin, Hash, FileText, Calendar, Loader2, CheckCircle2,
  Trash2, Copy, Store,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LICENSE_PLANS, planExpirationDate, type LicensePlan } from "@/data/licensePlans";
import { LicenseRawPasteParser, type ParsedLicense } from "./LicenseRawPasteParser";

interface Branch {
  id: string;
  branch_name: string;
  pos_location: string;
  pos_plan_type: string;
  pos_license_hash: string;
  pos_invoice_count: string;
  pos_created_at: string;
  pos_expires_at: string;
}

const emptyBranch = (name = "Sede Principal"): Branch => ({
  id: crypto.randomUUID(),
  branch_name: name,
  pos_location: "",
  pos_plan_type: "",
  pos_license_hash: "",
  pos_invoice_count: "0",
  pos_created_at: "",
  pos_expires_at: "",
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}

type Step = "business" | "plan" | "branches" | "review";
const STEPS: Step[] = ["business", "plan", "branches", "review"];
const STEP_LABELS: Record<Step, string> = {
  business: "Negocio",
  plan: "Plan",
  branches: "Sucursales",
  review: "Confirmar",
};

export function LicenseCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("business");
  const [saving, setSaving] = useState(false);

  // Business info
  const [businessName, setBusinessName] = useState("");
  const [businessNit, setBusinessNit] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Plan
  const [selectedPlan, setSelectedPlan] = useState(LICENSE_PLANS[0].value);
  const [price, setPrice] = useState(String(LICENSE_PLANS[0].defaultPriceCOP));
  const [notes, setNotes] = useState("");

  // Branches
  const [branches, setBranches] = useState<Branch[]>([emptyBranch()]);
  const [enableBranches, setEnableBranches] = useState(false);

  // Manual expiry override (admin can set ANY date, including past, or leave empty for "vitalicio")
  const [expiresAtOverride, setExpiresAtOverride] = useState<string>("");
  // Raw supplier paste (saved into provider_notes for traceability)
  const [providerRaw, setProviderRaw] = useState<string>("");

  const currentPlan = LICENSE_PLANS.find((p) => p.value === selectedPlan);
  const isMultiStore = selectedPlan.includes("multi");
  const planDefaultExpiresAt = planExpirationDate(selectedPlan);
  const expiresAt = expiresAtOverride || planDefaultExpiresAt;

  const resetForm = () => {
    setStep("business");
    setBusinessName("");
    setBusinessNit("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setSelectedPlan(LICENSE_PLANS[0].value);
    setPrice(String(LICENSE_PLANS[0].defaultPriceCOP));
    setNotes("");
    setBranches([emptyBranch()]);
    setEnableBranches(false);
    setExpiresAtOverride("");
    setProviderRaw("");
  };

  // Apply parsed supplier data: fill key fields and create/replace first branch with the POS hash
  const applyParsed = (p: ParsedLicense, raw: string) => {
    setProviderRaw(raw);
    if (p.pos_expires_at) {
      // Normalize to YYYY-MM-DD for the date input
      setExpiresAtOverride(new Date(p.pos_expires_at).toISOString().slice(0, 10));
    }
    setEnableBranches(true);
    setBranches((prev) => {
      const first: Branch = {
        ...(prev[0] || emptyBranch()),
        branch_name: prev[0]?.branch_name || "Sede Principal",
        pos_location: p.pos_location || prev[0]?.pos_location || "",
        pos_plan_type: p.pos_plan_type || prev[0]?.pos_plan_type || "",
        pos_license_hash: p.license_key || prev[0]?.pos_license_hash || "",
        pos_invoice_count: p.pos_invoice_count != null ? String(p.pos_invoice_count) : (prev[0]?.pos_invoice_count || "0"),
        pos_created_at: p.pos_created_at ? new Date(p.pos_created_at).toISOString().slice(0, 16) : (prev[0]?.pos_created_at || ""),
        pos_expires_at: p.pos_expires_at ? new Date(p.pos_expires_at).toISOString().slice(0, 16) : (prev[0]?.pos_expires_at || ""),
      };
      return [first, ...prev.slice(1)];
    });
    toast({ title: "Datos del proveedor aplicados", description: "Revisa y completa el resto antes de crear." });
  };

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    const plan = LICENSE_PLANS.find((p) => p.value === value);
    if (plan) setPrice(String(plan.defaultPriceCOP));
    if (value.includes("multi")) {
      setEnableBranches(true);
      const count = value.includes("_3") ? 3 : value.includes("_2") ? 2 : 1;
      const newBranches: Branch[] = [];
      for (let i = 0; i < count; i++) {
        newBranches.push(emptyBranch(i === 0 ? "Sede Principal" : `Sucursal ${i + 1}`));
      }
      setBranches(newBranches);
    }
  };

  const addBranch = () => {
    setBranches((prev) => [...prev, emptyBranch(`Sucursal ${prev.length + 1}`)]);
  };

  const removeBranch = (id: string) => {
    if (branches.length <= 1) return;
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBranch = useCallback((id: string, field: keyof Branch, value: string) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }, []);

  const duplicateBranch = (id: string) => {
    const source = branches.find((b) => b.id === id);
    if (!source) return;
    setBranches((prev) => [
      ...prev,
      { ...source, id: crypto.randomUUID(), branch_name: `${source.branch_name} (copia)` },
    ]);
  };

  // Validation
  const canGoToStep = (target: Step): boolean => {
    const idx = STEPS.indexOf(target);
    if (idx <= 0) return true;
    if (idx >= 1 && (!businessName.trim() || !contactName.trim())) return false;
    if (idx >= 2) {
      const p = Number(price);
      if (!Number.isFinite(p) || p <= 0) return false;
    }
    return true;
  };

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1];
      if (!canGoToStep(next)) {
        toast({ title: "Completa los campos requeridos", variant: "destructive" });
        return;
      }
      // Skip branches step if not enabled
      if (next === "branches" && !enableBranches) {
        setStep("review");
      } else {
        setStep(next);
      }
    }
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) {
      const prev = STEPS[idx - 1];
      if (prev === "branches" && !enableBranches) {
        setStep("plan");
      } else {
        setStep(prev);
      }
    }
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  const handleSubmit = async () => {
    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast({ title: "Precio inválido", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Create license
      // If supplier already provided a hash, mark the license as active immediately
      const firstHash = branches[0]?.pos_license_hash || null;
      const { data: newLicense, error } = await supabase.from("licenses").insert({
        business_name: businessName,
        business_nit: businessNit || null,
        contact_name: contactName,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        plan_type: selectedPlan,
        price_paid: priceValue,
        expires_at: expiresAt,
        notes: notes || null,
        provider_notes: providerRaw || null,
        pos_license_hash: firstHash,
        status: firstHash ? "active" : "active",
      }).select("id, license_key").single();

      if (error) throw error;

      // Create branches
      if (enableBranches && branches.length > 0) {
        const branchRows = branches.map((b, i) => ({
          license_id: newLicense.id,
          branch_name: b.branch_name || `Sede ${i + 1}`,
          pos_location: b.pos_location || null,
          pos_plan_type: b.pos_plan_type || null,
          pos_license_hash: b.pos_license_hash || null,
          pos_invoice_count: b.pos_invoice_count ? Number(b.pos_invoice_count) : 0,
          pos_created_at: b.pos_created_at ? new Date(b.pos_created_at).toISOString() : null,
          pos_expires_at: b.pos_expires_at ? new Date(b.pos_expires_at).toISOString() : null,
          sort_order: i,
        }));

        const { error: branchErr } = await supabase.from("license_branches").insert(branchRows);
        if (branchErr) console.error("Branch insert error:", branchErr);
      }

      // Send WhatsApp activation request
      try {
        await supabase.functions.invoke("send-whatsapp", {
          body: {
            event_type: "license_activation_request",
            variables: {
              business: businessName,
              nit: businessNit || "No indicado",
              plan: selectedPlan,
              name: contactName,
              phone: contactPhone || "-",
              email: contactEmail || "-",
              pos_user: "-",
              pos_store: "-",
              price: formatCOP(priceValue),
              payment_proof: "Pendiente de adjuntar",
              branches: enableBranches ? `${branches.length} sucursales` : "1 sede",
            },
            skip_rate_limit: true,
          },
        });
      } catch (_) { /* silent */ }

      toast({ title: "✅ Licencia creada exitosamente" });
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast({ title: "Error al crear licencia", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const stepIdx = STEPS.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Nueva Licencia</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" /> Crear Licencia
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => {
            if (s === "branches" && !enableBranches) return null;
            const isActive = s === step;
            const isDone = STEPS.indexOf(s) < stepIdx;
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all w-full justify-center ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isDone
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-3 w-3" /> : null}
                  <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-border shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Business */}
        {step === "business" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <p className="text-sm text-muted-foreground">Datos del negocio y contacto principal</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1"><Building2 className="h-3 w-3" /> Negocio *</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Mi Tienda S.A.S" required />
              </div>
              <div>
                <Label className="text-xs">NIT</Label>
                <Input value={businessNit} onChange={(e) => setBusinessNit(e.target.value)} placeholder="900.123.456-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1"><User className="h-3 w-3" /> Contacto *</Label>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Juan Pérez" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="juan@email.com" />
              </div>
              <div>
                <Label className="text-xs">Teléfono</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="3001234567" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === "plan" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <p className="text-sm text-muted-foreground">Selecciona el plan y configura el precio</p>

            <div>
              <Label className="text-xs flex items-center gap-1 mb-1.5"><CreditCard className="h-3 w-3" /> Plan de licencia *</Label>
              <div className="grid grid-cols-1 gap-2">
                {LICENSE_PLANS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handlePlanChange(p.value)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                      selectedPlan === p.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold">{formatCOP(p.defaultPriceCOP)}</p>
                      {p.isAnnual && (
                        <Badge variant="outline" className="text-[10px]">
                          {p.durationMonths || 12} meses
                        </Badge>
                      )}
                      {!p.isAnnual && (
                        <Badge className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">
                          Vitalicio
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Precio cobrado (COP) *</Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {currentPlan && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sugerido: {formatCOP(currentPlan.defaultPriceCOP)}
                  </p>
                )}
              </div>
              <div className="flex items-end">
                {expiresAt ? (
                  <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground w-full text-center">
                    📅 Vence: <strong>{expiresAt}</strong>
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2.5 text-xs text-amber-700 w-full text-center">
                    ♾️ Sin vencimiento
                  </div>
                )}
              </div>
            </div>

            {/* Enable branches toggle for non-multi plans */}
            {!isMultiStore && (
              <div className="rounded-lg border border-dashed p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBranches}
                    onChange={(e) => {
                      setEnableBranches(e.target.checked);
                      if (e.target.checked && branches.length === 0) {
                        setBranches([emptyBranch()]);
                      }
                    }}
                    className="rounded border-input"
                  />
                  <div>
                    <p className="text-sm font-medium">¿Tiene sucursales?</p>
                    <p className="text-xs text-muted-foreground">Activa para configurar múltiples sedes con datos POS independientes</p>
                  </div>
                </label>
              </div>
            )}

            <div>
              <Label className="text-xs">Notas internas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observaciones sobre esta licencia..." />
            </div>
          </div>
        )}

        {/* Step 3: Branches */}
        {step === "branches" && enableBranches && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Configurar sucursales</p>
                <p className="text-xs text-muted-foreground">Define los datos POS para cada sede</p>
              </div>
              <Button size="sm" variant="outline" onClick={addBranch}>
                <Plus className="h-3 w-3 mr-1" /> Agregar sede
              </Button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {branches.map((branch, i) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  index={i}
                  canRemove={branches.length > 1}
                  onUpdate={updateBranch}
                  onRemove={removeBranch}
                  onDuplicate={duplicateBranch}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <p className="text-sm text-muted-foreground">Revisa los datos antes de crear la licencia</p>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Negocio</p>
                  <p className="font-medium">{businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">NIT</p>
                  <p>{businessNit || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contacto</p>
                  <p>{contactName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{contactEmail || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p>{contactPhone || "—"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-medium">{currentPlan?.label}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="font-bold text-primary">{formatCOP(Number(price))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p>{expiresAt || "Vitalicio"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sucursales</p>
                  <p>{enableBranches ? `${branches.length} sede(s)` : "1 sede (sin detalle)"}</p>
                </div>
              </div>

              {enableBranches && branches.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Sucursales configuradas</p>
                    <div className="space-y-1.5">
                      {branches.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-2 text-xs rounded-md bg-background p-2 border">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-medium">{b.branch_name}</span>
                          {b.pos_location && <span className="text-muted-foreground">— {b.pos_location}</span>}
                          {b.pos_license_hash && <Badge variant="outline" className="text-[9px] font-mono">{b.pos_license_hash.slice(0, 8)}…</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Notas</p>
                    <p className="text-sm">{notes}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={stepIdx === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
          </Button>

          {step !== "review" ? (
            <Button onClick={goNext}>
              Siguiente <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving} className="min-w-[160px]">
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Crear Licencia</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Individual branch card component */
function BranchCard({
  branch,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  branch: Branch;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, field: keyof Branch, value: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {index + 1}
          </div>
          <Input
            value={branch.branch_name}
            onChange={(e) => onUpdate(branch.id, "branch_name", e.target.value)}
            className="h-8 text-sm font-medium border-none shadow-none px-1 focus-visible:ring-0 max-w-[200px]"
            placeholder="Nombre de la sede"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDuplicate(branch.id)} title="Duplicar">
            <Copy className="h-3 w-3" />
          </Button>
          {canRemove && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemove(branch.id)} title="Eliminar">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label className="text-[11px] flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> Ubicación POS</Label>
          <Input
            value={branch.pos_location}
            onChange={(e) => onUpdate(branch.id, "pos_location", e.target.value)}
            placeholder="Ej: PROVENZA"
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] flex items-center gap-1 text-muted-foreground"><FileText className="h-3 w-3" /> Tipo de plan</Label>
          <Input
            value={branch.pos_plan_type}
            onChange={(e) => onUpdate(branch.id, "pos_plan_type", e.target.value)}
            placeholder="Ej: Basic"
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-[11px] flex items-center gap-1 text-muted-foreground"><Hash className="h-3 w-3" /> Hash de licencia</Label>
        <Input
          value={branch.pos_license_hash}
          onChange={(e) => onUpdate(branch.id, "pos_license_hash", e.target.value)}
          placeholder="c358a12338902bec32c079148da0164a"
          className="h-8 text-xs font-mono"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <Label className="text-[11px] text-muted-foreground">Facturas emitidas</Label>
          <Input
            type="number"
            min={0}
            value={branch.pos_invoice_count}
            onChange={(e) => onUpdate(branch.id, "pos_invoice_count", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> Creación</Label>
          <Input
            type="datetime-local"
            value={branch.pos_created_at}
            onChange={(e) => onUpdate(branch.id, "pos_created_at", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-[11px] flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> Vencimiento</Label>
          <Input
            type="datetime-local"
            value={branch.pos_expires_at}
            onChange={(e) => onUpdate(branch.id, "pos_expires_at", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
