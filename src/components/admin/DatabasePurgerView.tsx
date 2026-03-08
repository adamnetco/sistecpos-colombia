import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle, Download, Trash2, Loader2, Search, Database, Shield, Users, FileKey, ShoppingCart, MessageSquare,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { exportToCsv } from "@/lib/exportCsv";

type EntityType = "leads" | "licenses" | "contacts" | "payments" | "tickets" | "conversations" | "certificate_orders";

interface EntityConfig {
  key: EntityType;
  label: string;
  table: string;
  icon: React.ReactNode;
  columns: { key: string; label: string }[];
  searchFields: string[];
}

const ENTITIES: EntityConfig[] = [
  {
    key: "leads", label: "Leads / Demos", table: "leads_trials",
    icon: <Users className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "contact_name", label: "Nombre" },
      { key: "business_name", label: "Negocio" }, { key: "email", label: "Email" },
      { key: "status", label: "Estado" }, { key: "created_at", label: "Creado" },
    ],
    searchFields: ["contact_name", "business_name", "email"],
  },
  {
    key: "licenses", label: "Licencias", table: "licenses",
    icon: <FileKey className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "business_name", label: "Negocio" },
      { key: "contact_name", label: "Contacto" }, { key: "plan_type", label: "Plan" },
      { key: "status", label: "Estado" }, { key: "created_at", label: "Creado" },
    ],
    searchFields: ["business_name", "contact_name", "license_key"],
  },
  {
    key: "contacts", label: "Contactos CRM", table: "contacts",
    icon: <Users className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "full_name", label: "Nombre" },
      { key: "email", label: "Email" }, { key: "contact_type", label: "Tipo" },
      { key: "pipeline_stage", label: "Etapa" }, { key: "created_at", label: "Creado" },
    ],
    searchFields: ["full_name", "email", "phone"],
  },
  {
    key: "payments", label: "Pagos", table: "payments",
    icon: <ShoppingCart className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "amount", label: "Monto" },
      { key: "status", label: "Estado" }, { key: "payment_method", label: "Método" },
      { key: "created_at", label: "Creado" },
    ],
    searchFields: ["reference", "notes"],
  },
  {
    key: "tickets", label: "Tickets", table: "client_tickets",
    icon: <MessageSquare className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "subject", label: "Asunto" },
      { key: "status", label: "Estado" }, { key: "priority", label: "Prioridad" },
      { key: "created_at", label: "Creado" },
    ],
    searchFields: ["subject", "description"],
  },
  {
    key: "conversations", label: "Conversaciones IA", table: "ai_conversations",
    icon: <MessageSquare className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "session_id", label: "Sesión" },
      { key: "visitor_name", label: "Visitante" }, { key: "message_count", label: "Mensajes" },
      { key: "created_at", label: "Creado" },
    ],
    searchFields: ["visitor_name", "visitor_email"],
  },
  {
    key: "certificate_orders", label: "Órdenes de certificado", table: "certificate_orders",
    icon: <Shield className="h-4 w-4" />,
    columns: [
      { key: "id", label: "ID" }, { key: "full_name", label: "Nombre" },
      { key: "nit", label: "NIT" }, { key: "status", label: "Estado" },
      { key: "created_at", label: "Creado" },
    ],
    searchFields: ["full_name", "nit", "email"],
  },
];

