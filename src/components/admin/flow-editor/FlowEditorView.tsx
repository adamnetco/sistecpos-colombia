import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FlowNode, TRIGGER_EVENTS } from "./types";
import FlowListView from "./FlowListView";
import { FlowCanvasWrapper } from "./FlowCanvas";

export default function FlowEditorView() {
  const qc = useQueryClient();
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (editingFlowId) {
    return (
      <FlowCanvasWrapper
        flowId={editingFlowId}
        onBack={() => {
          setEditingFlowId(null);
          qc.invalidateQueries({ queryKey: ["notification_flows"] });
        }}
      />
    );
  }

  return (
    <>
      <FlowListView
        onEdit={(id) => setEditingFlowId(id)}
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <FlowCreateDialog
          open
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            setEditingFlowId(id);
          }}
        />
      )}
    </>
  );
}

function FlowCreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", trigger_event: "new_lead" });

  const save = async () => {
    if (!form.name) { toast.error("Ingresa un nombre"); return; }
    const triggerNode: FlowNode = {
      id: "trigger-1",
      type: "trigger",
      label: TRIGGER_EVENTS.find(e => e.value === form.trigger_event)?.label || form.trigger_event,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Flujo de Notificación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nombre del flujo</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Bienvenida nuevo lead"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="mt-1"
              placeholder="Describe el propósito de este flujo..."
            />
          </div>
          <div>
            <Label>Evento disparador</Label>
            <Select value={form.trigger_event} onValueChange={(v) => setForm(p => ({ ...p, trigger_event: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_EVENTS.map(e => (
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
