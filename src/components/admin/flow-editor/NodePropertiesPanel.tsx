import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Copy, Trash2, MoveHorizontal, ExternalLink,
  Mail, MessageCircle,
} from "lucide-react";
import { FlowNode, FlowEdge, NODE_TYPES, TRIGGER_EVENTS } from "./types";

/* ─── Cached selectors ─── */
let cachedEmailTemplates: { key: string; label: string; category: string }[] | null = null;
let cachedWATemplates: { event_type: string; event_label: string; provider_name: string | null }[] | null = null;

function useEmailTemplates() {
  const [templates, setTemplates] = useState(cachedEmailTemplates || []);
  useEffect(() => {
    if (cachedEmailTemplates) return;
    supabase.from("email_templates").select("template_key, template_label, category").eq("is_active", true).order("category").order("sort_order")
      .then(({ data }) => {
        const t = (data || []).map((d: any) => ({ key: d.template_key, label: d.template_label, category: d.category }));
        cachedEmailTemplates = t;
        setTemplates(t);
      });
  }, []);
  return templates;
}

function useWATemplates() {
  const [templates, setTemplates] = useState(cachedWATemplates || []);
  useEffect(() => {
    if (cachedWATemplates) return;
    supabase.from("whatsapp_templates").select("event_type, event_label, provider_name").eq("is_active", true).order("event_type")
      .then(({ data }) => {
        const t = (data || []).map((d: any) => ({ event_type: d.event_type, event_label: d.event_label, provider_name: d.provider_name }));
        cachedWATemplates = t;
        setTemplates(t);
      });
  }, []);
  return templates;
}