export default function DatabasePurgerView() {
  const { toast } = useToast();
  const [activeEntity, setActiveEntity] = useState<EntityType>("leads");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const entity = ENTITIES.find(e => e.key === activeEntity)!;

  const loadRecords = async (entityKey?: EntityType) => {
    const ent = ENTITIES.find(e => e.key === (entityKey || activeEntity))!;
    setLoading(true);
    setSelected(new Set());
    const { data, error } = await supabase
      .from(ent.table as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: "Error al cargar", description: error.message, variant: "destructive" });
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleEntityChange = (key: EntityType) => {
    setActiveEntity(key);
    setSearch("");
    setSelected(new Set());
    setRecords([]);
    loadRecords(key);
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return entity.columns.some(c => String(r[c.key] || "").toLowerCase().includes(q));
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(r => r.id)));
    }
  };

  const handleBackup = () => {
    if (filtered.length === 0) return;
    const toExport = selected.size > 0 ? filtered.filter(r => selected.has(r.id)) : filtered;
    exportToCsv(toExport, entity.columns, `backup-${entity.table}`);
    toast({ title: `Respaldo de ${toExport.length} registros descargado` });
  };

  const handleDelete = async () => {
    if (confirmText !== "ELIMINAR") return;
    setDeleting(true);

    const ids = [...selected];
    // Delete in batches of 50
    let deleted = 0;
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const { error } = await supabase
        .from(entity.table as any)
        .delete()
        .in("id", batch);
      if (error) {
        toast({ title: `Error eliminando lote`, description: error.message, variant: "destructive" });
        break;
      }
      deleted += batch.length;
    }

    toast({ title: `${deleted} registros eliminados de ${entity.label}` });
    setDeleting(false);
    setConfirmOpen(false);
    setConfirmText("");
    setSelected(new Set());
    loadRecords();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-destructive" />
        <div>
          <h1 className="text-2xl font-bold font-display">Depurador de Base de Datos</h1>
          <p className="text-sm text-muted-foreground">Respalda y elimina registros de prueba de forma segura.</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <strong>⚠️ Precaución:</strong> Los registros eliminados no se pueden recuperar.
          Siempre descarga un respaldo CSV antes de eliminar. Los registros con dependencias
          (ej: licencias con pagos asociados) podrían fallar si hay restricciones de integridad.
        </div>
      </div>

      {/* Entity selector */}
      <div className="flex flex-wrap gap-2">
        {ENTITIES.map(e => (
          <Button
            key={e.key}
            size="sm"
            variant={activeEntity === e.key ? "default" : "outline"}
            onClick={() => handleEntityChange(e.key)}
            className="gap-1.5 text-xs"
          >
            {e.icon} {e.label}
          </Button>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Buscar en ${entity.label}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{filtered.length} registros</Badge>
          {selected.size > 0 && <Badge className="text-xs">{selected.size} seleccionados</Badge>}
          <Button size="sm" variant="outline" onClick={handleBackup} className="gap-1">
            <Download className="h-3.5 w-3.5" /> Respaldo CSV
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={selected.size === 0}
            onClick={() => setConfirmOpen(true)}
            className="gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Eliminar ({selected.size})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={selectAll}
                />
              </th>
              {entity.columns.map(c => (
                <th key={c.key} className="px-3 py-2 text-left font-medium text-xs">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={entity.columns.length + 1} className="py-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={entity.columns.length + 1} className="py-8 text-center text-muted-foreground text-xs">
                {records.length === 0 ? "Carga los registros seleccionando una entidad" : "Sin resultados"}
              </td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className={`border-b hover:bg-muted/30 ${selected.has(r.id) ? "bg-destructive/5" : ""}`}>
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  {entity.columns.map(c => (
                    <td key={c.key} className="px-3 py-2 text-xs max-w-[200px] truncate">
                      {c.key === "id" ? (
                        <code className="font-mono text-[10px] text-muted-foreground">{String(r[c.key]).slice(0, 8)}</code>
                      ) : c.key === "created_at" ? (
                        new Date(r[c.key]).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "2-digit" })
                      ) : c.key === "status" || c.key === "pipeline_stage" || c.key === "contact_type" ? (
                        <Badge variant="outline" className="text-[10px]">{String(r[c.key])}</Badge>
                      ) : c.key === "amount" ? (
                        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(r[c.key] || 0))
                      ) : (
                        String(r[c.key] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar <strong>{selected.size}</strong> registros de <strong>{entity.label}</strong>. Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="border-destructive"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setConfirmText(""); }}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "ELIMINAR" || deleting}
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deleting ? "Eliminando..." : `Eliminar ${selected.size} registros`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}