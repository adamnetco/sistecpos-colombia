import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Bot, User, ShieldCheck, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  attachment_url: string | null;
  created_at: string;
}

interface Props {
  ticketId: string | null;
  ticketSubject: string;
  ticketSource: "client" | "reseller";
  onClose: () => void;
}

const roleConfig: Record<string, { label: string; icon: typeof User; className: string }> = {
  customer: { label: "Cliente", icon: User, className: "bg-blue-600 text-white" },
  admin: { label: "Admin", icon: ShieldCheck, className: "bg-green-600 text-white" },
  ai_agent: { label: "IA", icon: Bot, className: "bg-violet-600 text-white" },
};

export default function AdminTicketChatDialog({ ticketId, ticketSubject, ticketSource, onClose }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as TicketMessage[]) ?? []);
        setLoading(false);
      });
  }, [ticketId]);

  // Realtime
  useEffect(() => {
    if (!ticketId) return;
    const channel = supabase
      .channel(`admin-ticket-${ticketId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        (payload) => {
          const msg = payload.new as TicketMessage;
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!user || !ticketId || (!text.trim() && !attachFile)) return;
    setSending(true);

    let attachment_url: string | null = null;
    if (attachFile) {
      const ext = attachFile.name.split(".").pop();
      const path = `admin/${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("ticket-attachments").upload(path, attachFile, { upsert: false });
      if (upErr) { toast({ title: "Error al subir archivo", variant: "destructive" }); setSending(false); return; }
      const { data: urlData } = supabase.storage.from("ticket-attachments").getPublicUrl(path);
      attachment_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: user.id,
      sender_role: "admin",
      content: text.trim() || (attachment_url ? "📎 Archivo adjunto" : ""),
      attachment_url,
    });

    if (error) { toast({ title: "Error al enviar", variant: "destructive" }); }
    else {
      setText("");
      setAttachFile(null);

      // Also notify via WhatsApp
      try {
        await supabase.functions.invoke("send-whatsapp", {
          body: { event_type: "new_ticket_message", variables: { ticket_subject: ticketSubject, sender: "Equipo SistecPOS" } },
        });
      } catch (_) { /* silent */ }
    }
    setSending(false);
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url);

  return (
    <Dialog open={!!ticketId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">{ticketSubject}</DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[200px] max-h-[400px]">
          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Sin mensajes. Escribe el primero como admin.</p>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender_role === "admin";
              const rc = roleConfig[msg.sender_role] ?? roleConfig.customer;
              const Icon = rc.icon;
              return (
                <div key={msg.id} className={cn("flex gap-2", isAdmin ? "flex-row-reverse" : "")}>
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-full shrink-0", rc.className)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", isAdmin ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {!isAdmin && <p className="text-[10px] font-medium mb-1 opacity-70">{rc.label}</p>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachment_url && (
                      <div className="mt-2">
                        {isImage(msg.attachment_url) ? (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                            <img src={msg.attachment_url} alt="Adjunto" className="max-h-32 rounded border object-contain" />
                          </a>
                        ) : (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs underline">
                            <FileText className="h-3 w-3" /> Ver archivo
                          </a>
                        )}
                      </div>
                    )}
                    <p className={cn("text-[10px] mt-1", isAdmin ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {new Date(msg.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t pt-3 space-y-2">
          {attachFile && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm">
              {attachFile.type === "application/pdf" ? <FileText className="h-3.5 w-3.5 text-red-500" /> : <ImageIcon className="h-3.5 w-3.5 text-blue-500" />}
              <span className="truncate flex-1 text-xs">{attachFile.name}</span>
              <button onClick={() => setAttachFile(null)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size <= 5 * 1024 * 1024) setAttachFile(file);
              else if (file) toast({ title: "Máximo 5 MB", variant: "destructive" });
            }}
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} className="shrink-0"><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Responder como admin..." value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={sending || (!text.trim() && !attachFile)} size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
