import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, User, Handshake, Mail, Phone, Building2, Paperclip, Video, FileText, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense, useState as useStateLazy } from "react";
const AdminTicketChatDialog = lazy(() => import("@/components/admin/AdminTicketChatDialog"));

interface UnifiedTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  module: string | null;
  whatsapp: string | null;
  video_url: string | null;
  attachment_url: string | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  source: "client" | "reseller";
  creator_name: string;
  creator_email: string;
  creator_phone: string | null;
  creator_id: string;
}

type TicketFilter = "all" | "open" | "resolved";
type SourceFilter = "all" | "client" | "reseller";

export default function ClientTicketsView() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<UnifiedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UnifiedTicket | null>(null);
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [chatTicketId, setChatTicketId] = useState<string | null>(null);
  const [chatTicketSubject, setChatTicketSubject] = useState("");
  const [chatTicketSource, setChatTicketSource] = useState<"client" | "reseller">("client");

  const load = async () => {
    setLoading(true);

    // Load client tickets with profile info
    const [clientRes, resellerRes] = await Promise.all([
      supabase.from("client_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("reseller_tickets").select("*").order("created_at", { ascending: false }),
    ]);

    const clientTickets = (clientRes.data || []) as any[];
    const resellerTickets = (resellerRes.data || []) as any[];

    // Get profiles for client tickets
    const userIds = [...new Set(clientTickets.map((t) => t.user_id))];
    let profilesMap: Record<string, { full_name: string; email: string; phone: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone")
        .in("user_id", userIds);
      (profiles || []).forEach((p: any) => {
        profilesMap[p.user_id] = { full_name: p.full_name || "Sin nombre", email: p.email || "", phone: p.phone };
      });
    }

    // Get reseller info
    const resellerIds = [...new Set(resellerTickets.map((t) => t.reseller_id))];
    let resellersMap: Record<string, { full_name: string; email: string; phone: string }> = {};
    if (resellerIds.length > 0) {
      const { data: resellers } = await supabase
        .from("reseller_applications")
        .select("id, full_name, email, phone")
        .in("id", resellerIds);
      (resellers || []).forEach((r: any) => {
        resellersMap[r.id] = { full_name: r.full_name, email: r.email, phone: r.phone };
      });
    }

    const unified: UnifiedTicket[] = [
      ...clientTickets.map((t) => {
        const profile = profilesMap[t.user_id] || { full_name: "Desconocido", email: "", phone: null };
        return {
          id: t.id, subject: t.subject, description: t.description,
          status: t.status, priority: t.priority,
          module: t.module || null, whatsapp: t.whatsapp || null,
          video_url: t.video_url || null, attachment_url: t.attachment_url || null,
          admin_response: t.admin_response,
          created_at: t.created_at, updated_at: t.updated_at,
          source: "client" as const,
          creator_name: profile.full_name, creator_email: profile.email,
          creator_phone: profile.phone, creator_id: t.user_id,
        };
      }),
      ...resellerTickets.map((t) => {
        const reseller = resellersMap[t.reseller_id] || { full_name: "Desconocido", email: "", phone: "" };
        return {
          id: t.id, subject: t.subject, description: t.description,
          status: t.status, priority: t.priority,
          module: t.module || null, whatsapp: t.whatsapp || null,
          video_url: t.video_url || null, attachment_url: t.attachment_url || null,
          admin_response: t.admin_response,
          created_at: t.created_at, updated_at: t.updated_at,
          source: "reseller" as const,
          creator_name: reseller.full_name, creator_email: reseller.email,
          creator_phone: reseller.phone, creator_id: t.reseller_id,
        };
      }),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setTickets(unified);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCount = useMemo(() => tickets.filter((t) => t.status === "open").length, [tickets]);
  const clientCount = useMemo(() => tickets.filter((t) => t.source === "client").length, [tickets]);
  const resellerCount = useMemo(() => tickets.filter((t) => t.source === "reseller").length, [tickets]);

  const filtered = useMemo(() => {
    let result = tickets;
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (sourceFilter !== "all") result = result.filter((t) => t.source === sourceFilter);
    return result;
  }, [tickets, statusFilter, sourceFilter]);

  const handleRespond = async (newStatus?: string) => {
    if (!selected) return;
    setSaving(true);

    const table = selected.source === "client" ? "client_tickets" : "reseller_tickets";
    const finalStatus = newStatus || (response.trim() ? "resolved" : selected.status);

    const updateData: any = { status: finalStatus };
    if (response.trim()) updateData.admin_response = response;

    const { error } = await supabase.from(table).update(updateData).eq("id", selected.id);

    if (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
      setSaving(false);
      return;
    }

    // If escalating, send WhatsApp via CallMeBot
    if (finalStatus === "escalated") {
      try {
        const attachInfo = selected.attachment_url
          ? `\n📎 Adjunto: ${selected.attachment_url}`
          : "";
        const videoInfo = selected.video_url
          ? `\n🎥 Video: ${selected.video_url}`
          : "";
        await supabase.functions.invoke("send-whatsapp", {
          body: {
            event_type: "ticket_escalated",
            variables: {
              name: selected.creator_name,
              subject: selected.subject,
              description: selected.description.substring(0, 300),
              module: selected.module || "General",
              source: selected.source === "client" ? "Cliente" : "Socio",
              attachment: attachInfo + videoInfo,
              phone: selected.creator_phone || selected.whatsapp || "-",
              priority: selected.priority,
            },
            skip_rate_limit: true,
          },
        });
        toast({ title: "📲 WhatsApp enviado al proveedor de segundo nivel" });
      } catch (e) {
        console.error("WhatsApp escalation error:", e);
      }
    }

    // Send notification email
    try {
      await supabase.functions.invoke("notify-ticket-status", {
        body: {
          type: response.trim() ? "ticket_responded" : "ticket_status_changed",
          ticket_type: selected.source,
          ticket_id: selected.id,
          subject: selected.subject,
          recipient_email: selected.creator_email,
          recipient_name: selected.creator_name,
          new_status: finalStatus,
          admin_response: response.trim() || undefined,
        },
      });
    } catch (e) {
      console.error("Notification error:", e);
    }

    toast({ title: "Ticket actualizado ✅" });
    setSelected(null);
    setResponse("");
    setSaving(false);
    load();
  };

  const statusColor = (s: string) => {
    if (s === "open") return "bg-yellow-500 text-white";
    if (s === "resolved") return "bg-green-600 text-white";
    if (s === "escalated") return "bg-orange-500 text-white";
    return "bg-muted";
  };

  const statusLabel = (s: string) => {
    if (s === "open") return "Abierto";
    if (s === "resolved") return "Resuelto";
    if (s === "escalated") return "Escalado N2";
    return s;
  };

  const priorityColor = (p: string) => {
    if (p === "urgent") return "bg-red-500 text-white";
    if (p === "high") return "bg-orange-500 text-white";
    return "bg-muted";
  };

  const sourceIcon = (s: string) => {
    if (s === "client") return <User className="h-3.5 w-3.5" />;
    return <Handshake className="h-3.5 w-3.5" />;
  };

  const sourceLabel = (s: string) => s === "client" ? "Cliente" : "Socio";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Tickets de Soporte</h1>
          <p className="text-sm text-muted-foreground">
            {tickets.length} tickets · {openCount} abiertos · {clientCount} clientes · {resellerCount} socios
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-lg border p-1">
          {(["all", "open", "resolved"] as TicketFilter[]).map((f) => (
            <Button key={f} size="sm" variant={statusFilter === f ? "default" : "ghost"} className="h-7 text-xs" onClick={() => setStatusFilter(f)}>
              {f === "all" ? "Todos" : f === "open" ? `Abiertos (${openCount})` : "Resueltos"}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {(["all", "client", "reseller"] as SourceFilter[]).map((f) => (
            <Button key={f} size="sm" variant={sourceFilter === f ? "default" : "ghost"} className="h-7 text-xs gap-1" onClick={() => setSourceFilter(f)}>
              {f !== "all" && sourceIcon(f)}
              {f === "all" ? "Todos" : f === "client" ? `Clientes (${clientCount})` : `Socios (${resellerCount})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay tickets con estos filtros.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origen</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={`${t.source}-${t.id}`} className="cursor-pointer hover:bg-muted/40" onClick={() => { setSelected(t); setResponse(t.admin_response || ""); }}>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 text-xs">
                      {sourceIcon(t.source)}
                      {sourceLabel(t.source)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[140px]">
                      <p className="text-sm font-medium truncate">{t.creator_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.creator_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{t.subject}</TableCell>
                  <TableCell><Badge className={statusColor(t.status)}>{statusLabel(t.status)}</Badge></TableCell>
                  <TableCell><Badge className={priorityColor(t.priority)}>{t.priority}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(t.created_at).toLocaleDateString("es-CO")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setChatTicketId(t.id); setChatTicketSubject(t.subject); setChatTicketSource(t.source); }}>💬 Chat</Button>
                      <Button size="sm" variant="ghost">Ver</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && sourceIcon(selected.source)}
              {selected?.subject}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Creator info card */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {selected.source === "client" ? "👤 Información del Cliente" : "🤝 Información del Socio"}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{selected.creator_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{selected.creator_email}</span>
                </div>
                {selected.creator_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{selected.creator_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Creado: {new Date(selected.created_at).toLocaleString("es-CO")}</span>
                  <span>·</span>
                  <Badge className={`${priorityColor(selected.priority)} text-[10px] h-4`}>{selected.priority}</Badge>
                </div>
              </div>

              {/* Module badge */}
              {selected.module && (
                <Badge variant="outline" className="text-xs">{selected.module}</Badge>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Descripción</p>
                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3">{selected.description}</p>
              </div>

              {/* WhatsApp from ticket */}
              {selected.whatsapp && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-green-500" />
                  <span>WhatsApp del ticket: {selected.whatsapp}</span>
                </div>
              )}

              {/* Video */}
              {selected.video_url && (
                <div>
                  <a href={selected.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60 transition-colors">
                    <Video className="h-4 w-4 text-blue-500" />Ver video adjunto
                  </a>
                </div>
              )}

              {/* Attachment */}
              {selected.attachment_url && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Archivo adjunto</p>
                  {/\.(jpg|jpeg|png|webp)$/i.test(selected.attachment_url) ? (
                    <a href={selected.attachment_url} target="_blank" rel="noopener noreferrer">
                      <img src={selected.attachment_url} alt="Adjunto" className="max-h-48 rounded-md border object-contain" />
                    </a>
                  ) : (
                    <a href={selected.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60 transition-colors">
                      <FileText className="h-4 w-4 text-red-500" />Ver documento PDF
                    </a>
                  )}
                </div>
              )}

              {/* Response */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Respuesta del equipo</p>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  placeholder="Escribe tu respuesta..."
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => handleRespond("resolved")} className="flex-1" disabled={saving}>
                  {saving ? "Enviando..." : selected.status === "open" ? "✅ Responder y Resolver" : "Actualizar Respuesta"}
                </Button>
                {selected.status !== "escalated" && (
                  <Button
                    variant="outline"
                    className="gap-1.5 border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                    onClick={() => handleRespond("escalated")}
                    disabled={saving}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Escalar Proveedor
                  </Button>
                )}
                {selected.status === "resolved" && (
                  <Button variant="outline" onClick={() => handleRespond("open")} disabled={saving}>
                    Reabrir
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Suspense fallback={null}>
        <AdminTicketChatDialog
          ticketId={chatTicketId}
          ticketSubject={chatTicketSubject}
          ticketSource={chatTicketSource}
          onClose={() => setChatTicketId(null)}
        />
      </Suspense>
    </div>
  );
}
