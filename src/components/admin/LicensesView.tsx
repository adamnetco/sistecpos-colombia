import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Search, Eye, Pause, Play, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { LicenseCreateDialog } from "./licenses/LicenseCreateDialog";
import { LicenseRenewDialog } from "./licenses/LicenseRenewDialog";
import { LicenseDetailsDialog } from "./licenses/LicenseDetailsDialog";
import { planLabel } from "@/data/licensePlans";

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
  created_by_reseller_id: string | null;
}

export default function LicensesView() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [renewTarget, setRenewTarget] = useState<{ id: string; expires_at: string | null } | null>(null);
  const [detailTarget, setDetailTarget] = useState<License | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "suspended" | "pending_approval">("all");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("licenses").select("*").order("created_at", { ascending: false });
    setLicenses((data as License[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().split("T")[0];
  const isExpired = (l: License) => l.expires_at && l.expires_at < today;

  const toggleStatus = async (l: License) => {
    const newStatus = l.status === "suspended" ? "active" : "suspended";
    const { error } = await supabase.from("licenses").update({ status: newStatus }).eq("id", l.id);
    if (error) {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
    } else {
      toast({ title: newStatus === "suspended" ? "Licencia suspendida" : "Licencia reactivada" });
      load();
    }
  };

  const approveLicense = async (id: string) => {
    const { error } = await supabase.from("licenses").update({ status: "active" }).eq("id", id);
    if (error) {
      toast({ title: "Error al aprobar", variant: "destructive" });
    } else {
      toast({ title: "✅ Licencia aprobada" });
      load();
    }
  };

  const rejectLicense = async (id: string) => {
    const { error } = await supabase.from("licenses").update({ status: "rejected" }).eq("id", id);
    if (error) {
      toast({ title: "Error al rechazar", variant: "destructive" });
    } else {
      toast({ title: "Licencia rechazada" });
      load();
    }
  };

  const filtered = licenses.filter((l) => {
    const matchSearch =
      l.business_name.toLowerCase().includes(search.toLowerCase()) ||
      l.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      l.license_key.toLowerCase().includes(search.toLowerCase()) ||
      (l.business_nit || "").toLowerCase().includes(search.toLowerCase());

    if (filter === "pending_approval") return matchSearch && l.status === "pending_approval";
    if (filter === "active") return matchSearch && !isExpired(l) && l.status === "active";
    if (filter === "expired") return matchSearch && isExpired(l);
    if (filter === "suspended") return matchSearch && l.status === "suspended";
    return matchSearch;
  });

  const pendingCount = licenses.filter((l) => l.status === "pending_approval").length;
  const stats = {
    total: licenses.length,
    pending: pendingCount,
    active: licenses.filter((l) => !isExpired(l) && l.status === "active").length,
    expired: licenses.filter((l) => isExpired(l)).length,
    suspended: licenses.filter((l) => l.status === "suspended").length,
  };

  const statusBadge = (l: License) => {
    if (l.status === "pending_approval") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>;
    if (l.status === "rejected") return <Badge variant="destructive">Rechazada</Badge>;
    if (isExpired(l)) return <Badge variant="destructive">Vencida</Badge>;
    if (l.status === "suspended") return <Badge variant="secondary">Suspendida</Badge>;
    return <Badge className="bg-whatsapp text-white">Activa</Badge>;
  };

  return (
    <div>
      {/* Pending approval alert */}
      {pendingCount > 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {pendingCount} licencia{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} de aprobación
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">Creadas por socios — requieren tu aprobación para activarse.</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto shrink-0 border-amber-400 text-amber-700 hover:bg-amber-100" onClick={() => setFilter("pending_approval")}>
            Ver pendientes
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold font-display">Licencias</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => exportToCsv(filtered, [
            { key: "business_name", label: "Negocio" },
            { key: "business_nit", label: "NIT" },
            { key: "contact_name", label: "Contacto" },
            { key: "contact_email", label: "Email" },
            { key: "contact_phone", label: "Teléfono" },
            { key: "plan_type", label: "Plan" },
            { key: "status", label: "Estado" },
            { key: "start_date", label: "Inicio" },
            { key: "expires_at", label: "Vencimiento" },
            { key: "license_key", label: "Clave" },
            { key: "price_paid", label: "Precio" },
          ], "licencias")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
          <LicenseCreateDialog open={showAdd} onOpenChange={setShowAdd} onCreated={load} />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats.total} onClick={() => setFilter("all")} active={filter === "all"} />
        {stats.pending > 0 && (
          <StatCard label="Pendientes" value={stats.pending} onClick={() => setFilter("pending_approval")} active={filter === "pending_approval"} className="text-amber-600" />
        )}
        <StatCard label="Activas" value={stats.active} onClick={() => setFilter("active")} active={filter === "active"} className="text-green-600" />
        <StatCard label="Vencidas" value={stats.expired} onClick={() => setFilter("expired")} active={filter === "expired"} className="text-destructive" />
        <StatCard label="Suspendidas" value={stats.suspended} onClick={() => setFilter("suspended")} active={filter === "suspended"} className="text-muted-foreground" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por negocio, contacto, NIT o clave..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Vence</th>
              <th className="px-4 py-3 text-left font-medium">Clave</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay licencias</td></tr>
            ) : (
              filtered.map((l) => (
                <tr
                  key={l.id}
                  className={`border-b cursor-pointer hover:bg-muted/30 ${l.status === "pending_approval" ? "bg-amber-50/50 dark:bg-amber-950/10" : isExpired(l) ? "bg-destructive/5" : ""}`}
                  onClick={() => setDetailTarget(l)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.business_name}</div>
                    <div className="text-xs text-muted-foreground">{l.contact_name}</div>
                    {l.created_by_reseller_id && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Creada por socio</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{planLabel(l.plan_type)}</td>
                  <td className="px-4 py-3">{statusBadge(l)}</td>
                  <td className="px-4 py-3">{l.expires_at || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.license_key.slice(0, 8)}...</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {l.status === "pending_approval" ? (
                        <>
                          <Button size="sm" variant="default" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => approveLicense(l.id)}>
                            <CheckCircle className="h-3 w-3" />Aprobar
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => rejectLicense(l.id)}>
                            <XCircle className="h-3 w-3" />Rechazar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" title="Ver detalle" onClick={() => setDetailTarget(l)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRenewTarget({ id: l.id, expires_at: l.expires_at })}>
                            <RefreshCw className="mr-1 h-3 w-3" />Renovar
                          </Button>
                          <Button
                            size="sm"
                            variant={l.status === "suspended" ? "default" : "secondary"}
                            onClick={() => toggleStatus(l)}
                            title={l.status === "suspended" ? "Reactivar" : "Suspender"}
                          >
                            {l.status === "suspended" ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <LicenseRenewDialog
        licenseId={renewTarget?.id || null}
        currentExpiresAt={renewTarget?.expires_at || null}
        onClose={() => setRenewTarget(null)}
        onRenewed={load}
      />
      <LicenseDetailsDialog license={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}

function StatCard({ label, value, onClick, active, className }: {
  label: string; value: number; onClick: () => void; active: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition-colors ${active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50"}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${className || ""}`}>{value}</p>
    </button>
  );
}
