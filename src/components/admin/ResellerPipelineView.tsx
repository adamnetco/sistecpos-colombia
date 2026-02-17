import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical, Eye, Mail, Phone, MapPin, Calendar, Video, CheckCircle2,
  UserPlus, PhoneCall, GraduationCap, Rocket, XCircle, ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Reseller {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  experience_summary: string | null;
  status: string;
  pipeline_stage: string;
  created_at: string;
  user_id: string | null;
}

interface FunnelEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  page_url: string | null;
  created_at: string;
}

const PIPELINE_STAGES = [
  { id: "registered", label: "Registrado", icon: UserPlus, color: "bg-blue-500" },
  { id: "video_watched", label: "Video Visto", icon: Video, color: "bg-indigo-500" },
  { id: "qualified", label: "Calificado", icon: PhoneCall, color: "bg-yellow-500" },
  { id: "training", label: "En Capacitación", icon: GraduationCap, color: "bg-purple-500" },
  { id: "active", label: "Activo ✓", icon: Rocket, color: "bg-green-500" },
  { id: "churned", label: "Inactivo", icon: XCircle, color: "bg-red-500" },
];

const eventLabels: Record<string, string> = {
  page_view: "Visitó página",
  video_started: "Inició video",
  video_completed: "Completó video",
  cta_clicked: "Clic en CTA",
  google_registered: "Registrado con Google",
  calendar_booked: "Agenda cita",
};

export default function ResellerPipelineView() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reseller | null>(null);
  const [events, setEvents] = useState<FunnelEvent[]>([]);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reseller_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error cargando pipeline", variant: "destructive" });
    setResellers((data as Reseller[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const moveToStage = async (resellerId: string, newStage: string) => {
    const { error } = await supabase
      .from("reseller_applications")
      .update({ pipeline_stage: newStage })
      .eq("id", resellerId);

    if (error) {
      toast({ title: "Error moviendo prospecto", variant: "destructive" });
      return;
    }

    setResellers(prev =>
      prev.map(r => r.id === resellerId ? { ...r, pipeline_stage: newStage } : r)
    );

    const reseller = resellers.find(r => r.id === resellerId);
    if (reseller) {
      await supabase.from("reseller_funnel_events").insert({
        reseller_email: reseller.email,
        reseller_id: resellerId,
        event_type: "stage_change",
        event_data: { from: reseller.pipeline_stage, to: newStage },
      });
    }
  };

  const openDetail = async (reseller: Reseller) => {
    setSelected(reseller);
    const { data } = await supabase
      .from("reseller_funnel_events")
      .select("*")
      .or(`reseller_id.eq.${reseller.id},reseller_email.eq.${reseller.email}`)
      .order("created_at", { ascending: false })
      .limit(50);
    setEvents((data as FunnelEvent[]) || []);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedId) {
      moveToStage(draggedId, stageId);
      setDraggedId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Arrastra prospectos entre columnas para avanzar su etapa en el embudo
        </p>
        <Badge variant="outline">{resellers.length} prospectos</Badge>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "70vh" }}>
        {PIPELINE_STAGES.map(stage => {
          const stageResellers = resellers.filter(r => r.pipeline_stage === stage.id);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-64 flex flex-col rounded-xl border bg-muted/30"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center gap-2 p-3 border-b">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <stage.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold flex-1">{stage.label}</span>
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {stageResellers.length}
                </Badge>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageResellers.map(r => (
                  <div
                    key={r.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, r.id)}
                    className={`bg-card rounded-lg border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                      draggedId === r.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-sm font-medium truncate max-w-[140px]">
                          {r.full_name}
                        </span>
                      </div>
                      <button
                        onClick={() => openDetail(r)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{r.city}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{r.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 h-4 ${
                          r.status === "approved" ? "border-green-500 text-green-700" :
                          r.status === "rejected" ? "border-red-500 text-red-700" :
                          "border-yellow-500 text-yellow-700"
                        }`}
                      >
                        {r.status === "approved" ? "Aprobado" :
                         r.status === "rejected" ? "Rechazado" :
                         r.status === "reviewing" ? "En Revisión" : "Pendiente"}
                      </Badge>
                      {r.user_id && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Auth
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {stageResellers.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                    Arrastra aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.full_name}
              <Badge variant="outline" className="text-xs">{selected?.city}</Badge>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <Tabs defaultValue="timeline" className="mt-2">
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1">Línea de Tiempo</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Información</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Sin eventos registrados aún
                    </p>
                  ) : events.map(ev => (
                    <div key={ev.id} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {eventLabels[ev.event_type] || ev.event_type}
                          </span>
                          {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                            <span className="text-xs text-muted-foreground truncate">
                              {ev.event_type === "stage_change"
                                ? `→ ${PIPELINE_STAGES.find(s => s.id === (ev.event_data as any).to)?.label || (ev.event_data as any).to}`
                                : (ev.event_data as any).label || ""}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ev.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                        </p>
                        {ev.page_url && (
                          <p className="text-xs text-muted-foreground/60 truncate">{ev.page_url}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="info" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Teléfono</p>
                    <a href={`tel:${selected.phone}`} className="text-sm text-primary hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ciudad</p>
                    <p className="text-sm">{selected.city}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Registro</p>
                    <p className="text-sm">
                      {format(new Date(selected.created_at), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                {selected.experience_summary && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Experiencia</p>
                    <p className="text-sm text-muted-foreground">{selected.experience_summary}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
