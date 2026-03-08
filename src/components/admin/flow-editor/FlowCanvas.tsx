import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Workflow, Pencil, Save, X,
  Zap, Mail, MessageCircle, Clock, GitBranch, Settings2,
  MoveHorizontal, MousePointer, RotateCcw, ZoomIn, ZoomOut,
  ChevronLeft, AlertCircle, Info,
} from "lucide-react";
import { FlowNode, FlowEdge, NotificationFlow, NODE_TYPES, TRIGGER_EVENTS } from "./types";
import { NodeProperties, EdgeProperties } from "./NodePropertiesPanel";

const ICON_MAP: Record<string, any> = {
  Zap, Mail, MessageCircle, Clock, GitBranch, Settings2,
};

const DRAG_THRESHOLD = 5;

/* ─── Canvas Wrapper (loads flow) ─── */
export function FlowCanvasWrapper({ flowId, onBack }: { flowId: string; onBack: () => void }) {
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
        nodes: (data.nodes || []) as unknown as FlowNode[],
        edges: (data.edges || []) as unknown as FlowEdge[],
      } as NotificationFlow;
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <Workflow className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Cargando flujo...</p>
        </div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
        <p className="text-destructive text-sm">Error al cargar el flujo</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onBack}>Volver</Button>
      </div>
    );
  }

  return <FlowCanvasEditor flow={flow} onBack={onBack} />;
}

