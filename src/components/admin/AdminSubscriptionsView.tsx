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
import { CreditCard, Plus, Search } from "lucide-react";

interface Subscription {
  id: string;
  business_id: string | null;
  user_id: string;
  plan: string;
  status: string;
  price_cop: number;
  billing_anchor_day: number;
  current_period_start: string | null;
  current_period_end: string | null;
  payment_method: string;
  target_audience: string;
  created_at: string;
  updated_at: string;
  // joined
  business_name?: string;
  user_email?: string;
}

const planLabels: Record<string, string> = {
  autogestion: "Autogestión",
  tranquilidad: "Tranquilidad",
  socio_estrategico: "Socio Estratégico",
};

const audienceLabels: Record<string, { label: string; color: string }> = {
  client: { label: "Clientes", color: "bg-blue-100 text-blue-800" },
  reseller: { label: "Socios", color: "bg-purple-100 text-purple-800" },
  both: { label: "Todos", color: "bg-muted text-muted-foreground" },
};

const statusColors: Record<string, string> = {
  active: "bg-green-600 text-white",
  cancelled: "bg-muted text-muted-foreground",
  past_due: "bg-red-500 text-white",
};

export default function AdminSubscriptionsView() {
  const { toast } = useToast();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAudience, setEditAudience] = useState("both");
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newPlan, setNewPlan] = useState("autogestion");
  const [newPrice, setNewPrice] = useState("0");
  const [newPayment, setNewPayment] = useState("manual");
  const [newAudience, setNewAudience] = useState("both");
  const [filterAudience, setFilterAudience] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("support_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    const rows = (data || []) as Subscription[];

    // Enrich with profile email
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { map[p.user_id] = p.email; });
      rows.forEach((r) => { r.user_email = map[r.user_id] || "—"; });
    }

    // Enrich with business name
    const bizIds = [...new Set(rows.filter((r) => r.business_id).map((r) => r.business_id!))];
    if (bizIds.length > 0) {
      const { data: biz } = await supabase
        .from("businesses")
        .select("id, business_name")
        .in("id", bizIds);
      const bMap: Record<string, string> = {};
      (biz || []).forEach((b: any) => { bMap[b.id] = b.business_name; });
      rows.forEach((r) => { if (r.business_id) r.business_name = bMap[r.business_id]; });
    }

    setSubs(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = subs.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (s.user_email?.toLowerCase().includes(q)) || (s.business_name?.toLowerCase().includes(q)) || s.plan.includes(q);
    const matchAudience = filterAudience === "all" || s.target_audience === filterAudience || s.target_audience === "both";
    return matchSearch && matchAudience;
  });

  const openEdit = (s: Subscription) => {
    setSelected(s);
    setEditPlan(s.plan);
    setEditStatus(s.status);
    setEditPrice(String(s.price_cop));
    setEditAudience(s.target_audience || "both");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("support_subscriptions")
      .update({ plan: editPlan, status: editStatus, price_cop: parseInt(editPrice) || 0, target_audience: editAudience })
      .eq("id", selected.id);
    setSaving(false);
    if (error) { toast({ title: "Error al guardar", variant: "destructive" }); return; }
    toast({ title: "Suscripción actualizada ✅" });
    setSelected(null);
    load();
  };

  const handleCreate = async () => {
    if (!newUserId.trim()) { toast({ title: "User ID requerido", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("support_subscriptions").insert({
      user_id: newUserId.trim(),
      plan: newPlan,
      price_cop: parseInt(newPrice) || 0,
      payment_method: newPayment,
      status: "active",
      target_audience: newAudience,
      billing_anchor_day: new Date().getDate(),
      current_period_start: new Date().toISOString().split("T")[0],
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    });
    setSaving(false);
    if (error) { toast({ title: "Error al crear", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Suscripción creada ✅" });
    setShowCreate(false);
    setNewUserId("");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Suscripciones de Soporte</h1>
          <p className="text-sm text-muted-foreground">{subs.length} suscripciones registradas</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva Suscripción
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por email, negocio o plan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterAudience} onValueChange={setFilterAudience}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Audiencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="client">Solo Clientes</SelectItem>
            <SelectItem value="reseller">Solo Socios</SelectItem>
            <SelectItem value="both">Compartidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay suscripciones.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Audiencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const aud = audienceLabels[s.target_audience] || audienceLabels.both;
                return (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/40" onClick={() => openEdit(s)}>
                    <TableCell className="text-sm">{s.user_email || "—"}</TableCell>
                    <TableCell className="text-sm">{s.business_name || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{planLabels[s.plan] || s.plan}</Badge></TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${aud.color}`}>{aud.label}</span></TableCell>
                    <TableCell><Badge className={statusColors[s.status] || "bg-muted"}>{s.status}</Badge></TableCell>
                    <TableCell className="text-sm font-medium">${s.price_cop.toLocaleString("es-CO")}</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary cursor-pointer"
                        checked={(s as any).show_in_landing ?? true}
                        onClick={e => e.stopPropagation()}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await supabase.from("support_subscriptions").update({ show_in_landing: val } as any).eq("id", s.id);
                          load();
                          toast({ title: val ? "Visible en landing ✅" : "Oculto del landing" });
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {s.current_period_start && new Date(s.current_period_start).toLocaleDateString("es-CO")} — {s.current_period_end && new Date(s.current_period_end).toLocaleDateString("es-CO")}
                    </TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="ghost">Editar</Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Editar Suscripción</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="autogestion">Autogestión</SelectItem>
                  <SelectItem value="tranquilidad">Tranquilidad</SelectItem>
                  <SelectItem value="socio_estrategico">Socio Estratégico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visible para</Label>
              <Select value={editAudience} onValueChange={setEditAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Todos (Clientes y Socios)</SelectItem>
                  <SelectItem value="client">Solo Clientes</SelectItem>
                  <SelectItem value="reseller">Solo Socios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="past_due">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Precio COP</Label>
              <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nueva Suscripción</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>User ID (UUID)</Label><Input value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="UUID del usuario" /></div>
            <div>
              <Label>Plan</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="autogestion">Autogestión</SelectItem>
                  <SelectItem value="tranquilidad">Tranquilidad</SelectItem>
                  <SelectItem value="socio_estrategico">Socio Estratégico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visible para</Label>
              <Select value={newAudience} onValueChange={setNewAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Todos (Clientes y Socios)</SelectItem>
                  <SelectItem value="client">Solo Clientes</SelectItem>
                  <SelectItem value="reseller">Solo Socios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Precio COP</Label><Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} /></div>
            <div>
              <Label>Método de pago</Label>
              <Select value={newPayment} onValueChange={setNewPayment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="wompi">Wompi</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Creando..." : "Crear Suscripción"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
