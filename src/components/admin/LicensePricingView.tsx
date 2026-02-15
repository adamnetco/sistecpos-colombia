import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCOP, monthlyPrice } from "@/hooks/useLicensePricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  RefreshCw,
  Save,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
  ImagePlus,
  Trash2,
  Eye,
  Pencil,
  DollarSign,
  Wrench,
  Headphones,
  Package,
} from "lucide-react";

interface PricingRow {
  id: string;
  plan_key: string;
  plan_label: string;
  plan_description: string | null;
  official_price_cop: number;
  selling_price_cop: number;
  implementation_price_cop: number;
  support_monthly_cop: number;
  facilpos_product_url: string | null;
  last_synced_at: string | null;
  sort_order: number;
  image_url: string | null;
}

export default function LicensePricingView() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Record<string, Partial<PricingRow>>>({});
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin_license_pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("license_pricing")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as PricingRow[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PricingRow> }) => {
      const { error } = await supabase
        .from("license_pricing")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_license_pricing"] });
      queryClient.invalidateQueries({ queryKey: ["license_pricing"] });
      toast.success("Plan actualizado correctamente");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await supabase.functions.invoke("sync-facilpos-prices");
      if (res.error) throw res.error;
      const body = res.data;
      queryClient.invalidateQueries({ queryKey: ["admin_license_pricing"] });
      queryClient.invalidateQueries({ queryKey: ["license_pricing"] });
      toast.success(`Sincronización completada: ${body.synced}/${body.total_plans} planes actualizados`);
      if (body.warnings?.length) {
        body.warnings.forEach((w: string) => toast.warning(w));
      }
    } catch (err: any) {
      toast.error("Error sincronizando: " + (err.message || "Error desconocido"));
    } finally {
      setSyncing(false);
    }
  };

  const handleFieldChange = (id: string, field: string, value: string | number) => {
    const numericFields = ["selling_price_cop", "implementation_price_cop", "support_monthly_cop", "sort_order"];
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: numericFields.includes(field) ? (Number(value) || 0) : value,
      },
    }));
  };

  const handleSave = (plan: PricingRow) => {
    const updates = editing[plan.id];
    if (!updates || Object.keys(updates).length === 0) return;
    updateMutation.mutate({ id: plan.id, updates });
    setEditing((prev) => {
      const next = { ...prev };
      delete next[plan.id];
      return next;
    });
  };

  const getFieldValue = (plan: PricingRow, field: keyof PricingRow) => {
    return editing[plan.id]?.[field] ?? plan[field];
  };

  const handleImageUpload = async (plan: PricingRow, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }

    setUploading(plan.id);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${plan.plan_key}-${Date.now()}.${ext}`;

      if (plan.image_url) {
        const oldPath = plan.image_url.split("/license-images/")[1];
        if (oldPath) {
          await supabase.storage.from("license-images").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("license-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("license-images")
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("license_pricing")
        .update({ image_url: urlData.publicUrl })
        .eq("id", plan.id);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["admin_license_pricing"] });
      queryClient.invalidateQueries({ queryKey: ["license_pricing"] });
      toast.success("Imagen actualizada");
    } catch (err: any) {
      toast.error("Error subiendo imagen: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleImageRemove = async (plan: PricingRow) => {
    if (!plan.image_url) return;
    try {
      const oldPath = plan.image_url.split("/license-images/")[1];
      if (oldPath) {
        await supabase.storage.from("license-images").remove([oldPath]);
      }
      await supabase.from("license_pricing").update({ image_url: null }).eq("id", plan.id);
      queryClient.invalidateQueries({ queryKey: ["admin_license_pricing"] });
      queryClient.invalidateQueries({ queryKey: ["license_pricing"] });
      toast.success("Imagen eliminada");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestor de Planes</h1>
          <p className="text-sm text-muted-foreground">
            Edita nombres, descripciones, precios e imágenes de cada plan. Los precios oficiales se sincronizan automáticamente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/comparativa-licencias#planes" target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-1.5" />
              Ver en sitio
            </a>
          </Button>
          <Button onClick={handleSync} disabled={syncing} size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar TRM"}
          </Button>
        </div>
      </div>

      {/* Last sync info */}
      {plans[0]?.last_synced_at && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-muted/50 border px-3 py-2">
          <Clock className="h-3.5 w-3.5" />
          Última sincronización: {new Date(plans[0].last_synced_at).toLocaleString("es-CO")}
          <span className="text-muted-foreground/60 ml-1">· Los precios oficiales (USD→COP) se actualizan con la TRM del día</span>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const selling = Number(getFieldValue(plan, "selling_price_cop"));
          const implementation = Number(getFieldValue(plan, "implementation_price_cop"));
          const support = Number(getFieldValue(plan, "support_monthly_cop"));
          const official = plan.official_price_cop;
          const isOverPriced = selling > official && official > 0;
          const discount = official > 0 ? Math.round(((official - selling) / official) * 100) : 0;
          const hasChanges = !!editing[plan.id] && Object.keys(editing[plan.id]).length > 0;
          const totalAnual = selling + implementation;

          return (
            <Card key={plan.id} className={`transition-all ${isOverPriced ? "border-destructive" : ""} ${hasChanges ? "ring-2 ring-primary/30" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.plan_label}</CardTitle>
                  {isOverPriced ? (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Excede oficial
                    </Badge>
                  ) : discount > 0 ? (
                    <Badge className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
                      <TrendingDown className="h-3 w-3" />
                      {discount}% desc.
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="info" className="text-xs gap-1">
                      <Pencil className="h-3 w-3" /> Info
                    </TabsTrigger>
                    <TabsTrigger value="precios" className="text-xs gap-1">
                      <DollarSign className="h-3 w-3" /> Precios
                    </TabsTrigger>
                    <TabsTrigger value="imagen" className="text-xs gap-1">
                      <ImagePlus className="h-3 w-3" /> Imagen
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Info */}
                  <TabsContent value="info" className="space-y-3 mt-3">
                    <div>
                      <Label className="text-xs">Nombre del Plan</Label>
                      <Input
                        value={getFieldValue(plan, "plan_label") as string}
                        onChange={(e) => handleFieldChange(plan.id, "plan_label", e.target.value)}
                        placeholder="Ej: Plan Emprendedor"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Textarea
                        value={(getFieldValue(plan, "plan_description") as string) || ""}
                        onChange={(e) => handleFieldChange(plan.id, "plan_description", e.target.value)}
                        placeholder="Descripción corta del plan..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Orden</Label>
                      <Input
                        type="number"
                        value={getFieldValue(plan, "sort_order") as number}
                        onChange={(e) => handleFieldChange(plan.id, "sort_order", e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Precios */}
                  <TabsContent value="precios" className="space-y-3 mt-3">
                    {/* Official price (read-only) */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Precio Oficial SoftwarePOS (lectura)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={formatCOP(official)} disabled className="bg-muted text-xs" />
                        {plan.facilpos_product_url && (
                          <a href={plan.facilpos_product_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1.5">
                        <Package className="h-3 w-3" /> Precio Venta Licencia (COP/año)
                      </Label>
                      <Input
                        type="number"
                        value={getFieldValue(plan, "selling_price_cop")}
                        onChange={(e) => handleFieldChange(plan.id, "selling_price_cop", e.target.value)}
                        className={isOverPriced ? "border-destructive" : ""}
                      />
                      {isOverPriced && (
                        <p className="text-xs text-destructive mt-1">⚠️ No puede exceder el precio oficial</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1.5">
                        <Wrench className="h-3 w-3" /> Puesta en Marcha (COP, única vez)
                      </Label>
                      <Input
                        type="number"
                        value={getFieldValue(plan, "implementation_price_cop")}
                        onChange={(e) => handleFieldChange(plan.id, "implementation_price_cop", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1.5">
                        <Headphones className="h-3 w-3" /> Soporte Mensual (COP/mes)
                      </Label>
                      <Input
                        type="number"
                        value={getFieldValue(plan, "support_monthly_cop")}
                        onChange={(e) => handleFieldChange(plan.id, "support_monthly_cop", e.target.value)}
                      />
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vista previa del cliente</p>
                      <div className="text-center">
                        <p className="text-2xl font-black text-primary">{formatCOP(totalAnual)}<span className="text-xs font-normal text-muted-foreground">/año</span></p>
                        <p className="text-xs text-muted-foreground">
                          ≈ {formatCOP(monthlyPrice(totalAnual))}/mes · Licencia {formatCOP(selling)} + Onboarding {formatCOP(implementation)}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab: Imagen */}
                  <TabsContent value="imagen" className="space-y-3 mt-3">
                    <div className="flex flex-col items-center gap-3">
                      {plan.image_url ? (
                        <img
                          src={plan.image_url}
                          alt={plan.plan_label}
                          className="h-28 w-auto object-contain rounded-lg border bg-muted/30 p-2"
                        />
                      ) : (
                        <div className="h-28 w-24 rounded-lg border border-dashed flex items-center justify-center bg-muted/20">
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <input
                        ref={(el) => { fileInputRefs.current[plan.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(plan, file);
                          e.target.value = "";
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          disabled={uploading === plan.id}
                          onClick={() => fileInputRefs.current[plan.id]?.click()}
                        >
                          <ImagePlus className="h-3 w-3" />
                          {uploading === plan.id ? "Subiendo..." : plan.image_url ? "Cambiar" : "Subir imagen"}
                        </Button>
                        {plan.image_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleImageRemove(plan)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Quitar
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">
                        Recomendado: PNG transparente, 400×400px mínimo. Max 5MB.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Save button */}
                <Button
                  onClick={() => handleSave(plan)}
                  disabled={!hasChanges || updateMutation.isPending}
                  className="w-full gap-2"
                  variant={hasChanges ? "default" : "outline"}
                  size="sm"
                >
                  {hasChanges ? <Save className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {hasChanges ? "Guardar cambios" : "Sin cambios"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
