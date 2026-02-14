import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCOP } from "@/hooks/useLicensePricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  RefreshCw,
  Save,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
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
}

export default function LicensePricingView() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Record<string, Partial<PricingRow>>>({});
  const [syncing, setSyncing] = useState(false);

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
      toast.success("Precio actualizado");
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

  const handleFieldChange = (id: string, field: string, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: Number(value) || 0 },
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
          <h1 className="text-2xl font-bold">Precios de Licencias</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona precios de venta, implementación y soporte. Los precios oficiales se sincronizan con FacilPOS.
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar con FacilPOS"}
        </Button>
      </div>

      {/* Last sync info */}
      {plans[0]?.last_synced_at && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Última sincronización: {new Date(plans[0].last_synced_at).toLocaleString("es-CO")}
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const selling = Number(getFieldValue(plan, "selling_price_cop"));
          const official = plan.official_price_cop;
          const isOverPriced = selling > official && official > 0;
          const discount = official > 0 ? Math.round(((official - selling) / official) * 100) : 0;
          const hasChanges = !!editing[plan.id] && Object.keys(editing[plan.id]).length > 0;

          return (
            <Card key={plan.id} className={isOverPriced ? "border-destructive" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.plan_label}</CardTitle>
                  {isOverPriced ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Excede oficial
                    </Badge>
                  ) : discount > 0 ? (
                    <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                      <TrendingDown className="h-3 w-3" />
                      {discount}% descuento
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{plan.plan_description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Official price (read-only) */}
                <div>
                  <Label className="text-xs text-muted-foreground">Precio Oficial FacilPOS (solo lectura)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={formatCOP(official)}
                      disabled
                      className="bg-muted"
                    />
                    {plan.facilpos_product_url && (
                      <a href={plan.facilpos_product_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Selling price */}
                <div>
                  <Label className="text-xs">Precio de Venta (COP)</Label>
                  <Input
                    type="number"
                    value={getFieldValue(plan, "selling_price_cop")}
                    onChange={(e) => handleFieldChange(plan.id, "selling_price_cop", e.target.value)}
                    className={isOverPriced ? "border-destructive" : ""}
                  />
                  {isOverPriced && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ No puedes facturar por encima del precio oficial
                    </p>
                  )}
                </div>

                {/* Implementation price */}
                <div>
                  <Label className="text-xs">Implementación (COP)</Label>
                  <Input
                    type="number"
                    value={getFieldValue(plan, "implementation_price_cop")}
                    onChange={(e) => handleFieldChange(plan.id, "implementation_price_cop", e.target.value)}
                  />
                </div>

                {/* Support price */}
                <div>
                  <Label className="text-xs">Soporte Mensual (COP)</Label>
                  <Input
                    type="number"
                    value={getFieldValue(plan, "support_monthly_cop")}
                    onChange={(e) => handleFieldChange(plan.id, "support_monthly_cop", e.target.value)}
                  />
                </div>

                {/* Monthly breakdown */}
                <div className="rounded-lg bg-primary/5 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Precio mensual para el cliente</p>
                  <p className="text-2xl font-black text-primary">
                    {formatCOP(Math.round(selling / 12))}<span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </p>
                </div>

                {/* Save button */}
                <Button
                  onClick={() => handleSave(plan)}
                  disabled={!hasChanges || updateMutation.isPending}
                  className="w-full gap-2"
                  variant={hasChanges ? "default" : "outline"}
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
