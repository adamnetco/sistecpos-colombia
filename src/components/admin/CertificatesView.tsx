import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Settings2,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";

interface CertOrder {
  id: string;
  full_name: string;
  nit: string;
  email: string;
  phone: string;
  plan: string;
  price_cop: number;
  status: string;
  created_at: string;
  rut_url: string;
  camara_comercio_url: string;
  cedula_url: string;
  soporte_pago_url: string | null;
  notes: string | null;
}

const kanbanColumns = [
  { key: "pending", title: "Pendiente", color: "border-yellow-400" },
  { key: "processing", title: "En Proceso", color: "border-primary" },
  { key: "completed", title: "Completado", color: "border-whatsapp" },
];

const docLabels: Record<string, string> = {
  rut_url: "RUT",
  camara_comercio_url: "Cámara de Comercio",
  cedula_url: "Cédula Rep. Legal",
  soporte_pago_url: "Soporte de Pago",
};

export default function CertificatesView() {
  const [orders, setOrders] = useState<CertOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CertOrder | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [retentionDays, setRetentionDays] = useState("30");
  const [savingRetention, setSavingRetention] = useState(false);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("certificate_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as CertOrder[]) || []);
    setLoading(false);
  };

  const loadRetention = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "doc_retention_days")
      .single();
    if (data) setRetentionDays(data.value);
  };

  useEffect(() => {
    load();
    loadRetention();
  }, []);

  const moveStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("certificate_orders")
      .update({ status })
      .eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else {
      load();
      if (selected?.id === id) setSelected((p) => (p ? { ...p, status } : null));
    }
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    if (!path) return null;
    const { data, error } = await supabase.storage
      .from("certificate-docs")
      .createSignedUrl(path, 300); // 5 min
    if (error) {
      toast({ title: "Error generando enlace", variant: "destructive" });
      return null;
    }
    return data.signedUrl;
  };

  const handleDownload = async (path: string, label: string) => {
    const url = await getSignedUrl(path);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label}-${Date.now()}`;
      a.target = "_blank";
      a.click();
    }
  };

  const handleView = async (path: string) => {
    const url = await getSignedUrl(path);
    if (url) window.open(url, "_blank");
  };

  const handleDeleteDoc = async (orderId: string, field: string, path: string) => {
    if (!confirm(`¿Eliminar ${docLabels[field]}? Esta acción no se puede deshacer.`)) return;

    // Delete from storage
    await supabase.storage.from("certificate-docs").remove([path]);

    // Clear URL in DB
    await supabase
      .from("certificate_orders")
      .update({ [field]: field === "soporte_pago_url" ? null : "" })
      .eq("id", orderId);

    toast({ title: `${docLabels[field]} eliminado` });
    load();
    if (selected?.id === orderId) {
      setSelected((p) =>
        p ? { ...p, [field]: field === "soporte_pago_url" ? null : "" } : null
      );
    }
  };

  const handleDeleteAllDocs = async (order: CertOrder) => {
    if (!confirm(`¿Eliminar TODOS los documentos de ${order.full_name}? Esta acción no se puede deshacer.`)) return;

    const paths = [order.rut_url, order.camara_comercio_url, order.cedula_url, order.soporte_pago_url].filter(
      (p): p is string => !!p && p.length > 0
    );

    if (paths.length > 0) {
      await supabase.storage.from("certificate-docs").remove(paths);
    }

    await supabase
      .from("certificate_orders")
      .update({
        rut_url: "",
        camara_comercio_url: "",
        cedula_url: "",
        soporte_pago_url: null,
        notes: `Documentos eliminados manualmente el ${new Date().toLocaleDateString("es-CO")}`,
      })
      .eq("id", order.id);

    toast({ title: "Todos los documentos eliminados" });
    load();
    setSelected(null);
  };

  const saveRetention = async () => {
    setSavingRetention(true);
    await supabase
      .from("app_settings")
      .update({ value: retentionDays, updated_at: new Date().toISOString() })
      .eq("key", "doc_retention_days");
    setSavingRetention(false);
    toast({ title: `Retención actualizada a ${retentionDays} días` });
  };

  const runCleanupNow = async () => {
    if (!confirm("¿Ejecutar limpieza ahora? Se eliminarán documentos más antiguos que el período de retención.")) return;
    setRunningCleanup(true);
    const { data, error } = await supabase.functions.invoke("cleanup-expired-docs");
    setRunningCleanup(false);
    if (error) {
      toast({ title: "Error al ejecutar limpieza", variant: "destructive" });
    } else {
      toast({
        title: "Limpieza completada",
        description: `${data?.ordersProcessed || 0} órdenes procesadas, ${data?.filesDeleted || 0} archivos eliminados`,
      });
      load();
    }
  };

  const getByStatus = (status: string) => orders.filter((o) => o.status === status);

  const hasDocuments = (order: CertOrder) =>
    !!(order.rut_url || order.camara_comercio_url || order.cedula_url || order.soporte_pago_url);

  const getDaysOld = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Órdenes de Certificados</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => exportToCsv(orders as any[], [
            { key: "full_name", label: "Nombre" },
            { key: "nit", label: "NIT" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Teléfono" },
            { key: "plan", label: "Plan" },
            { key: "price_cop", label: "Precio COP" },
            { key: "status", label: "Estado" },
            { key: "created_at", label: "Fecha" },
          ], "certificados")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> Retención de Docs
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {kanbanColumns.map((col) => (
            <div key={col.key} className="space-y-3">
              <h2 className={`text-sm font-semibold border-b-2 ${col.color} pb-2`}>
                {col.title} ({getByStatus(col.key).length})
              </h2>
              {getByStatus(col.key).map((o) => {
                const daysOld = getDaysOld(o.created_at);
                const nearExpiry = daysOld >= parseInt(retentionDays) - 7;
                return (
                  <Card
                    key={o.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelected(o)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="font-medium text-sm">{o.full_name}</div>
                      <div className="text-xs text-muted-foreground">NIT: {o.nit}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {o.plan === "2_years" ? "2 Años" : "1 Año"}
                        </Badge>
                        <span className="text-xs font-bold">
                          ${o.price_cop.toLocaleString("es-CO")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1">
                          {hasDocuments(o) ? (
                            <Badge variant="secondary" className="text-[10px]">
                              <FileText className="h-3 w-3 mr-0.5" /> Docs
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Sin docs
                            </Badge>
                          )}
                          {nearExpiry && hasDocuments(o) && (
                            <Badge variant="destructive" className="text-[10px]">
                              <Clock className="h-3 w-3 mr-0.5" /> {daysOld}d
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 pt-1">
                        {col.key !== "pending" && (
                          <button
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStatus(o.id, col.key === "completed" ? "processing" : "pending");
                            }}
                          >
                            ← Atrás
                          </button>
                        )}
                        {col.key !== "completed" && (
                          <button
                            className="ml-auto text-xs text-primary hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStatus(o.id, col.key === "pending" ? "processing" : "completed");
                            }}
                          >
                            Avanzar →
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {getByStatus(col.key).length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  Sin órdenes
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order detail dialog with document management */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selected.full_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">NIT:</span> {selected.nit}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan:</span>{" "}
                    {selected.plan === "2_years" ? "2 Años" : "1 Año"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span> {selected.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">WhatsApp:</span> {selected.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Precio:</span> $
                    {selected.price_cop.toLocaleString("es-CO")} COP
                  </div>
                  <div>
                    <span className="text-muted-foreground">Creado:</span>{" "}
                    {new Date(selected.created_at).toLocaleDateString("es-CO")}
                    <span className="text-muted-foreground ml-1">
                      ({getDaysOld(selected.created_at)}d)
                    </span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                    {selected.notes}
                  </div>
                )}

                {/* Documents */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Documentos Adjuntos</h4>
                    {hasDocuments(selected) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleDeleteAllDocs(selected)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Eliminar todos
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(["rut_url", "camara_comercio_url", "cedula_url", "soporte_pago_url"] as const).map(
                      (field) => {
                        const path = selected[field];
                        const hasFile = !!path && path.length > 0;
                        return (
                          <div
                            key={field}
                            className={`flex items-center justify-between rounded-md border p-2.5 ${
                              hasFile ? "bg-card" : "bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText
                                className={`h-4 w-4 ${hasFile ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <span className="text-sm">{docLabels[field]}</span>
                            </div>
                            {hasFile ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Ver"
                                  onClick={() => handleView(path!)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Descargar"
                                  onClick={() => handleDownload(path!, docLabels[field])}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  title="Eliminar"
                                  onClick={() => handleDeleteDoc(selected.id, field, path!)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                {field === "soporte_pago_url" ? "No adjuntado" : "Eliminado"}
                              </Badge>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Status controls */}
                <div className="flex gap-2 pt-2">
                  {selected.status !== "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        moveStatus(
                          selected.id,
                          selected.status === "completed" ? "processing" : "pending"
                        )
                      }
                    >
                      ← Mover atrás
                    </Button>
                  )}
                  {selected.status !== "completed" && (
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() =>
                        moveStatus(
                          selected.id,
                          selected.status === "pending" ? "processing" : "completed"
                        )
                      }
                    >
                      Avanzar →
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Retention settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Retención de Documentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Los documentos más antiguos que este período serán eliminados automáticamente para
              liberar espacio de almacenamiento.
            </div>

            <div>
              <Label className="text-sm">Días de retención</Label>
              <Input
                type="number"
                min={7}
                max={365}
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 7 días, máximo 365 días. Actual: {retentionDays} días.
              </p>
            </div>

            <Button onClick={saveRetention} disabled={savingRetention} className="w-full">
              {savingRetention ? "Guardando..." : "Guardar configuración"}
            </Button>

            <div className="border-t pt-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={runCleanupNow}
                disabled={runningCleanup}
              >
                {runningCleanup ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Limpiando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" /> Ejecutar limpieza ahora
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Elimina documentos que exceden el período de retención
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
