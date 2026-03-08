import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Workflow, Plus, Pencil, Trash2, Copy, ArrowRight, Search,
  Zap, Mail, MessageCircle, Clock, GitBranch, Settings2,
  Filter,
} from "lucide-react";
import { NotificationFlow, FlowNode, NODE_TYPES, TRIGGER_EVENTS } from "./types";

const ICON_MAP: Record<string, any> = {
  Zap, Mail, MessageCircle, Clock, GitBranch, Settings2,
};

interface Props {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function FlowListView({ onEdit, onCreate }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTrigger, setFilterTrigger] = useState<string | null>(null);

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ["notification_flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_flows")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((f) => ({
        ...f,
        nodes: (f.nodes || []) as FlowNode[],
        edges: (f.edges || []) as any[],
      })) as NotificationFlow[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("notification_flows").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification_flows"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notification_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification_flows"] });
      toast.success("Flujo eliminado");
    },
  });

  const duplicateMut = useMutation({
    mutationFn: async (flow: NotificationFlow) => {
      const { error } = await supabase.from("notification_flows").insert({
        name: `${flow.name} (copia)`,
        description: flow.description,
        trigger_event: flow.trigger_event,
        nodes: flow.nodes as any,
        edges: flow.edges as any,
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification_flows"] });
      toast.success("Flujo duplicado");
    },
  });

  const filtered = useMemo(() => {
    let result = flows;
    if (filterTrigger) result = result.filter(f => f.trigger_event === filterTrigger);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.description || "").toLowerCase().includes(q) ||
        f.trigger_event.toLowerCase().includes(q)
      );
    }
    return result;
  }, [flows, search, filterTrigger]);

  // Group by trigger_event
  const grouped = useMemo(() => {
    const map = new Map<string, NotificationFlow[]>();
    filtered.forEach(f => {
      const group = TRIGGER_EVENTS.find(e => e.value === f.trigger_event)?.label || f.trigger_event;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(f);
    });
    return map;
  }, [filtered]);

  // Stats
  const totalActive = flows.filter(f => f.is_active).length;
  const totalEmails = flows.reduce((acc, f) => acc + f.nodes.filter(n => n.type === "email").length, 0);
  const totalWA = flows.reduce((acc, f) => acc + f.nodes.filter(n => n.type === "whatsapp").length, 0);

  const uniqueTriggers = useMemo(() => {
    const set = new Set(flows.map(f => f.trigger_event));
    return TRIGGER_EVENTS.filter(e => set.has(e.value));
  }, [flows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Flujos de Notificación
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión centralizada de todas las notificaciones del sistema — Email y WhatsApp
          </p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Flujo
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flows.length}</p>
              <p className="text-xs text-muted-foreground">Flujos totales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalActive}</p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEmails}</p>
              <p className="text-xs text-muted-foreground">Nodos Email</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalWA}</p>
              <p className="text-xs text-muted-foreground">Nodos WhatsApp</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar flujos..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterTrigger === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTrigger(null)}
            className="gap-1"
          >
            <Filter className="h-3 w-3" />Todos
          </Button>
          {uniqueTriggers.map(t => (
            <Button
              key={t.value}
              variant={filterTrigger === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTrigger(filterTrigger === t.value ? null : t.value)}
              className="text-xs"
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Flow list */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Workflow className="h-8 w-8 animate-spin mx-auto mb-2 opacity-50" />
          Cargando flujos...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Workflow className="h-12 w-12 text-muted-foreground/30" />
            <p className="font-medium">{search || filterTrigger ? "No hay resultados" : "No hay flujos creados"}</p>
            <Button onClick={onCreate}><Plus className="h-4 w-4 mr-1" />Crear Flujo</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([groupLabel, groupFlows]) => (
            <div key={groupLabel}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="h-3 w-3" />
                {groupLabel}
                <Badge variant="secondary" className="text-[10px]">{groupFlows.length}</Badge>
              </h3>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {groupFlows.map((flow) => (
                  <FlowCard
                    key={flow.id}
                    flow={flow}
                    onEdit={() => onEdit(flow.id)}
                    onToggle={(v) => toggleActive.mutate({ id: flow.id, is_active: v })}
                    onDuplicate={() => duplicateMut.mutate(flow)}
                    onDelete={() => {
                      if (confirm(`¿Eliminar "${flow.name}"?`)) deleteMut.mutate(flow.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlowCard({ flow, onEdit, onToggle, onDuplicate, onDelete }: {
  flow: NotificationFlow;
  onEdit: () => void;
  onToggle: (v: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const trigger = TRIGGER_EVENTS.find(e => e.value === flow.trigger_event);

  return (
    <Card
      className="border shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      onClick={onEdit}
    >
      {/* Activity indicator */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${flow.is_active ? "bg-green-500" : "bg-muted"}`} />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{flow.name}</CardTitle>
            {flow.description && (
              <CardDescription className="text-xs truncate mt-0.5">{flow.description}</CardDescription>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={flow.is_active} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="gap-1 text-[10px] h-5">
            <Zap className="h-2.5 w-2.5" />
            {trigger?.label || flow.trigger_event}
          </Badge>
          <Badge variant="secondary" className="text-[10px] h-5">
            {flow.nodes.length} nodos
          </Badge>
        </div>

        {/* Mini flow preview */}
        <div className="flex items-center gap-0.5 overflow-hidden py-1">
          {flow.nodes.slice(0, 6).map((node, i) => {
            const nt = NODE_TYPES[node.type] || NODE_TYPES.action;
            const Icon = ICON_MAP[nt.iconName] || Settings2;
            return (
              <div key={node.id} className="flex items-center gap-0.5">
                {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />}
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${nt.bg} ${nt.border} border`}
                  title={node.label}
                >
                  <Icon className={`h-3 w-3 ${nt.color}`} />
                </div>
              </div>
            );
          })}
          {flow.nodes.length > 6 && (
            <span className="text-[10px] text-muted-foreground ml-1">+{flow.nodes.length - 6}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{flow.run_count} ejecuciones</span>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Editar" onClick={onEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Duplicar" onClick={onDuplicate}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" title="Eliminar" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
