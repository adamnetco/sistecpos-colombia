import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Copy, Zap, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Coupon {
  id: string;
  code: string;
  plan_key: string;
  discount_type: string;
  discount_value: number;
  original_price_cop: number;
  discounted_price_cop: number;
  expires_at: string;
  is_active: boolean;
  used_at: string | null;
  created_at: string;
  lead_id: string | null;
}

const PLAN_KEYS = [
  { value: "emprendedor", label: "Plan Emprendedor" },
  { value: "negocio", label: "Plan Negocio" },
  { value: "empresarial", label: "Plan Empresarial" },
  { value: "vitalicia", label: "Plan Vitalicio" },
];

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

function generateCode(plan: string): string {
  const prefix = plan.toUpperCase().slice(0, 3);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${prefix}-${rand}`;
}

function CouponStatusBadge({ c }: { c: Coupon }) {
  if (c.used_at) return <Badge className="bg-muted text-muted-foreground gap-1"><CheckCircle2 className="h-3 w-3" />Usado</Badge>;
  if (!c.is_active) return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Inactivo</Badge>;
  if (new Date(c.expires_at) < new Date()) return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" />Vencido</Badge>;
  return <Badge className="bg-green-600 text-white gap-1"><Zap className="h-3 w-3" />Activo</Badge>;
}

interface CreateForm {
  code: string;
  plan_key: string;
  discount_type: string;
  discount_value: number;
  original_price_cop: number;
  hours_valid: number;
}

export default function CouponsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>({
    code: "",
    plan_key: "negocio",
    discount_type: "percentage",
    discount_value: 15,
    original_price_cop: 800000,
    hours_valid: 24,
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("discount_coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const discountedPrice = () => {
    if (form.discount_type === "percentage") {
      return Math.round(form.original_price_cop * (1 - form.discount_value / 100));
    }
    return Math.max(0, form.original_price_cop - form.discount_value);
  };

  const handleCreate = async () => {
    const code = form.code.trim() || generateCode(form.plan_key);
    const expiresAt = new Date(Date.now() + form.hours_valid * 3600 * 1000).toISOString();

    const { error } = await supabase.from("discount_coupons").insert({
      code,
      plan_key: form.plan_key,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      original_price_cop: form.original_price_cop,
      discounted_price_cop: discountedPrice(),
      expires_at: expiresAt,
      created_by: user?.id || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Cupón creado", description: `Código: ${code}` });
      setCreating(false);
      setForm({ code: "", plan_key: "negocio", discount_type: "percentage", discount_value: 15, original_price_cop: 800000, hours_valid: 24 });
      load();
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from("discount_coupons").update({ is_active }).eq("id", id);
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, is_active } : c));
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    await supabase.from("discount_coupons").delete().eq("id", id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Cupón eliminado" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado", description: code });
  };

  const copyUrl = (c: Coupon) => {
    const url = `${window.location.origin}/precios?cupon=${c.code}&plan=${c.plan_key}`;
    navigator.clipboard.writeText(url);
    toast({ title: "URL de urgencia copiada", description: "Compártela directamente con el prospecto" });
  };

  const activeCount = coupons.filter((c) => c.is_active && !c.used_at && new Date(c.expires_at) > new Date()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cupones de Descuento</h2>
          <p className="text-xs text-muted-foreground">{activeCount} activos · {coupons.length} total</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />Nuevo Cupón
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando cupones...</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <Zap className="mx-auto h-8 w-8 mb-2" />
          <p>No hay cupones. Crea el primero para generar urgencia de compra.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-left font-medium">Descuento</th>
                <th className="px-4 py-3 text-left font-medium">Precio Final</th>
                <th className="px-4 py-3 text-left font-medium">Vence</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = new Date(c.expires_at) < new Date();
                const hoursLeft = Math.max(0, Math.round((new Date(c.expires_at).getTime() - Date.now()) / 3600000));
                return (
                  <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{c.code}</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCode(c.code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{PLAN_KEYS.find((p) => p.value === c.plan_key)?.label || c.plan_key}</td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : formatCOP(c.discount_value)} OFF
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{formatCOP(c.discounted_price_cop)}</span>
                      <span className="text-xs text-muted-foreground ml-1 line-through">{formatCOP(c.original_price_cop)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(c.expires_at).toLocaleDateString("es-CO")}
                      {!expired && !c.used_at && (
                        <div className={`text-[10px] font-medium ${hoursLeft < 4 ? "text-destructive" : "text-muted-foreground"}`}>
                          {hoursLeft < 1 ? "Vence pronto" : `${hoursLeft}h restantes`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CouponStatusBadge c={c} />
                        {!c.used_at && (
                          <Switch
                            checked={c.is_active}
                            onCheckedChange={(v) => toggleActive(c.id, v)}
                            className="scale-75"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => copyUrl(c)}>
                          <Copy className="h-3 w-3" />URL
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteCoupon(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Crear Cupón de Urgencia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código (dejar vacío = auto-generado)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: CIERRE24"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                />
                <Button variant="outline" size="sm" onClick={() => setForm((p) => ({ ...p, code: generateCode(p.plan_key) }))}>
                  Auto
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plan</Label>
                <Select value={form.plan_key} onValueChange={(v) => setForm((p) => ({ ...p, plan_key: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_KEYS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de descuento</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm((p) => ({ ...p, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{form.discount_type === "percentage" ? "Descuento (%)" : "Descuento ($)"}</Label>
                <Input
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Precio original (COP)</Label>
                <Input
                  type="number"
                  value={form.original_price_cop}
                  onChange={(e) => setForm((p) => ({ ...p, original_price_cop: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label>Válido por (horas)</Label>
              <div className="flex gap-2">
                {[6, 12, 24, 48].map((h) => (
                  <Button key={h} size="sm" variant={form.hours_valid === h ? "default" : "outline"}
                    onClick={() => setForm((p) => ({ ...p, hours_valid: h }))}
                    className="flex-1 text-xs"
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs text-muted-foreground mb-1">Vista previa del descuento</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-primary">{formatCOP(discountedPrice())}</span>
                <span className="text-sm text-muted-foreground line-through">{formatCOP(form.original_price_cop)}</span>
                <Badge variant="destructive" className="ml-auto">
                  {form.discount_type === "percentage" ? `-${form.discount_value}%` : `-${formatCOP(form.discount_value)}`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ahorro: {formatCOP(form.original_price_cop - discountedPrice())} · Válido {form.hours_valid}h
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleCreate}>
                <Zap className="h-4 w-4 mr-1" />Crear Cupón
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
