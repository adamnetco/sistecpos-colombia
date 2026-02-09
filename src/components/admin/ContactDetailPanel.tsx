import { useState, useEffect } from "react";
import AIConversationsSection from "./AIConversationsSection";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Phone, Building2, MapPin, Bot, Clock, Plus,
  MessageSquare, PhoneCall, FileText, Calendar,
} from "lucide-react";

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  business_name: string | null;
  business_type: string | null;
  contact_type: string;
  source: string;
  is_read: boolean;
  captured_by_ai: boolean;
  notes: string | null;
  tags: string[] | null;
  lead_score: number;
  pipeline_stage: string;
  created_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

const activityIcons: Record<string, typeof MessageSquare> = {
  note: FileText,
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  stage_change: Clock,
};

export default function ContactDetailPanel({
  contact,
  onUpdate,
}: {
  contact: Contact;
  onUpdate: () => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [contact.id]);

  const loadActivities = async () => {
    const { data } = await supabase
      .from("contact_activities")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setActivities((data as Activity[]) || []);
  };

  const addActivity = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("contact_activities").insert({
      contact_id: contact.id,
      activity_type: activityType,
      description: newNote.trim(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", variant: "destructive" });
    } else {
      setNewNote("");
      loadActivities();
      // Increase lead score
      await supabase
        .from("contacts")
        .update({ lead_score: contact.lead_score + 1 })
        .eq("id", contact.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nombre</Label>
          <p className="font-medium">{contact.full_name}</p>
        </div>
        {contact.email && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</p>
          </div>
        )}
        {contact.phone && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Teléfono</Label>
            <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</p>
          </div>
        )}
        {contact.business_name && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Negocio</Label>
            <p className="text-sm flex items-center gap-1"><Building2 className="h-3 w-3" />{contact.business_name}</p>
          </div>
        )}
        {contact.city && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ciudad</Label>
            <p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.city}</p>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Score</Label>
          <p className="text-sm font-medium">⭐ {contact.lead_score}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {contact.captured_by_ai && (
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 text-xs">
            <Bot className="h-3 w-3 mr-1" />Capturado por IA
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">{contact.source}</Badge>
        <Badge variant="outline" className="text-xs">{contact.contact_type}</Badge>
      </div>

      {contact.notes && (
        <div>
          <Label className="text-xs text-muted-foreground">Notas</Label>
          <p className="text-sm mt-1 bg-muted/50 rounded-lg p-3">{contact.notes}</p>
        </div>
      )}

      <Separator />

      {/* AI Conversations */}
      <AIConversationsSection contactId={contact.id} />

      <Separator />

      {/* Add Activity */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Agregar Actividad</Label>
        <div className="flex gap-2 mb-2">
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Nota</SelectItem>
              <SelectItem value="call">Llamada</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Reunión</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Describe la actividad..."
            className="h-9 flex-1"
            onKeyDown={(e) => e.key === "Enter" && addActivity()}
          />
          <Button size="sm" onClick={addActivity} disabled={saving} className="h-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Historial ({activities.length})</Label>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map(act => {
            const Icon = activityIcons[act.activity_type] || FileText;
            return (
              <div key={act.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{act.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(act.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Sin actividades registradas</p>
          )}
        </div>
      </div>
    </div>
  );
}
