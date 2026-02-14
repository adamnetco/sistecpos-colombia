import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download, ExternalLink } from "lucide-react";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  download_url: string;
  file_type: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function ClientDownloadsView() {
  const { toast } = useToast();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DownloadItem | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_downloads")
      .select("*")
      .order("sort_order");
    setItems((data as DownloadItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || null,
      download_url: fd.get("download_url") as string,
      file_type: fd.get("file_type") as string,
      category: fd.get("category") as string,
      sort_order: Number(fd.get("sort_order")) || 0,
    };

    if (editTarget) {
      const { error } = await supabase.from("client_downloads").update(payload).eq("id", editTarget.id);
      if (error) { toast({ title: "Error", variant: "destructive" }); return; }
      toast({ title: "Descarga actualizada ✅" });
    } else {
      const { error } = await supabase.from("client_downloads").insert(payload);
      if (error) { toast({ title: "Error", variant: "destructive" }); return; }
      toast({ title: "Descarga creada ✅" });
    }
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  const toggleActive = async (item: DownloadItem) => {
    await supabase.from("client_downloads").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta descarga?")) return;
    await supabase.from("client_downloads").delete().eq("id", id);
    toast({ title: "Eliminada" });
    load();
  };

  const openEdit = (item: DownloadItem) => {
    setEditTarget(item);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Descargas para Clientes</h1>
          <p className="text-muted-foreground">Gestiona instaladores, herramientas y enlaces de descarga</p>
        </div>
        <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditTarget(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Descarga</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editTarget ? "Editar" : "Nueva"} Descarga</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Título *</Label><Input name="title" defaultValue={editTarget?.title} required /></div>
              <div><Label>Descripción</Label><Textarea name="description" rows={2} defaultValue={editTarget?.description ?? ""} /></div>
              <div>
                <Label>URL de descarga * (Google Drive, enlace directo, etc.)</Label>
                <Input name="download_url" type="url" placeholder="https://drive.google.com/..." defaultValue={editTarget?.download_url} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo de archivo</Label>
                  <select name="file_type" defaultValue={editTarget?.file_type ?? "installer"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="installer">Instalador</option>
                    <option value="manual">Manual</option>
                    <option value="driver">Driver</option>
                    <option value="tool">Herramienta</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Input name="category" defaultValue={editTarget?.category ?? "general"} placeholder="general" />
                </div>
              </div>
              <div><Label>Orden</Label><Input name="sort_order" type="number" defaultValue={editTarget?.sort_order ?? 0} /></div>
              <Button type="submit" className="w-full">{editTarget ? "Guardar Cambios" : "Crear Descarga"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Download className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay descargas configuradas.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</p>}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell className="capitalize">{item.file_type}</TableCell>
                <TableCell>
                  <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" asChild>
                      <a href={item.download_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
