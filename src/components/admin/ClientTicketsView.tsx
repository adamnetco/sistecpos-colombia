import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare } from "lucide-react";

interface ClientTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export default function ClientTicketsView() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ClientTicket | null>(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    setTickets((data as ClientTicket[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return tickets;
    return tickets.filter(t => t.status === filter);
  }, [tickets, filter]);

  const openCount = useMemo(() => tickets.filter(t => t.status === "open").length, [tickets]);

  const handleRespond = async () => {
    if (!selected || !response.trim()) return;
    const { error } = await supabase
      .from("client_tickets")
      .update({ admin_response: response, status: "resolved" })
      .eq("id", selected.id);

    if (error) {
      toast({ title: "Error al responder", variant: "destructive" });
    } else {
      toast({ title: "Respuesta enviada ✅" });
      setSelected(null);
      setResponse("");
      load();
    }
  };

  const statusColor = (s: string) => {
    if (s === "open") return "bg-yellow-500 text-white";
    if (s === "resolved") return "bg-green-600 text-white";
    return "bg-muted";
  };

  const priorityColor = (p: string) => {
    if (p === "urgent") return "bg-red-500 text-white";
    if (p === "high") return "bg-orange-500 text-white";
    return "bg-muted";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets de Clientes</h1>
          <p className="text-muted-foreground">{openCount} tickets abiertos</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "open", "resolved"] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? `Todos (${tickets.length})` : f === "open" ? `Abiertos (${openCount})` : "Resueltos"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay tickets.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asunto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => { setSelected(t); setResponse(t.admin_response || ""); }}>
                <TableCell className="font-medium">{t.subject}</TableCell>
                <TableCell><Badge className={statusColor(t.status)}>{t.status === "open" ? "Abierto" : "Resuelto"}</Badge></TableCell>
                <TableCell><Badge className={priorityColor(t.priority)}>{t.priority}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString("es-CO")}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">Ver</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.subject}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descripción del cliente</p>
                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3">{selected.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Respuesta del equipo</p>
                <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} placeholder="Escribe tu respuesta..." />
              </div>
              <Button onClick={handleRespond} className="w-full">
                {selected.status === "open" ? "Responder y Resolver" : "Actualizar Respuesta"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
