import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Workflow, Plus, Pencil, Trash2, Play, Pause,
  Zap, Mail, MessageCircle, Clock, GitBranch,
  ArrowRight, MousePointer, Save, X, Copy,
  Check, AlertCircle, MoveHorizontal, Settings2,
  RotateCcw, Maximize2, Minimize2,
} from "lucide-react";

/* ─── Types ─── */
interface FlowNode {
  id: string;
  type: "trigger" | "email" | "whatsapp" | "delay" | "condition" | "action";
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface NotificationFlow {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  is_active: boolean;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
  updated_at: string;
}

const NODE_TYPES: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  trigger: { label: "Disparador", icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-300" },
  email: { label: "Enviar Email", icon: Mail, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-300" },
  whatsapp: { label: "Enviar WhatsApp", icon: MessageCircle, color: "text-green-600", bg: "bg-green-500/10 border-green-300" },
  delay: { label: "Esperar", icon: Clock, color: "text-purple-600", bg: "bg-purple-500/10 border-purple-300" },
  condition: { label: "Condición", icon: GitBranch, color: "text-orange-600", bg: "bg-orange-500/10 border-orange-300" },
  action: { label: "Acción", icon: Settings2, color: "text-gray-600", bg: "bg-gray-500/10 border-gray-300" },
};

const TRIGGER_EVENTS = [
  { value: "new_lead", label: "Nuevo lead/demo" },
  { value: "new_user_signup", label: "Nuevo registro de usuario" },
  { value: "role_assigned", label: "Rol asignado" },
  { value: "license_activated", label: "Licencia activada" },
  { value: "license_expiring", label: "Licencia por vencer" },
  { value: "ticket_created", label: "Ticket creado" },
  { value: "ticket_resolved", label: "Ticket resuelto" },
  { value: "payment_confirmed", label: "Pago confirmado" },
  { value: "reseller_approved", label: "Socio aprobado" },
  { value: "certificate_order", label: "Orden de certificado" },
  { value: "custom", label: "Evento personalizado" },
];

export default function FlowEditorView() {
  const qc = useQueryClient();
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ["notification_flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_flows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((f) => ({
        ...f,
        nodes: (f.nodes || []) as FlowNode[],
        edges: (f.edges || []) as FlowEdge[],
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

  if (editingFlowId) {
    return (
      <FlowCanvasWrapper
        flowId={editingFlowId}
        onBack={() => { setEditingFlowId(null); qc.invalidateQueries({ queryKey: ["notification_flows"] }); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Editor de Flujos
          </h1>
          <p className="text-sm text-muted-foreground">
            Diseña flujos visuales de notificaciones — Email y WhatsApp
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Flujo
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando flujos...</div>
      ) : flows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Workflow className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">No hay flujos creados</p>
              <p className="text-sm text-muted-foreground">Crea tu primer flujo de notificaciones</p>
            </div>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4 mr-1" />Crear Flujo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => {
            const trigger = TRIGGER_EVENTS.find((e) => e.value === flow.trigger_event);
            return (
              <Card
                key={flow.id}
                className="border shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setEditingFlowId(flow.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{flow.name}</CardTitle>
                      {flow.description && (
                        <CardDescription className="truncate">{flow.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={flow.is_active}
                        onCheckedChange={(v) => toggleActive.mutate({ id: flow.id, is_active: v })}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Zap className="h-3 w-3" />
                      {trigger?.label || flow.trigger_event}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {flow.nodes.length} nodos
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {flow.edges.length} conexiones
                    </Badge>
                  </div>

                  {/* Mini flow preview */}
                  <div className="flex items-center gap-1 overflow-hidden">
                    {flow.nodes.slice(0, 5).map((node, i) => {
                      const nt = NODE_TYPES[node.type] || NODE_TYPES.action;
                      const Icon = nt.icon;
                      return (
                        <div key={node.id} className="flex items-center gap-1">
                          {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${nt.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${nt.color}`} />
                          </div>
                        </div>
                      );
                    })}
                    {flow.nodes.length > 5 && (
                      <span className="text-xs text-muted-foreground ml-1">+{flow.nodes.length - 5}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{flow.run_count} ejecuciones</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6" title="Editar" onClick={() => setEditingFlowId(flow.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" title="Duplicar" onClick={() => duplicateMut.mutate(flow)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" title="Eliminar" onClick={() => {
                        if (confirm(`¿Eliminar "${flow.name}"?`)) deleteMut.mutate(flow.id);
                      }}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {creating && (
        <FlowCreateDialog open onClose={() => setCreating(false)} onCreated={(flowId) => {
          setCreating(false);
          setEditingFlowId(flowId);
        }} />
      )}
    </div>
  );
}

/* ═══ FLOW CREATE DIALOG ═══ */
function FlowCreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", trigger_event: "new_lead" });

  const save = async () => {
    if (!form.name) { toast.error("Ingresa un nombre"); return; }
    const triggerNode: FlowNode = {
      id: "trigger-1",
      type: "trigger",
      label: TRIGGER_EVENTS.find((e) => e.value === form.trigger_event)?.label || form.trigger_event,
      x: 100,
      y: 200,
      config: { event: form.trigger_event },
    };
    const { data, error } = await supabase.from("notification_flows").insert({
      ...form,
      nodes: [triggerNode] as any,
      edges: [] as any,
    }).select("id").single();
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["notification_flows"] });
    toast.success("Flujo creado");
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo Flujo de Notificación</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nombre del flujo</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Bienvenida nuevo lead" />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
          <div>
            <Label>Evento disparador</Label>
            <Select value={form.trigger_event} onValueChange={(v) => setForm((p) => ({ ...p, trigger_event: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_EVENTS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Crear y Diseñar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══ FLOW CANVAS WRAPPER — fetches fresh data ═══ */
function FlowCanvasWrapper({ flowId, onBack }: { flowId: string; onBack: () => void }) {
  const { data: flow, isLoading, error } = useQuery({
    queryKey: ["notification_flow_detail", flowId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_flows")
        .select("*")
        .eq("id", flowId)
        .single();
      if (error) throw error;
      return {
        ...data,
        nodes: (data.nodes || []) as FlowNode[],
        edges: (data.edges || []) as FlowEdge[],
      } as NotificationFlow;
    },
    staleTime: 0, // Always fetch fresh
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Workflow className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Cargando flujo completo...</p>
        </div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
        <p className="text-destructive">Error al cargar el flujo</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onBack}>Volver</Button>
      </div>
    );
  }

  return <FlowCanvas flow={flow} onBack={onBack} />;
}

/* ═══ FLOW CANVAS (Visual Editor) ═══ */
function FlowCanvas({ flow, onBack }: { flow: NotificationFlow; onBack: () => void }) {
  const qc = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>(flow.nodes);
  const [edges, setEdges] = useState<FlowEdge[]>(flow.edges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Editable flow metadata
  const [flowName, setFlowName] = useState(flow.name);
  const [flowDescription, setFlowDescription] = useState(flow.description || "");
  const [flowTrigger, setFlowTrigger] = useState(flow.trigger_event);
  const [flowActive, setFlowActive] = useState(flow.is_active);

  const DRAG_THRESHOLD = 5;

  const addNode = (type: FlowNode["type"]) => {
    const nt = NODE_TYPES[type];
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      label: nt.label,
      x: 300 + Math.random() * 200,
      y: 100 + Math.random() * 300,
      config: {},
    };
    setNodes((prev) => [...prev, newNode]);
    setHasChanges(true);
    setSelectedNode(newNode.id);
    setSelectedEdge(null);
  };

  const duplicateNode = (id: string) => {
    const original = nodes.find(n => n.id === id);
    if (!original) return;
    const dup: FlowNode = {
      ...original,
      id: `${original.type}-${Date.now()}`,
      x: original.x + 30,
      y: original.y + 40,
      label: `${original.label} (copia)`,
      config: { ...original.config },
    };
    setNodes(prev => [...prev, dup]);
    setHasChanges(true);
    setSelectedNode(dup.id);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
    setHasChanges(true);
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdge(null);

    if (connecting) {
      if (connecting !== nodeId) {
        const newEdge: FlowEdge = {
          id: `edge-${Date.now()}`,
          source: connecting,
          target: nodeId,
        };
        setEdges((prev) => [...prev, newEdge]);
        setHasChanges(true);
      }
      setConnecting(null);
      return;
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelectedNode(nodeId);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);

    const rect = canvasRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left || 0) - node.x,
      y: e.clientY - (rect?.top || 0) - node.y,
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStartPos || !canvasRef.current) return;

    if (!hasDragged) {
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      setHasDragged(true);
      const nodeId = selectedNode;
      if (nodeId) setDragging(nodeId);
    }

    if (!dragging && !hasDragged) return;
    const activeId = dragging || selectedNode;
    if (!activeId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 170));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 50));
    setNodes((prev) => prev.map((n) => n.id === activeId ? { ...n, x, y } : n));
    setHasChanges(true);
  }, [dragStartPos, hasDragged, dragging, selectedNode, dragOffset]);

  const handleMouseUp = () => {
    setDragging(null);
    setDragStartPos(null);
    setHasDragged(false);
  };

  const saveFlow = async () => {
    const { error } = await supabase.from("notification_flows").update({
      name: flowName,
      description: flowDescription || null,
      trigger_event: flowTrigger,
      is_active: flowActive,
      nodes: nodes as any,
      edges: edges as any,
      updated_at: new Date().toISOString(),
    }).eq("id", flow.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["notification_flows"] });
    qc.invalidateQueries({ queryKey: ["notification_flow_detail", flow.id] });
    toast.success("Flujo guardado");
    setHasChanges(false);
  };

  const deleteEdge = (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
    setSelectedEdge(null);
    setHasChanges(true);
  };

  const startConnectFromNode = (nodeId: string) => {
    setConnecting(nodeId);
    toast.info("Haz clic en el nodo destino para conectar", { duration: 3000 });
  };

  const autoLayout = () => {
    const sorted = [...nodes];
    const triggerNodes = sorted.filter(n => n.type === "trigger");
    const otherNodes = sorted.filter(n => n.type !== "trigger");
    const all = [...triggerNodes, ...otherNodes];
    const updated = all.map((n, i) => ({
      ...n,
      x: 80 + (i % 3) * 220,
      y: 60 + Math.floor(i / 3) * 120,
    }));
    setNodes(updated);
    setHasChanges(true);
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);
  const selectedEdgeData = edges.find((e) => e.id === selectedEdge);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <X className="h-4 w-4 mr-1" />Volver
          </Button>
          {editingMeta ? (
            <Input
              value={flowName}
              onChange={(e) => { setFlowName(e.target.value); setHasChanges(true); }}
              className="h-8 text-sm font-bold w-48"
              autoFocus
              onBlur={() => setEditingMeta(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingMeta(false)}
            />
          ) : (
            <button onClick={() => setEditingMeta(true)} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <h2 className="font-bold text-lg">{flowName}</h2>
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <Switch checked={flowActive} onCheckedChange={(v) => { setFlowActive(v); setHasChanges(true); }} />
          {flowActive && <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">Activo</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {connecting && (
            <Badge variant="outline" className="gap-1 text-primary animate-pulse">
              <MoveHorizontal className="h-3 w-3" />
              Selecciona nodo destino
            </Badge>
          )}
          {hasChanges && <Badge variant="outline" className="text-amber-600">Sin guardar</Badge>}
          <Button size="sm" variant="outline" onClick={autoLayout} title="Auto-organizar">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={saveFlow} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-1" />Guardar
          </Button>
        </div>
      </div>

      {/* Flow metadata editor */}
      {editingMeta && (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input value={flowName} onChange={(e) => { setFlowName(e.target.value); setHasChanges(true); }} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Descripción</Label>
              <Input value={flowDescription} onChange={(e) => { setFlowDescription(e.target.value); setHasChanges(true); }} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Evento disparador</Label>
              <Select value={flowTrigger} onValueChange={(v) => { setFlowTrigger(v); setHasChanges(true); }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Node palette */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(NODE_TYPES).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={`gap-1.5 ${cfg.color}`}
              onClick={() => addNode(type as FlowNode["type"])}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </Button>
          );
        })}
        {connecting && (
          <>
            <div className="mx-2 border-l" />
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setConnecting(null)}>
              <X className="h-3.5 w-3.5" />
              Cancelar Conexión
            </Button>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {/* Canvas */}
        <Card className="border shadow-sm overflow-hidden">
          <div
            ref={canvasRef}
            className={`relative bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px] min-h-[500px] ${
              connecting ? "cursor-crosshair" : "cursor-default"
            }`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
              if (e.target === canvasRef.current && !dragging) {
                setSelectedNode(null);
                setSelectedEdge(null);
                if (connecting) setConnecting(null);
              }
            }}
          >
            {/* SVG edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {edges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.source);
                const tgt = nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;
                const sx = src.x + 80;
                const sy = src.y + 25;
                const tx = tgt.x;
                const ty = tgt.y + 25;
                const mx = (sx + tx) / 2;
                const isSelected = selectedEdge === edge.id;
                return (
                  <g key={edge.id}>
                    <path
                      d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                      fill="none"
                      stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                      strokeWidth={isSelected ? "3" : "2"}
                      strokeDasharray={edge.condition ? "6 3" : "none"}
                      opacity={isSelected ? 0.9 : 0.5}
                    />
                    <circle cx={tx} cy={ty} r="4" fill="hsl(var(--primary))" opacity={0.7} />
                    {/* Clickable area */}
                    <path
                      d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="14"
                      className="cursor-pointer pointer-events-auto hover:stroke-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdge(edge.id);
                        setSelectedNode(null);
                      }}
                    />
                    {edge.label && (
                      <text x={mx} y={(sy + ty) / 2 - 8} textAnchor="middle" className="text-[10px] fill-muted-foreground">
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const nt = NODE_TYPES[node.type] || NODE_TYPES.action;
              const Icon = nt.icon;
              const isSelected = selectedNode === node.id;
              const isConnectSource = connecting === node.id;
              return (
                <div
                  key={node.id}
                  className={`absolute flex items-center gap-2 px-3 py-2 rounded-lg border-2 shadow-sm select-none transition-all ${nt.bg} ${
                    isSelected ? "ring-2 ring-primary shadow-md" : ""
                  } ${isConnectSource ? "ring-2 ring-primary ring-offset-2 scale-105" : ""} ${
                    connecting && !isConnectSource ? "hover:ring-2 hover:ring-primary cursor-crosshair" : "cursor-grab active:cursor-grabbing"
                  }`}
                  style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 2, minWidth: 160 }}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${nt.bg}`}>
                    <Icon className={`h-4 w-4 ${nt.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{node.label}</p>
                    <p className="text-[10px] text-muted-foreground">{nt.label}</p>
                  </div>
                  {/* Connection point */}
                  <div
                    className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary/50 hover:bg-primary/50 cursor-crosshair transition-colors"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startConnectFromNode(node.id);
                    }}
                  />
                  {isConnectSource && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              );
            })}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Workflow className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <p className="text-muted-foreground">Agrega nodos desde la paleta superior</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Properties panel */}
        <Card className="border shadow-sm h-fit sticky top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Propiedades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEdgeData ? (
              <EdgeProperties
                edge={selectedEdgeData}
                nodes={nodes}
                onUpdate={(updated) => {
                  setEdges(prev => prev.map(e => e.id === updated.id ? updated : e));
                  setHasChanges(true);
                }}
                onDelete={() => deleteEdge(selectedEdgeData.id)}
              />
            ) : selectedNodeData ? (
              <NodeProperties
                node={selectedNodeData}
                onUpdate={(updated) => {
                  setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
                  setHasChanges(true);
                }}
                onConnect={() => startConnectFromNode(selectedNodeData.id)}
                onDuplicate={() => duplicateNode(selectedNodeData.id)}
                onDelete={() => deleteNode(selectedNodeData.id)}
              />
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <MousePointer className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p>Selecciona un nodo o conexión</p>
                <p className="mt-1 text-[10px]">Arrastra nodos para moverlos</p>
                <p className="text-[10px]">Usa el punto derecho para conectar</p>
              </div>
            )}

            <div className="border-t pt-3 mt-3">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-2">Resumen del flujo</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{nodes.length} nodos · {edges.length} conexiones</p>
                <p>Disparador: {TRIGGER_EVENTS.find((e) => e.value === flowTrigger)?.label}</p>
                <p>{flow.run_count} ejecuciones totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Node Properties Panel ─── */
function NodeProperties({ node, onUpdate, onConnect, onDuplicate, onDelete }: {
  node: FlowNode;
  onUpdate: (n: FlowNode) => void;
  onConnect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const updateConfig = (key: string, value: any) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } });
  };

  return (
    <>
      <div>
        <Label className="text-xs">Etiqueta</Label>
        <Input
          value={node.label}
          onChange={(e) => onUpdate({ ...node, label: e.target.value })}
          className="h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs">Tipo</Label>
        <Badge variant="outline" className="mt-1">{NODE_TYPES[node.type]?.label}</Badge>
      </div>

      {node.type === "trigger" && (
        <div>
          <Label className="text-xs">Evento disparador</Label>
          <Select
            value={node.config.event || ""}
            onValueChange={(v) => {
              onUpdate({
                ...node,
                config: { ...node.config, event: v },
                label: TRIGGER_EVENTS.find(e => e.value === v)?.label || v,
              });
            }}
          >
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar evento" /></SelectTrigger>
            <SelectContent>
              {TRIGGER_EVENTS.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {node.type === "email" && (
        <>
          <div>
            <Label className="text-xs">Plantilla de email</Label>
            <Input value={node.config.template_key || ""} onChange={(e) => updateConfig("template_key", e.target.value)} placeholder="welcome_user" className="h-8 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs">Asunto</Label>
            <Input value={node.config.subject || ""} onChange={(e) => updateConfig("subject", e.target.value)} placeholder="Asunto del correo" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Destinatario</Label>
            <Input value={node.config.recipient || ""} onChange={(e) => updateConfig("recipient", e.target.value)} placeholder="{{email}} o correo fijo" className="h-8 text-sm font-mono" />
          </div>
        </>
      )}

      {node.type === "whatsapp" && (
        <>
          <div>
            <Label className="text-xs">Evento WhatsApp</Label>
            <Input value={node.config.event_type || ""} onChange={(e) => updateConfig("event_type", e.target.value)} placeholder="new_demo" className="h-8 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs">Teléfono destino</Label>
            <Input value={node.config.phone || ""} onChange={(e) => updateConfig("phone", e.target.value)} placeholder="{{phone}} o número fijo" className="h-8 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs">Mensaje</Label>
            <Textarea value={node.config.message || ""} onChange={(e) => updateConfig("message", e.target.value)} rows={3} className="text-xs" placeholder="Hola {{nombre}}, ..." />
          </div>
        </>
      )}

      {node.type === "delay" && (
        <div>
          <Label className="text-xs">Minutos de espera</Label>
          <Input type="number" value={node.config.delay_minutes || 0} onChange={(e) => updateConfig("delay_minutes", parseInt(e.target.value))} className="h-8 text-sm" />
          <p className="text-[10px] text-muted-foreground mt-1">
            = {((node.config.delay_minutes || 0) / 60).toFixed(1)}h / {((node.config.delay_minutes || 0) / 1440).toFixed(1)}d
          </p>
        </div>
      )}

      {node.type === "condition" && (
        <>
          <div>
            <Label className="text-xs">Expresión</Label>
            <Textarea value={node.config.expression || ""} onChange={(e) => updateConfig("expression", e.target.value)} rows={3} className="text-xs font-mono" placeholder="data.status === 'approved'" />
          </div>
          <div>
            <Label className="text-xs">Rama verdadera</Label>
            <Input value={node.config.true_label || ""} onChange={(e) => updateConfig("true_label", e.target.value)} placeholder="Sí" className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Rama falsa</Label>
            <Input value={node.config.false_label || ""} onChange={(e) => updateConfig("false_label", e.target.value)} placeholder="No" className="h-8 text-sm" />
          </div>
        </>
      )}

      {node.type === "action" && (
        <>
          <div>
            <Label className="text-xs">Acción</Label>
            <Input value={node.config.action_name || ""} onChange={(e) => updateConfig("action_name", e.target.value)} placeholder="update_status" className="h-8 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs">Payload (JSON)</Label>
            <Textarea value={node.config.payload || ""} onChange={(e) => updateConfig("payload", e.target.value)} rows={3} className="text-xs font-mono" placeholder='{"key": "value"}' />
          </div>
        </>
      )}

      <div className="pt-2 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={onConnect}>
          <MoveHorizontal className="h-3 w-3" />Conectar
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onDuplicate}>
          <Copy className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive/10" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </>
  );
}

/* ─── Edge Properties Panel ─── */
function EdgeProperties({ edge, nodes, onUpdate, onDelete }: {
  edge: FlowEdge;
  nodes: FlowNode[];
  onUpdate: (e: FlowEdge) => void;
  onDelete: () => void;
}) {
  const srcNode = nodes.find(n => n.id === edge.source);
  const tgtNode = nodes.find(n => n.id === edge.target);

  return (
    <>
      <div className="rounded-lg bg-muted/50 p-2 text-xs space-y-1">
        <p className="font-semibold">Conexión seleccionada</p>
        <p>De: <span className="font-medium">{srcNode?.label || edge.source}</span></p>
        <p>A: <span className="font-medium">{tgtNode?.label || edge.target}</span></p>
      </div>
      <div>
        <Label className="text-xs">Etiqueta de conexión</Label>
        <Input
          value={edge.label || ""}
          onChange={(e) => onUpdate({ ...edge, label: e.target.value || undefined })}
          placeholder="Ej: Sí, No, Éxito..."
          className="h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs">Condición (opcional)</Label>
        <Input
          value={edge.condition || ""}
          onChange={(e) => onUpdate({ ...edge, condition: e.target.value || undefined })}
          placeholder="status === 'approved'"
          className="h-8 text-sm font-mono"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Si tiene condición, la línea se muestra punteada
        </p>
      </div>
      <Button variant="outline" size="sm" className="w-full text-xs text-destructive hover:bg-destructive/10 gap-1" onClick={onDelete}>
        <Trash2 className="h-3 w-3" /> Eliminar conexión
      </Button>
    </>
  );
}