/* ─── Node Properties ─── */
export function NodeProperties({ node, onUpdate, onConnect, onDuplicate, onDelete }: {
  node: FlowNode;
  onUpdate: (n: FlowNode) => void;
  onConnect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const emailTemplates = useEmailTemplates();
  const waTemplates = useWATemplates();
  const nt = NODE_TYPES[node.type];

  const updateConfig = (key: string, value: any) => {
    onUpdate({ ...node, config: { ...node.config, [key]: value } });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${nt?.bg} ${nt?.border} border`}>
          <span className={`text-xs font-bold ${nt?.color}`}>{node.type[0].toUpperCase()}</span>
        </div>
        <div>
          <p className="text-sm font-semibold">{nt?.label}</p>
          <p className="text-[10px] text-muted-foreground">ID: {node.id}</p>
        </div>
      </div>

      <Separator />

      {/* Label */}
      <div>
        <Label className="text-xs font-medium">Nombre del nodo</Label>
        <Input
          value={node.label}
          onChange={(e) => onUpdate({ ...node, label: e.target.value })}
          className="h-8 text-sm mt-1"
        />
      </div>

      {/* Description (all node types) */}
      <div>
        <Label className="text-xs font-medium">Descripción</Label>
        <Textarea
          value={node.config.description || ""}
          onChange={(e) => updateConfig("description", e.target.value)}
          rows={2}
          className="text-xs mt-1"
          placeholder="Describe qué hace este nodo..."
        />
      </div>

      <Separator />

      {/* Type-specific fields */}
      {node.type === "trigger" && (
        <TriggerFields node={node} onUpdate={onUpdate} />
      )}

      {node.type === "email" && (
        <EmailFields node={node} updateConfig={updateConfig} templates={emailTemplates} />
      )}

      {node.type === "whatsapp" && (
        <WhatsAppFields node={node} updateConfig={updateConfig} templates={waTemplates} />
      )}

      {node.type === "delay" && (
        <DelayFields node={node} updateConfig={updateConfig} />
      )}

      {node.type === "condition" && (
        <ConditionFields node={node} updateConfig={updateConfig} />
      )}

      {node.type === "action" && (
        <ActionFields node={node} updateConfig={updateConfig} />
      )}

      <Separator />

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onConnect}>
          <MoveHorizontal className="h-3 w-3" />Conectar
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onDuplicate}>
          <Copy className="h-3 w-3" />Duplicar
        </Button>
        <Button variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive/10 gap-1" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />Eliminar
        </Button>
      </div>
    </div>
  );
}

/* ─── Trigger Fields ─── */
function TriggerFields({ node, onUpdate }: { node: FlowNode; onUpdate: (n: FlowNode) => void }) {
  return (
    <div>
      <Label className="text-xs font-medium">Evento disparador</Label>
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
        <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
        <SelectContent>
          {TRIGGER_EVENTS.map((e) => (
            <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ─── Email Fields ─── */
function EmailFields({ node, updateConfig, templates }: {
  node: FlowNode;
  updateConfig: (k: string, v: any) => void;
  templates: { key: string; label: string; category: string }[];
}) {
  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof templates>);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-blue-600">
        <Mail className="h-3.5 w-3.5" />
        <span className="font-medium">Configuración de Email</span>
      </div>

      <div>
        <Label className="text-xs font-medium">Plantilla de email</Label>
        <Select
          value={node.config.template_key || ""}
          onValueChange={(v) => updateConfig("template_key", v)}
        >
          <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Seleccionar plantilla" /></SelectTrigger>
          <SelectContent>
            {Object.entries(grouped).map(([cat, tpls]) => (
              <div key={cat}>
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase">{cat}</div>
                {tpls.map(t => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        {!node.config.template_key && (
          <p className="text-[10px] text-amber-600 mt-1">⚠ Sin plantilla asignada</p>
        )}
      </div>

      <div>
        <Label className="text-xs font-medium">Asunto personalizado <span className="text-muted-foreground">(opcional)</span></Label>
        <Input
          value={node.config.subject || ""}
          onChange={(e) => updateConfig("subject", e.target.value)}
          placeholder="Usa plantilla o escribe aquí"
          className="h-8 text-sm mt-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium">Destinatario</Label>
        <Input
          value={node.config.recipient || ""}
          onChange={(e) => updateConfig("recipient", e.target.value)}
          placeholder="{{email}} o correo fijo"
          className="h-8 text-sm font-mono mt-1"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Variables: {"{{email}}"}, {"{{name}}"}, {"{{business_name}}"}
        </p>
      </div>
    </div>
  );
}

/* ─── WhatsApp Fields ─── */
function WhatsAppFields({ node, updateConfig, templates }: {
  node: FlowNode;
  updateConfig: (k: string, v: any) => void;
  templates: { event_type: string; event_label: string; provider_name: string | null }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-green-600">
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="font-medium">Configuración de WhatsApp</span>
      </div>

      <div>
        <Label className="text-xs font-medium">Plantilla WhatsApp</Label>
        <Select
          value={node.config.event_type || node.config.template || ""}
          onValueChange={(v) => {
            const tpl = templates.find(t => t.event_type === v);
            updateConfig("event_type", v);
            if (tpl?.provider_name) updateConfig("provider", tpl.provider_name);
          }}
        >
          <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Seleccionar evento" /></SelectTrigger>
          <SelectContent>
            {templates.map(t => (
              <SelectItem key={t.event_type} value={t.event_type}>
                <div className="flex items-center gap-2">
                  <span>{t.event_label}</span>
                  {t.provider_name && (
                    <Badge variant="outline" className="text-[9px] h-4">{t.provider_name}</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium">Proveedor</Label>
        <Input
          value={node.config.provider || ""}
          onChange={(e) => updateConfig("provider", e.target.value)}
          placeholder="callmebot (auto)"
          className="h-8 text-sm font-mono mt-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium">Teléfono destino <span className="text-muted-foreground">(opcional)</span></Label>
        <Input
          value={node.config.phone || ""}
          onChange={(e) => updateConfig("phone", e.target.value)}
          placeholder="{{phone}} o número fijo"
          className="h-8 text-sm font-mono mt-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium">Variables adicionales <span className="text-muted-foreground">(JSON)</span></Label>
        <Textarea
          value={node.config.variables ? JSON.stringify(node.config.variables, null, 2) : ""}
          onChange={(e) => {
            try { updateConfig("variables", JSON.parse(e.target.value)); } catch {}
          }}
          rows={3}
          className="text-xs font-mono mt-1"
          placeholder='{"ticket_subject": "{{subject}}"}'
        />
      </div>
    </div>
  );
}

/* ─── Delay Fields ─── */
function DelayFields({ node, updateConfig }: { node: FlowNode; updateConfig: (k: string, v: any) => void }) {
  const minutes = node.config.delay_minutes || 0;
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium">Tiempo de espera</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div>
            <Label className="text-[10px] text-muted-foreground">Días</Label>
            <Input
              type="number"
              value={Math.floor(minutes / 1440)}
              onChange={(e) => {
                const days = parseInt(e.target.value) || 0;
                const remainingMinutes = minutes % 1440;
                updateConfig("delay_minutes", days * 1440 + remainingMinutes);
              }}
              className="h-8 text-sm"
              min={0}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Horas</Label>
            <Input
              type="number"
              value={Math.floor((minutes % 1440) / 60)}
              onChange={(e) => {
                const hours = parseInt(e.target.value) || 0;
                const days = Math.floor(minutes / 1440);
                const mins = minutes % 60;
                updateConfig("delay_minutes", days * 1440 + hours * 60 + mins);
              }}
              className="h-8 text-sm"
              min={0}
              max={23}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Minutos</Label>
            <Input
              type="number"
              value={minutes % 60}
              onChange={(e) => {
                const mins = parseInt(e.target.value) || 0;
                const days = Math.floor(minutes / 1440);
                const hours = Math.floor((minutes % 1440) / 60);
                updateConfig("delay_minutes", days * 1440 + hours * 60 + mins);
              }}
              className="h-8 text-sm"
              min={0}
              max={59}
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Total: {minutes} min = {(minutes / 60).toFixed(1)}h = {(minutes / 1440).toFixed(1)} días
        </p>
      </div>
    </div>
  );
}

/* ─── Condition Fields ─── */
function ConditionFields({ node, updateConfig }: { node: FlowNode; updateConfig: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium">Expresión condicional</Label>
        <Textarea
          value={node.config.expression || ""}
          onChange={(e) => updateConfig("expression", e.target.value)}
          rows={3}
          className="text-xs font-mono mt-1"
          placeholder="data.status === 'approved'"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Accede a datos del evento con <code className="bg-muted px-1 rounded">data.*</code>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs font-medium text-green-600">Rama Verdadera</Label>
          <Input
            value={node.config.true_label || ""}
            onChange={(e) => updateConfig("true_label", e.target.value)}
            placeholder="Sí"
            className="h-8 text-sm mt-1"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-red-600">Rama Falsa</Label>
          <Input
            value={node.config.false_label || ""}
            onChange={(e) => updateConfig("false_label", e.target.value)}
            placeholder="No"
            className="h-8 text-sm mt-1"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Action Fields ─── */
function ActionFields({ node, updateConfig }: { node: FlowNode; updateConfig: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium">Nombre de acción</Label>
        <Input
          value={node.config.action_name || ""}
          onChange={(e) => updateConfig("action_name", e.target.value)}
          placeholder="update_status, create_user..."
          className="h-8 text-sm font-mono mt-1"
        />
      </div>
      <div>
        <Label className="text-xs font-medium">Edge Function</Label>
        <Input
          value={node.config.edge_function || ""}
          onChange={(e) => updateConfig("edge_function", e.target.value)}
          placeholder="create-user-admin"
          className="h-8 text-sm font-mono mt-1"
        />
      </div>
      <div>
        <Label className="text-xs font-medium">Payload (JSON)</Label>
        <Textarea
          value={node.config.payload || ""}
          onChange={(e) => updateConfig("payload", e.target.value)}
          rows={4}
          className="text-xs font-mono mt-1"
          placeholder='{"key": "{{variable}}"}'
        />
      </div>
    </div>
  );
}

/* ─── Edge Properties ─── */
export function EdgeProperties({ edge, nodes, onUpdate, onDelete }: {
  edge: FlowEdge;
  nodes: FlowNode[];
  onUpdate: (e: FlowEdge) => void;
  onDelete: () => void;
}) {
  const srcNode = nodes.find(n => n.id === edge.source);
  const tgtNode = nodes.find(n => n.id === edge.target);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/50 p-3 space-y-2">
        <p className="text-xs font-semibold">Conexión</p>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">{srcNode?.label || edge.source}</Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="outline" className="text-[10px]">{tgtNode?.label || edge.target}</Badge>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium">Etiqueta</Label>
        <Input
          value={edge.label || ""}
          onChange={(e) => onUpdate({ ...edge, label: e.target.value || undefined })}
          placeholder="Sí, No, Éxito, Error..."
          className="h-8 text-sm mt-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium">Condición <span className="text-muted-foreground">(opcional)</span></Label>
        <Textarea
          value={edge.condition || ""}
          onChange={(e) => onUpdate({ ...edge, condition: e.target.value || undefined })}
          placeholder="status === 'approved'"
          className="text-xs font-mono mt-1"
          rows={2}
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Conexiones con condición se muestran punteadas
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs text-destructive hover:bg-destructive/10 gap-1"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" /> Eliminar conexión
      </Button>
    </div>
  );
}
