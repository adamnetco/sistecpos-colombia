import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail, Plus, Pencil, Trash2, Eye, Search,
  Send, Copy, Code2, Variable, Tag,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  template_key: string;
  template_label: string;
  subject: string;
  body_html: string;
  category: string;
  variables: string[];
  is_active: boolean;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  auth: { label: "Autenticación", emoji: "🔐", color: "bg-blue-500/10 text-blue-700" },
  license: { label: "Licencias", emoji: "🔑", color: "bg-green-500/10 text-green-700" },
  support: { label: "Soporte", emoji: "🎫", color: "bg-purple-500/10 text-purple-700" },
  demo: { label: "Demos", emoji: "🧪", color: "bg-amber-500/10 text-amber-700" },
  payment: { label: "Pagos", emoji: "💳", color: "bg-emerald-500/10 text-emerald-700" },
  reseller: { label: "Socios", emoji: "🤝", color: "bg-indigo-500/10 text-indigo-700" },
  system: { label: "Sistema", emoji: "⚙️", color: "bg-gray-500/10 text-gray-700" },
};

export default function EmailTemplatesView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const filtered = useMemo(() => {
    let result = templates;
    if (filterCat !== "all") result = result.filter((t) => t.category === filterCat);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.template_label.toLowerCase().includes(q) ||
        t.template_key.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, search, filterCat]);

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("email_templates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["email_templates"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email_templates"] });
      toast.success("Plantilla eliminada");
    },
  });

  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return Array.from(cats);
  }, [templates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Plantillas de Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Personaliza todos los correos que envía el sistema
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const count = templates.filter((t) => t.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilterCat(filterCat === key ? "all" : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                filterCat === key ? cfg.color + " border-current font-semibold" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar plantilla..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando plantillas...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.system;
            return (
              <Card key={t.id} className="border shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${cat.color}`}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{t.template_label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{t.template_key}</Badge>
                      <Badge variant="secondary" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                      {!t.is_active && <Badge variant="secondary">Inactiva</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      <strong>Asunto:</strong> {t.subject}
                    </p>
                    {t.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.variables.map((v) => (
                          <span key={v} className="inline-flex items-center gap-0.5 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                            <Variable className="h-2.5 w-2.5" />{`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: t.id, is_active: v })}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewing(t)} title="Previsualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      if (confirm(`¿Eliminar "${t.template_label}"?`)) deleteMut.mutate(t.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron plantillas
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Dialog */}
      {(editing || creating) && (
        <EmailTemplateDialog
          template={editing}
          open
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}

      {/* Preview Dialog */}
      {previewing && (
        <Dialog open onOpenChange={() => setPreviewing(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vista Previa: {previewing.template_label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Asunto</p>
                <p className="font-medium">{previewing.subject}</p>
              </div>
              <div className="border rounded-lg p-4 bg-card">
                <div dangerouslySetInnerHTML={{ __html: previewing.body_html }} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ─── Template Dialog ─── */
function EmailTemplateDialog({ template, open, onClose }: { template: EmailTemplate | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!template;
  const [activeTab, setActiveTab] = useState("content");

  const [form, setForm] = useState({
    template_key: template?.template_key || "",
    template_label: template?.template_label || "",
    subject: template?.subject || "",
    body_html: template?.body_html || "",
    category: template?.category || "system",
    variables: template?.variables?.join(", ") || "",
    notes: template?.notes || "",
  });

  const save = async () => {
    if (!form.template_key || !form.template_label || !form.subject) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    const payload = {
      ...form,
      variables: form.variables.split(",").map((v) => v.trim()).filter(Boolean),
    };
    if (isEdit) {
      const { error } = await supabase.from("email_templates").update(payload).eq("id", template.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("email_templates").insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    qc.invalidateQueries({ queryKey: ["email_templates"] });
    toast.success(isEdit ? "Plantilla actualizada" : "Plantilla creada");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Plantilla" : "Nueva Plantilla de Email"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="content" className="gap-1"><Mail className="h-3.5 w-3.5" />Contenido</TabsTrigger>
            <TabsTrigger value="code" className="gap-1"><Code2 className="h-3.5 w-3.5" />HTML</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1"><Eye className="h-3.5 w-3.5" />Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Etiqueta</Label>
                <Input value={form.template_label} onChange={(e) => setForm((p) => ({ ...p, template_label: e.target.value }))} placeholder="Bienvenida usuario" />
              </div>
              <div>
                <Label>Clave (única)</Label>
                <Input value={form.template_key} onChange={(e) => setForm((p) => ({ ...p, template_key: e.target.value }))} placeholder="welcome_user" disabled={isEdit} className="font-mono" />
              </div>
            </div>
            <div>
              <Label>Asunto del correo</Label>
              <Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Bienvenido a SistecPOS" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variables (separadas por coma)</Label>
                <Input value={form.variables} onChange={(e) => setForm((p) => ({ ...p, variables: e.target.value }))} placeholder="name, email, role" className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <Label>Notas internas</Label>
              <Input value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Opcional" />
            </div>
          </TabsContent>

          <TabsContent value="code">
            <div>
              <Label>Cuerpo HTML</Label>
              <Textarea
                value={form.body_html}
                onChange={(e) => setForm((p) => ({ ...p, body_html: e.target.value }))}
                rows={16}
                className="font-mono text-xs"
                placeholder="<h1>Hola {{name}}</h1>"
              />
              <p className="text-xs text-muted-foreground mt-2">Usa {"{{variable}}"} para insertar datos dinámicos.</p>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-lg p-4 bg-card min-h-[200px]">
              <div className="mb-3 bg-muted rounded p-2">
                <p className="text-xs text-muted-foreground">Asunto: <strong>{form.subject || "(sin asunto)"}</strong></p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: form.body_html || "<p class='text-muted-foreground'>Sin contenido aún</p>" }} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>{isEdit ? "Guardar" : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
