import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useReseller } from "@/hooks/useReseller";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

type TicketFilter = "all" | "open" | "resolved";

export default function ResellerTicketsView() {
  const { reseller } = useReseller();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketFilter>("all");

  const load = async () => {
    if (!reseller) return;
    setLoading(true);
    const { data } = await supabase
      .from("reseller_tickets")
      .select("*")
      .eq("reseller_id", reseller.id)
      .order("created_at", { ascending: false });
    setTickets((data as Ticket[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [reseller]);

  const openCount = useMemo(() => tickets.filter(t => t.status === "open").length, [tickets]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter(t => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reseller) return;
    const fd = new FormData(e.currentTarget);

    const { error } = await supabase.from("reseller_tickets").insert({
      reseller_id: reseller.id,
      subject: fd.get("subject") as string,
      description: fd.get("description") as string,
      priority: fd.get("priority") as string,
    });

    if (error) {
      toast({ title: "Error al crear ticket", variant: "destructive" });
    } else {
      toast({ title: "Ticket creado ✅" });
      setShowCreate(false);
      load();
    }
  };

  const statusColor = (s: string) => {
    if (s === "open") return "bg-yellow-500 text-white";
    if (s === "resolved") return "bg-green-600 text-white";
    return "bg-muted";
  };

  const statusLabel = (s: string) => {
    if (s === "open") return "Abierto";
    if (s === "resolved") return "Resuelto";
    return s;
  };

  const filterButtons: { value: TicketFilter; label: string }[] = [
    { value: "all", label: `Todos (${tickets.length})` },
    { value: "open", label: `Abiertos (${openCount})` },
    { value: "resolved", label: "Resueltos" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-display">Tickets de Soporte</h1>
          {openCount > 0 && (
            <Badge className="bg-yellow-500 text-white">{openCount} abiertos</Badge>
          )}
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nuevo Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear Ticket</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label>Asunto *</Label><Input name="subject" required /></div>
              <div>
                <Label>Prioridad</Label>
                <select name="priority" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div><Label>Descripción *</Label><Textarea name="description" rows={4} required /></div>
              <Button type="submit" className="w-full">Enviar Ticket</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filterButtons.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? "default" : "outline"}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No tienes tickets.</p>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setDetailTarget(t)}
              className="cursor-pointer rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t.subject}</h3>
                <Badge className={statusColor(t.status)}>{statusLabel(t.status)}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleDateString("es-CO")} · Prioridad: {t.priority}
                {t.admin_response && t.updated_at !== t.created_at && (
                  <> · Respondido: {new Date(t.updated_at).toLocaleDateString("es-CO")}</>
                )}
              </p>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!detailTarget} onOpenChange={() => setDetailTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detailTarget?.subject}</DialogTitle></DialogHeader>
          {detailTarget && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm whitespace-pre-wrap">{detailTarget.description}</p>
              </div>
              {detailTarget.admin_response && (
                <div className="rounded-md bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">Respuesta del equipo</p>
                    {detailTarget.updated_at !== detailTarget.created_at && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(detailTarget.updated_at).toLocaleDateString("es-CO")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap mt-1">{detailTarget.admin_response}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
