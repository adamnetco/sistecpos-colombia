import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Bot, Mail, Phone, Building2, MapPin, GripVertical,
  Plus, ChevronRight, Eye,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactDetailPanel from "./ContactDetailPanel";

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
  lead_id: string | null;
  created_at: string;
}

const STAGES = [
  { id: "new", label: "Nuevo", color: "bg-blue-500" },
  { id: "contacted", label: "Contactado", color: "bg-yellow-500" },
  { id: "demo", label: "Demo Activa", color: "bg-purple-500" },
  { id: "negotiation", label: "Negociación", color: "bg-orange-500" },
  { id: "closed_won", label: "Cerrado ✓", color: "bg-green-500" },
  { id: "closed_lost", label: "Perdido", color: "bg-red-500" },
];

const sourceLabels: Record<string, string> = {
  website: "Web", whatsapp: "WA", chatbot_ai: "IA", referral: "Ref",
  social_media: "Redes", landing: "LP", manual: "Man",
};

export default function ContactPipelineView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("lead_score", { ascending: false });
    if (error) toast({ title: "Error cargando pipeline", variant: "destructive" });
    setContacts((data as Contact[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const moveToStage = async (contactId: string, newStage: string) => {
    const { error } = await supabase
      .from("contacts")
      .update({ pipeline_stage: newStage })
      .eq("id", contactId);

    if (error) {
      toast({ title: "Error moviendo contacto", variant: "destructive" });
      return;
    }

    setContacts(prev =>
      prev.map(c => c.id === contactId ? { ...c, pipeline_stage: newStage } : c)
    );

    // Log activity
    await supabase.from("contact_activities").insert({
      contact_id: contactId,
      activity_type: "stage_change",
      description: `Movido a etapa: ${STAGES.find(s => s.id === newStage)?.label}`,
    });
  };

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    setDraggedId(contactId);
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
          Arrastra contactos entre columnas para cambiar su etapa
        </p>
        <Badge variant="outline">{contacts.length} contactos</Badge>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "70vh" }}>
        {STAGES.map(stage => {
          const stageContacts = contacts.filter(c => c.pipeline_stage === stage.id);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 flex flex-col rounded-xl border bg-muted/30"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 p-3 border-b">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                <span className="text-sm font-semibold flex-1">{stage.label}</span>
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {stageContacts.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageContacts.map(contact => (
                  <div
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact.id)}
                    className={`bg-card rounded-lg border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                      draggedId === contact.id ? "opacity-50" : ""
                    } ${!contact.is_read ? "border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-sm font-medium truncate max-w-[160px]">
                          {contact.full_name}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {contact.business_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{contact.business_name}</span>
                      </div>
                    )}

                    {contact.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {sourceLabels[contact.source] || contact.source}
                      </Badge>
                      {contact.captured_by_ai && (
                        <Badge className="bg-purple-500/10 text-purple-700 text-[9px] px-1 py-0 h-4 border-0">
                          <Bot className="h-2.5 w-2.5 mr-0.5" />IA
                        </Badge>
                      )}
                      {contact.lead_score > 0 && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                          ⭐ {contact.lead_score}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {stageContacts.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                    Arrastra aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Contacto</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ContactDetailPanel
              contact={selectedContact}
              onUpdate={() => { load(); setSelectedContact(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
