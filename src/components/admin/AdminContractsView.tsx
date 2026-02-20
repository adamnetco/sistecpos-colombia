import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Plus, Search, ExternalLink } from "lucide-react";

interface Contract {
  id: string;
  business_id: string | null;
  contract_type: string;
  title: string;
  signed_at: string | null;
  expires_at: string | null;
  pdf_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  business_name?: string;
}

const typeLabels: Record<string, string> = {
  sla_soporte: "SLA Soporte",
  licencia: "Licencia",
  otro: "Otro",
};

const statusColors: Record<string, string> = {
  active: "bg-green-600 text-white",
  expired: "bg-red-500 text-white",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminContractsView() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contract | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("sla_soporte");
  const [editStatus, setEditStatus] = useState("active");
  const [editNotes, setEditNotes] = useState("");

  // Create fields
  const [newTitle, setNewTitle] = useState("");
  const [newBizId, setNewBizId] = useState("");
  const [newType, setNewType] = useState("sla_soporte");
  const [newSignedAt, setNewSignedAt] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("contracts").select("*").order("created_at", { ascending: false });
    const rows = (data || []) as Contract[];

    const bizIds = [...new Set(rows.filter((r) => r.business_id).map((r) => r.business_id!))];
    if (bizIds.length > 0) {
      const { data: biz } = await supabase.from("businesses").select("id, business_name").in("id", bizIds);
      const map: Record<string, string> = {};
      (biz || []).forEach((b: any) => { map[b.id] = b.business_name; });
      rows.forEach((r) => { if (r.business_id) r.business_name = map[r.business_id]; });
    }

    setContracts(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || (c.business_name?.toLowerCase().includes(q));
  });

  const openEdit = (c: Contract) => {
    setSelected(c);
    setEditTitle(c.title);
    setEditType(c.contract_type);
    setEditStatus(c.status);
    setEditNotes(c.notes || "");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("contracts").update({
      title: editTitle, contract_type: editType, status: editStatus, notes: editNotes || null,
    }).eq("id", selected.id);
    setSaving(false);
    if (error) { toast({ title: "Error", variant: "destructive" }); return; }
    toast({ title: "Contrato actualizado ✅" });
    setSelected(null);
    load();
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast({ title: "Título requerido", variant: "destructive" }); return; }
    setSaving(true);

    let pdf_url: string | null = null;
    if (pdfFile) {
      const path = `${Date.now()}-${pdfFile.name}`;
      const { error: upErr } = await supabase.storage.from("contract-docs").upload(path, pdfFile);
      if (upErr) { toast({ title: "Error subiendo PDF", variant: "destructive" }); setSaving(false); return; }
      pdf_url = path;
    }

    const { error } = await supabase.from("contracts").insert({
      title: newTitle.trim(),
      business_id: newBizId.trim() || null,
      contract_type: newType,
      signed_at: newSignedAt || null,
      expires_at: newExpiresAt || null,
      notes: newNotes || null,
      pdf_url,
      status: "active",
    });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Contrato creado ✅" });
    setShowCreate(false);
    setNewTitle(""); setNewBizId(""); setNewNotes(""); setPdfFile(null);
    load();
  };

  const handleViewPdf = async (path: string) => {
    const { data, error } = await supabase.storage.from("contract-docs").createSignedUrl(path, 300);
    if (error || !data) { toast({ title: "Error generando enlace", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Contratos</h1>
          <p className="text-sm text-muted-foreground">{contracts.length} contratos registrados</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Contrato</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por título o negocio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay contratos.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => openEdit(c)}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-sm">{c.business_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{typeLabels[c.contract_type] || c.contract_type}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[c.status] || "bg-muted"}>{c.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.signed_at ? new Date(c.signed_at).toLocaleDateString("es-CO") : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-CO") : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {c.pdf_url && (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewPdf(c.pdf_url!); }}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">Editar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Editar Contrato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sla_soporte">SLA Soporte</SelectItem>
                  <SelectItem value="licencia">Licencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notas</Label><Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nuevo Contrato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
            <div><Label>Business ID (UUID, opcional)</Label><Input value={newBizId} onChange={(e) => setNewBizId(e.target.value)} placeholder="UUID del negocio" /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sla_soporte">SLA Soporte</SelectItem>
                  <SelectItem value="licencia">Licencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Fecha firma</Label><Input type="date" value={newSignedAt} onChange={(e) => setNewSignedAt(e.target.value)} /></div>
            <div><Label>Fecha vencimiento</Label><Input type="date" value={newExpiresAt} onChange={(e) => setNewExpiresAt(e.target.value)} /></div>
            <div>
              <Label>PDF del contrato</Label>
              <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
            </div>
            <div><Label>Notas</Label><Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} /></div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Creando..." : "Crear Contrato"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
