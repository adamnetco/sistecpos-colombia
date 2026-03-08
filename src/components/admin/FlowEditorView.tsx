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
  const [selectedFlow, setSelectedFlow] = useState<NotificationFlow | null>(null);
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

  if (selectedFlow) {
    return (
      <FlowCanvas
        flow={selectedFlow}
        onBack={() => setSelectedFlow(null)}
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
            Diseña flujos visuales de notificaciones — Email y WhatsApp como en n8n
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
                onClick={() => setSelectedFlow(flow)}
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
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFlow(flow)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
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
        <FlowCreateDialog open onClose={() => setCreating(false)} onCreated={(flow) => {
          setCreating(false);
          setSelectedFlow(flow);
        }} />
      )}
    </div>
  );
}

/* ═══ FLOW CREATE DIALOG ═══ */
function FlowCreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (f: NotificationFlow) => void }) {
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
    }).select().single();
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["notification_flows"] });
    toast.success("Flujo creado");
    onCreated({ ...data, nodes: [triggerNode], edges: [] } as NotificationFlow);
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
  const [nodeDialog, setNodeDialog] = useState(false);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
    setHasChanges(true);
  };

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connecting) {
      // Complete connection
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
    setDragging(nodeId);
    setSelectedNode(nodeId);
    const rect = canvasRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left || 0) - node.x,
      y: e.clientY - (rect?.top || 0) - node.y,
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
    setNodes((prev) => prev.map((n) => n.id === dragging ? { ...n, x, y } : n));
    setHasChanges(true);
  }, [dragging, dragOffset]);

  const handleMouseUp = () => setDragging(null);

  const saveFlow = async () => {
    const { error } = await supabase.from("notification_flows").update({
      nodes: nodes as any,
      edges: edges as any,
      updated_at: new Date().toISOString(),
    }).eq("id", flow.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["notification_flows"] });
    toast.success("Flujo guardado");
    setHasChanges(false);
  };

  const deleteEdge = (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
    setHasChanges(true);
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <X className="h-4 w-4 mr-1" />Volver
          </Button>
          <h2 className="font-bold text-lg">{flow.name}</h2>
          {flow.is_active && <Badge className="bg-green-500/10 text-green-700">Activo</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && <Badge variant="outline" className="text-amber-600">Sin guardar</Badge>}
          <Button size="sm" onClick={saveFlow} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-1" />Guardar
          </Button>
        </div>
      </div>

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
        <div className="mx-2 border-l" />
        <Button
          variant={connecting ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setConnecting(connecting ? null : "__start__")}
        >
          <MoveHorizontal className="h-3.5 w-3.5" />
          {connecting ? "Cancelar Conexión" : "Conectar Nodos"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {/* Canvas */}
        <Card className="border shadow-sm overflow-hidden">
          <div
            ref={canvasRef}
            className="relative bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)] bg-[size:20px_20px] min-h-[500px] cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => { if (!dragging) setSelectedNode(null); }}
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
                return (
                  <g key={edge.id}>
                    <path
                      d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray={edge.condition ? "6 3" : "none"}
                      opacity={0.5}
                    />
                    <circle cx={tx} cy={ty} r="4" fill="hsl(var(--primary))" opacity={0.7} />
                    {/* Clickable hit area */}
                    <path
                      d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="12"
                      className="cursor-pointer pointer-events-auto"
                      onClick={() => {
                        if (confirm("¿Eliminar esta conexión?")) deleteEdge(edge.id);
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
              return (
                <div
                  key={node.id}
                  className={`absolute flex items-center gap-2 px-3 py-2 rounded-lg border-2 shadow-sm cursor-grab active:cursor-grabbing select-none transition-shadow ${nt.bg} ${
                    isSelected ? "ring-2 ring-primary shadow-md" : ""
                  } ${connecting ? "cursor-pointer hover:ring-2 hover:ring-primary" : ""}`}
                  style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 2, minWidth: 160 }}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  onDoubleClick={() => { setEditingNode(node); setNodeDialog(true); }}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${nt.bg}`}>
                    <Icon className={`h-4 w-4 ${nt.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{node.label}</p>
                    <p className="text-[10px] text-muted-foreground">{nt.label}</p>
                  </div>
                </div>
              );
            })}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Agrega nodos desde la paleta superior</p>
              </div>
            )}
          </div>
        </Card>

        {/* Properties panel */}
        <Card className="border shadow-sm h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Propiedades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedNodeData ? (
              <>
                <div>
                  <Label className="text-xs">Etiqueta</Label>
                  <Input
                    value={selectedNodeData.label}
                    onChange={(e) => {
                      setNodes((prev) => prev.map((n) => n.id === selectedNode ? { ...n, label: e.target.value } : n));
                      setHasChanges(true);
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Badge variant="outline" className="mt-1">{NODE_TYPES[selectedNodeData.type]?.label}</Badge>
                </div>

                {selectedNodeData.type === "email" && (
                  <div>
                    <Label className="text-xs">Plantilla de email</Label>
                    <Input
                      value={selectedNodeData.config.template_key || ""}
                      onChange={(e) => {
                        setNodes((prev) => prev.map((n) =>
                          n.id === selectedNode ? { ...n, config: { ...n.config, template_key: e.target.value } } : n
                        ));
                        setHasChanges(true);
                      }}
                      placeholder="welcome_user"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                )}

                {selectedNodeData.type === "whatsapp" && (
                  <div>
                    <Label className="text-xs">Evento WhatsApp</Label>
                    <Input
                      value={selectedNodeData.config.event_type || ""}
                      onChange={(e) => {
                        setNodes((prev) => prev.map((n) =>
                          n.id === selectedNode ? { ...n, config: { ...n.config, event_type: e.target.value } } : n
                        ));
                        setHasChanges(true);
                      }}
                      placeholder="new_demo"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                )}

                {selectedNodeData.type === "delay" && (
                  <div>
                    <Label className="text-xs">Minutos de espera</Label>
                    <Input
                      type="number"
                      value={selectedNodeData.config.delay_minutes || 0}
                      onChange={(e) => {
                        setNodes((prev) => prev.map((n) =>
                          n.id === selectedNode ? { ...n, config: { ...n.config, delay_minutes: parseInt(e.target.value) } } : n
                        ));
                        setHasChanges(true);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                {selectedNodeData.type === "condition" && (
                  <div>
                    <Label className="text-xs">Expresión</Label>
                    <Textarea
                      value={selectedNodeData.config.expression || ""}
                      onChange={(e) => {
                        setNodes((prev) => prev.map((n) =>
                          n.id === selectedNode ? { ...n, config: { ...n.config, expression: e.target.value } } : n
                        ));
                        setHasChanges(true);
                      }}
                      rows={3}
                      className="text-xs font-mono"
                      placeholder="data.status === 'approved'"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setConnecting(selectedNode)}>
                    <MoveHorizontal className="h-3 w-3 mr-1" />Conectar
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => deleteNode(selectedNodeData.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <MousePointer className="h-6 w-6 mx-auto mb-2 opacity-30" />
                Selecciona un nodo para ver sus propiedades
              </div>
            )}

            <div className="border-t pt-3 mt-3">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-2">Resumen del flujo</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{nodes.length} nodos · {edges.length} conexiones</p>
                <p>Disparador: {TRIGGER_EVENTS.find((e) => e.value === flow.trigger_event)?.label}</p>
                <p>{flow.run_count} ejecuciones totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
