import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";

const categories = ["general", "producto", "facturación", "soporte", "precios", "instalación"];
const defaultForm = { question: "", answer: "", category: "general", page_slug: "global", is_active: true, sort_order: 0 };

export default function DynamicFAQsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [filterCat, setFilterCat] = useState("all");

  const { data: faqs = [] } = useQuery({
    queryKey: ["admin_dynamic_faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dynamic_faqs").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = filterCat === "all" ? faqs : faqs.filter((f: any) => f.category === filterCat);

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (f: any) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category, page_slug: f.page_slug || "global", is_active: f.is_active, sort_order: f.sort_order });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("dynamic_faqs").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dynamic_faqs").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "FAQ actualizada" : "FAQ creada");
      queryClient.invalidateQueries({ queryKey: ["admin_dynamic_faqs"] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dynamic_faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FAQ eliminada");
      queryClient.invalidateQueries({ queryKey: ["admin_dynamic_faqs"] });
    },
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          Preguntas Frecuentes ({faqs.length})
        </h3>
        <div className="flex gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Nueva FAQ</Button>
        </div>
      </div>

      <div className="grid gap-2">
        {filtered.map((f: any) => (
          <Card key={f.id} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{f.question}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.answer}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs capitalize">{f.category}</Badge>
                  <Badge variant="outline" className="text-xs">{f.page_slug}</Badge>
                  {!f.is_active && <Badge variant="destructive" className="text-xs">Inactiva</Badge>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) deleteMutation.mutate(f.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar FAQ" : "Nueva FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pregunta *</Label>
              <Input value={form.question} onChange={e => set("question", e.target.value)} />
            </div>
            <div>
              <Label>Respuesta *</Label>
              <Textarea value={form.answer} onChange={e => set("answer", e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={v => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Página</Label>
                <Input value={form.page_slug} onChange={e => set("page_slug", e.target.value)} placeholder="global" />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
                <Label>Activa</Label>
              </div>
              <div className="w-20">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.question || !form.answer || saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
