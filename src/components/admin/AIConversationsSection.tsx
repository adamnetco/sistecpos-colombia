import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Bot, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  session_id: string;
  source_page: string | null;
  message_count: number;
  is_lead_captured: boolean;
  created_at: string;
}

export default function AIConversationsSection({ contactId }: { contactId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("ai_conversations")
        .select("id, session_id, source_page, message_count, is_lead_captured, created_at")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false })
        .limit(20);
      setConversations((data as Conversation[]) || []);
    };
    load();
  }, [contactId]);

  if (conversations.length === 0) return null;

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block flex items-center gap-1.5">
        <Bot className="h-4 w-4 text-purple-600" />
        Conversaciones IA ({conversations.length})
      </Label>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {conversations.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/5 border border-purple-200/50">
            <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {c.source_page || "Página desconocida"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString("es-CO", {
                  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="outline" className="text-[10px]">{c.message_count} msgs</Badge>
              {c.is_lead_captured && (
                <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[10px]">Lead</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
