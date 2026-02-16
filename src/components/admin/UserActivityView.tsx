import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Activity, Eye, Video, Bot, TicketCheck, KeyRound,
  Search, Clock, CalendarDays, TrendingUp, ChevronRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface AccessSummary {
  id: string;
  user_id: string;
  user_email: string | null;
  total_access_count: number;
  last_access_at: string | null;
  last_portal: string | null;
  total_videos_watched: number;
  total_chatbot_interactions: number;
  total_tickets_created: number;
  total_licenses_activated: number;
  total_demos_requested: number;
  first_access_at: string | null;
  updated_at: string;
}

interface AccessLog {
  id: string;
  user_email: string | null;
  user_role: string;
  portal: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function portalLabel(p: string | null) {
  if (!p) return "—";
  if (p.startsWith("/admin")) return "Admin";
  if (p.startsWith("/socio")) return "Socio";
  if (p.startsWith("/clientes")) return "Cliente";
  return p;
}

function actionLabel(a: string) {
  const map: Record<string, string> = {
    portal_access: "Acceso",
    video_view: "Video visto",
    chatbot_interaction: "Chatbot IA",
    ticket_create: "Ticket creado",
    license_activate: "Licencia activada",
    demo_request: "Demo solicitada",
  };
  return map[a] || a;
}

function actionColor(a: string) {
  const map: Record<string, string> = {
    portal_access: "bg-blue-500/10 text-blue-700",
    video_view: "bg-purple-500/10 text-purple-700",
    chatbot_interaction: "bg-green-500/10 text-green-700",
    ticket_create: "bg-orange-500/10 text-orange-700",
    license_activate: "bg-emerald-500/10 text-emerald-700",
    demo_request: "bg-pink-500/10 text-pink-700",
  };
  return map[a] || "bg-muted text-muted-foreground";
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Users; label: string; value: number; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserActivityView() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AccessSummary | null>(null);

  const { data: summaries, isLoading: loadingSummaries } = useQuery({
    queryKey: ["user-access-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_access_summary")
        .select("*")
        .order("last_access_at", { ascending: false });
      if (error) throw error;
      return data as AccessSummary[];
    },
  });

  const { data: recentLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["user-access-logs-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AccessLog[];
    },
  });

  // Detail logs for selected user
  const { data: userLogs } = useQuery({
    queryKey: ["user-detail-logs", selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from("user_access_logs")
        .select("*")
        .eq("user_id", selectedUser.user_id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AccessLog[];
    },
    enabled: !!selectedUser,
  });

  // Chatbot conversations for selected user
  const { data: userChats } = useQuery({
    queryKey: ["user-chatbot-convos", selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("id, session_id, source_page, message_count, created_at, updated_at")
        .eq("user_id", selectedUser.user_id)
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser,
  });

  const filtered = useMemo(() => {
    if (!summaries) return [];
    if (!search) return summaries;
    const q = search.toLowerCase();
    return summaries.filter((s) =>
      (s.user_email || "").toLowerCase().includes(q)
    );
  }, [summaries, search]);

  const totals = useMemo(() => {
    if (!summaries) return { users: 0, accesses: 0, videos: 0, chats: 0, tickets: 0 };
    return {
      users: summaries.length,
      accesses: summaries.reduce((a, s) => a + s.total_access_count, 0),
      videos: summaries.reduce((a, s) => a + s.total_videos_watched, 0),
      chats: summaries.reduce((a, s) => a + s.total_chatbot_interactions, 0),
      tickets: summaries.reduce((a, s) => a + s.total_tickets_created, 0),
    };
  }, [summaries]);

  if (loadingSummaries) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Actividad de Usuarios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trazabilidad de accesos, videos vistos, interacciones con chatbot y más
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Usuarios activos" value={totals.users} color="bg-blue-500/10 text-blue-600" />
        <StatCard icon={Eye} label="Total accesos" value={totals.accesses} color="bg-indigo-500/10 text-indigo-600" />
        <StatCard icon={Video} label="Videos vistos" value={totals.videos} color="bg-purple-500/10 text-purple-600" />
        <StatCard icon={Bot} label="Chats IA" value={totals.chats} color="bg-green-500/10 text-green-600" />
        <StatCard icon={TicketCheck} label="Tickets" value={totals.tickets} color="bg-orange-500/10 text-orange-600" />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Por Usuario</TabsTrigger>
          <TabsTrigger value="timeline">Actividad Reciente</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-center">Accesos</TableHead>
                    <TableHead className="text-center">Videos</TableHead>
                    <TableHead className="text-center">Chatbot</TableHead>
                    <TableHead className="text-center">Tickets</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead>Portal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(s)}>
                      <TableCell className="font-medium text-sm">
                        {s.user_email || "Sin email"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{s.total_access_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-purple-600">{s.total_videos_watched}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-green-600">{s.total_chatbot_interactions}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-orange-600">{s.total_tickets_created}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.last_access_at
                          ? formatDistanceToNow(new Date(s.last_access_at), { addSuffix: true, locale: es })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {portalLabel(s.last_portal)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No hay datos de actividad aún
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Últimas 100 actividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {loadingLogs ? (
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(recentLogs || []).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 text-sm">
                        <Badge className={`text-[10px] shrink-0 ${actionColor(log.action)}`}>
                          {actionLabel(log.action)}
                        </Badge>
                        <span className="font-medium truncate flex-1">{log.user_email || "—"}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{portalLabel(log.portal)}</Badge>
                        {log.metadata && (log.metadata as any).video_title && (
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            🎬 {(log.metadata as any).video_title}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedUser?.user_email || "Usuario"}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold">{selectedUser.total_access_count}</p>
                  <p className="text-[10px] text-muted-foreground">Accesos</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">{selectedUser.total_videos_watched}</p>
                  <p className="text-[10px] text-muted-foreground">Videos</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{selectedUser.total_chatbot_interactions}</p>
                  <p className="text-[10px] text-muted-foreground">Chats IA</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {selectedUser.first_access_at && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Primer acceso: {format(new Date(selectedUser.first_access_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </span>
                )}
                {selectedUser.last_access_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Último: {formatDistanceToNow(new Date(selectedUser.last_access_at), { addSuffix: true, locale: es })}
                  </span>
                )}
              </div>

              {/* Chatbot conversations */}
              {userChats && userChats.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-green-600" />
                    Conversaciones con Chatbot IA ({userChats.length})
                  </h4>
                  <div className="space-y-1">
                    {userChats.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
                        <Badge variant="secondary" className="text-[10px]">{c.message_count} msgs</Badge>
                        <span className="text-muted-foreground">{c.source_page || "/"}</span>
                        <span className="ml-auto text-muted-foreground">
                          {format(new Date(c.updated_at), "dd/MM HH:mm", { locale: es })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity timeline */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Historial de actividad
                </h4>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-1">
                    {(userLogs || []).map((log) => (
                      <div key={log.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50 text-xs">
                        <Badge className={`text-[9px] shrink-0 ${actionColor(log.action)}`}>
                          {actionLabel(log.action)}
                        </Badge>
                        <span className="truncate flex-1">
                          {(log.metadata as any)?.video_title
                            || (log.metadata as any)?.topic
                            || portalLabel(log.portal)}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {format(new Date(log.created_at), "dd/MM HH:mm", { locale: es })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