/* ─── Main Canvas Editor ─── */
function FlowCanvasEditor({ flow, onBack }: { flow: NotificationFlow; onBack: () => void }) {
  const qc = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);

  // State
  const [nodes, setNodes] = useState<FlowNode[]>(flow.nodes);
  const [edges, setEdges] = useState<FlowEdge[]>(flow.edges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Flow metadata
  const [flowName, setFlowName] = useState(flow.name);
  const [flowDescription, setFlowDescription] = useState(flow.description || "");
  const [flowTrigger, setFlowTrigger] = useState(flow.trigger_event);
  const [flowActive, setFlowActive] = useState(flow.is_active);
  const [editingName, setEditingName] = useState(false);
  const [showMetaPanel, setShowMetaPanel] = useState(false);

  // ── Node operations ──
  const addNode = (type: FlowNode["type"]) => {
    const nt = NODE_TYPES[type];
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      label: nt.label,
      x: 250 + Math.random() * 200,
      y: 100 + Math.random() * 300,
      config: {},
    };
    setNodes(prev => [...prev, newNode]);
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
      y: original.y + 50,
      label: `${original.label} (copia)`,
      config: { ...original.config },
    };
    setNodes(prev => [...prev, dup]);
    setHasChanges(true);
    setSelectedNode(dup.id);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setSelectedNode(null);
    setHasChanges(true);
  };

  const deleteEdge = (id: string) => {
    setEdges(prev => prev.filter(e => e.id !== id));
    setSelectedEdge(null);
    setHasChanges(true);
  };

  // ── Drag logic ──
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdge(null);

    if (connecting) {
      if (connecting !== nodeId) {
        setEdges(prev => [...prev, {
          id: `edge-${Date.now()}`,
          source: connecting,
          target: nodeId,
        }]);
        setHasChanges(true);
      }
      setConnecting(null);
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNode(nodeId);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);

    const rect = canvasRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left || 0) - node.x * zoom,
      y: e.clientY - (rect?.top || 0) - node.y * zoom,
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStartPos || !canvasRef.current) return;

    if (!hasDragged) {
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      setHasDragged(true);
      if (selectedNode) setDragging(selectedNode);
    }

    if (!dragging && !hasDragged) return;
    const activeId = dragging || selectedNode;
    if (!activeId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, (e.clientX - rect.left - dragOffset.x) / zoom);
    const y = Math.max(0, (e.clientY - rect.top - dragOffset.y) / zoom);
    setNodes(prev => prev.map(n => n.id === activeId ? { ...n, x, y } : n));
    setHasChanges(true);
  }, [dragStartPos, hasDragged, dragging, selectedNode, dragOffset, zoom]);

  const handleMouseUp = () => {
    setDragging(null);
    setDragStartPos(null);
    setHasDragged(false);
  };

  const startConnect = (nodeId: string) => {
    setConnecting(nodeId);
    toast.info("Haz clic en el nodo destino", { duration: 2500 });
  };

  // ── Auto-layout ──
  const autoLayout = () => {
    const triggers = nodes.filter(n => n.type === "trigger");
    const others = nodes.filter(n => n.type !== "trigger");
    const all = [...triggers, ...others];
    setNodes(all.map((n, i) => ({
      ...n,
      x: 80 + (i % 3) * 240,
      y: 60 + Math.floor(i / 3) * 140,
    })));
    setHasChanges(true);
  };

  // ── Save ──
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
    toast.success("Flujo guardado correctamente");
    setHasChanges(false);
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges) saveFlow();
      }
      if (e.key === "Delete" && selectedNode) {
        deleteNode(selectedNode);
      }
      if (e.key === "Escape") {
        setConnecting(null);
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasChanges, selectedNode]);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const selectedEdgeData = edges.find(e => e.id === selectedEdge);
  const triggerLabel = TRIGGER_EVENTS.find(e => e.value === flowTrigger)?.label || flowTrigger;

  return (
    <div className="space-y-3">
      {/* ── Top Toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-card border rounded-lg px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {editingName ? (
            <Input
              value={flowName}
              onChange={(e) => { setFlowName(e.target.value); setHasChanges(true); }}
              className="h-8 text-sm font-bold w-56"
              autoFocus
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <h2 className="font-bold text-base">{flowName}</h2>
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={flowActive}
              onCheckedChange={(v) => { setFlowActive(v); setHasChanges(true); }}
            />
            <Badge
              variant="outline"
              className={`text-[10px] ${flowActive ? "border-green-300 text-green-700 dark:text-green-400" : ""}`}
            >
              {flowActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowMetaPanel(!showMetaPanel)}
            title="Info del flujo"
          >
            <Info className="h-3.5 w-3.5" />
          </Button>

          {connecting && (
            <Badge variant="outline" className="gap-1 text-primary animate-pulse text-xs">
              <MoveHorizontal className="h-3 w-3" />
              Conectando...
              <button onClick={() => setConnecting(null)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {hasChanges && <Badge variant="outline" className="text-amber-600 text-[10px]">Sin guardar</Badge>}

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button size="sm" variant="outline" onClick={autoLayout} title="Auto-organizar" className="h-7 px-2">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button size="sm" onClick={saveFlow} disabled={!hasChanges} className="h-7 gap-1.5 px-3">
            <Save className="h-3.5 w-3.5" />Guardar
          </Button>
        </div>
      </div>

      {/* Meta panel */}
      {showMetaPanel && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 grid sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium">Descripción</Label>
              <Input
                value={flowDescription}
                onChange={(e) => { setFlowDescription(e.target.value); setHasChanges(true); }}
                className="h-8 text-sm mt-1"
                placeholder="Describe el propósito..."
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Evento disparador</Label>
              <Select value={flowTrigger} onValueChange={(v) => { setFlowTrigger(v); setHasChanges(true); }}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map(e => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4 text-xs text-muted-foreground">
              <div>
                <p className="font-medium">{flow.run_count}</p>
                <p>Ejecuciones</p>
              </div>
              {flow.last_run_at && (
                <div>
                  <p className="font-medium">{new Date(flow.last_run_at).toLocaleDateString()}</p>
                  <p>Última ejecución</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Node Palette ── */}
      <div className="flex gap-1.5 flex-wrap bg-card border rounded-lg px-3 py-2 shadow-sm">
        <span className="text-xs text-muted-foreground font-medium self-center mr-1">Agregar:</span>
        {Object.entries(NODE_TYPES).map(([type, cfg]) => {
          const Icon = ICON_MAP[cfg.iconName] || Settings2;
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={`gap-1.5 h-7 text-xs ${cfg.color} hover:${cfg.bg}`}
              onClick={() => addNode(type as FlowNode["type"])}
            >
              <Icon className="h-3 w-3" />
              {cfg.label}
            </Button>
          );
        })}
      </div>

      {/* ── Main Canvas + Properties ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-3" style={{ minHeight: "calc(100vh - 340px)" }}>
        {/* Canvas */}
        <Card className="border shadow-sm overflow-hidden">
          <div
            ref={canvasRef}
            className={`relative min-h-[550px] overflow-auto ${
              connecting ? "cursor-crosshair" : "cursor-default"
            }`}
            style={{
              background: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            }}
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
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0", position: "relative", minWidth: 800, minHeight: 500 }}>
              {/* SVG Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1, minWidth: 800, minHeight: 500 }}>
                {edges.map(edge => {
                  const src = nodes.find(n => n.id === edge.source);
                  const tgt = nodes.find(n => n.id === edge.target);
                  if (!src || !tgt) return null;
                  const sx = src.x + 90;
                  const sy = src.y + 28;
                  const tx = tgt.x;
                  const ty = tgt.y + 28;
                  const mx = (sx + tx) / 2;
                  const isSelected = selectedEdge === edge.id;

                  return (
                    <g key={edge.id}>
                      <path
                        d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                        fill="none"
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={isSelected ? "2.5" : "1.5"}
                        strokeDasharray={edge.condition ? "6 3" : "none"}
                        opacity={isSelected ? 1 : 0.4}
                      />
                      <circle cx={tx} cy={ty} r="3.5" fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} opacity={0.6} />
                      {/* Clickable hit area */}
                      <path
                        d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="16"
                        className="cursor-pointer pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEdge(edge.id);
                          setSelectedNode(null);
                        }}
                      />
                      {edge.label && (
                        <foreignObject x={mx - 40} y={(sy + ty) / 2 - 14} width="80" height="20">
                          <div className="flex items-center justify-center">
                            <span className="text-[9px] bg-card/90 border rounded px-1.5 py-0.5 text-muted-foreground font-medium shadow-sm">
                              {edge.label}
                            </span>
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map(node => {
                const nt = NODE_TYPES[node.type] || NODE_TYPES.action;
                const Icon = ICON_MAP[nt.iconName] || Settings2;
                const isSelected = selectedNode === node.id;
                const isConnectSource = connecting === node.id;

                return (
                  <div
                    key={node.id}
                    className={`absolute flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 shadow-sm select-none transition-all
                      ${nt.bg} ${nt.border}
                      ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" : ""}
                      ${isConnectSource ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-lg" : ""}
                      ${connecting && !isConnectSource ? "hover:ring-2 hover:ring-primary cursor-crosshair" : "cursor-grab active:cursor-grabbing"}
                    `}
                    style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 2, minWidth: 180 }}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${nt.bg} border ${nt.border}`}>
                      <Icon className={`h-4.5 w-4.5 ${nt.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{node.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{nt.label}</p>
                      {node.config.template_key && (
                        <p className="text-[9px] text-muted-foreground/70 font-mono truncate">{node.config.template_key}</p>
                      )}
                      {node.config.event_type && (
                        <p className="text-[9px] text-muted-foreground/70 font-mono truncate">{node.config.event_type}</p>
                      )}
                    </div>

                    {/* Connection point */}
                    <div
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-background border-2 border-primary/40 hover:border-primary hover:bg-primary/20 cursor-crosshair transition-all flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startConnect(node.id);
                      }}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary/50" />
                    </div>
                    {/* Left connection point */}
                    <div
                      className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-background border-2 border-muted-foreground/30 cursor-crosshair flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (connecting && connecting !== node.id) {
                          setEdges(prev => [...prev, {
                            id: `edge-${Date.now()}`,
                            source: connecting,
                            target: node.id,
                          }]);
                          setHasChanges(true);
                          setConnecting(null);
                        }
                      }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </div>
                  </div>
                );
              })}

              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Workflow className="h-10 w-10 mx-auto text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Agrega nodos desde la paleta</p>
                    <p className="text-xs text-muted-foreground/50">o usa Ctrl+S para guardar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ── Properties Sidebar ── */}
        <Card className="border shadow-sm h-fit lg:sticky lg:top-4">
          <CardHeader className="pb-2 px-4 pt-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" />
              Propiedades
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ScrollArea className="max-h-[calc(100vh-420px)]">
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
                  onConnect={() => startConnect(selectedNodeData.id)}
                  onDuplicate={() => duplicateNode(selectedNodeData.id)}
                  onDelete={() => deleteNode(selectedNodeData.id)}
                />
              ) : (
                <div className="py-8 text-center space-y-3">
                  <MousePointer className="h-8 w-8 mx-auto text-muted-foreground/20" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Selecciona un elemento</p>
                    <p className="text-[10px] text-muted-foreground/60">Haz clic en un nodo o conexión</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="text-left space-y-2">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Resumen</p>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Nodos</span><span className="font-mono">{nodes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conexiones</span><span className="font-mono">{edges.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disparador</span><span className="truncate ml-2">{triggerLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ejecuciones</span><span className="font-mono">{flow.run_count}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="text-left space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Atajos</p>
                    <div className="space-y-1 text-[10px] text-muted-foreground">
                      <p><kbd className="bg-muted px-1 rounded text-[9px]">Ctrl+S</kbd> Guardar</p>
                      <p><kbd className="bg-muted px-1 rounded text-[9px]">Del</kbd> Eliminar nodo</p>
                      <p><kbd className="bg-muted px-1 rounded text-[9px]">Esc</kbd> Cancelar</p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
