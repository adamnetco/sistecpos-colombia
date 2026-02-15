import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Bot, Plus, Pencil, Trash2, GripVertical, FileText, HelpCircle, MessageSquareText,
  MessagesSquare, Settings2, BarChart3, Wand2, TestTube2, Globe, ChevronDown, ChevronUp, Save, Eye,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ChatbotSettingsTab from "./ChatbotSettingsTab";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AIMetricsTab = lazy(() => import("./AIMetricsTab"));
const PromptStudioTab = lazy(() => import("./PromptStudioTab"));
const AITestTab = lazy(() => import("./AITestTab"));
const AIScrapingTab = lazy(() => import("./AIScrapingTab"));

interface KBEntry {
  id: string;
  entry_type: string;
  title: string;
  content: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  source_page: string | null;
  is_lead_captured: boolean;
  message_count: number;
  created_at: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const entryTypeConfig: Record<string, { label: string; icon: typeof HelpCircle; color: string }> = {
  faq: { label: "FAQ", icon: HelpCircle, color: "bg-blue-500/10 text-blue-700" },
  document: { label: "Documento", icon: FileText, color: "bg-whatsapp/10 text-whatsapp" },
  custom_text: { label: "Texto Libre", icon: MessageSquareText, color: "bg-purple-500/10 text-purple-700" },
};

function TabLoader() {
  return <Skeleton className="h-64 w-full" />;
}

export default function CentralIAView() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Bot className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-display">Central IA</h1>
          <p className="text-sm text-muted-foreground">Entrenamiento, métricas y pruebas del chatbot</p>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="metrics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Métricas
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5">
            <FileText className="h-4 w-4" /> Base de Conocimiento
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-1.5">
            <Wand2 className="h-4 w-4" /> Prompt Studio
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5">
            <TestTube2 className="h-4 w-4" /> Test en Vivo
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-1.5">
            <MessagesSquare className="h-4 w-4" /> Conversaciones
          </TabsTrigger>
          <TabsTrigger value="scraping" className="gap-1.5">
            <Globe className="h-4 w-4" /> Scraping Web
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings2 className="h-4 w-4" /> Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <Suspense fallback={<TabLoader />}><AIMetricsTab /></Suspense>
        </TabsContent>
        <TabsContent value="knowledge"><KnowledgeBaseTab /></TabsContent>
        <TabsContent value="prompt">
          <Suspense fallback={<TabLoader />}><PromptStudioTab /></Suspense>
        </TabsContent>
        <TabsContent value="test">
          <Suspense fallback={<TabLoader />}><AITestTab /></Suspense>
        </TabsContent>
        <TabsContent value="conversations"><ConversationsTab /></TabsContent>
        <TabsContent value="scraping">
          <Suspense fallback={<TabLoader />}><AIScrapingTab /></Suspense>
        </TabsContent>
        <TabsContent value="settings"><ChatbotSettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function KnowledgeBaseTab() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KBEntry | null>(null);
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    let query = supabase.from("ai_knowledge_base").select("*").order("sort_order").order("created_at", { ascending: false });
    if (filterType !== "all") query = query.eq("entry_type", filterType);
    const { data } = await query;
    setEntries((data as KBEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterType]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("ai_knowledge_base").update({ is_active: !current }).eq("id", id);
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, is_active: !current } : e)));
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    await supabase.from("ai_knowledge_base").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Entrada eliminada" });
  };

  const openEdit = (entry: KBEntry) => { setEditing(entry); setShowForm(true); };
  const handleFormClose = () => { setShowForm(false); setEditing(null); load(); };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="faq">FAQs</SelectItem>
              <SelectItem value="document">Documentos</SelectItem>
              <SelectItem value="custom_text">Texto Libre</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            {entries.filter((e) => e.is_active).length} activas / {entries.length} total
          </Badge>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleFormClose(); else setShowForm(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Nueva Entrada</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Editar Entrada" : "Nueva Entrada"}</DialogTitle></DialogHeader>
            <KBEntryForm entry={editing} onSuccess={handleFormClose} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : entries.length === 0 ? (
          <div className="py-12 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No hay entradas en la base de conocimiento</p>
          </div>
        ) : (
          entries.map((entry) => {
            const config = entryTypeConfig[entry.entry_type] || entryTypeConfig.faq;
            const Icon = config.icon;
            return (
              <div key={entry.id} className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${entry.is_active ? "bg-card" : "bg-muted/30 opacity-60"}`}>
                <GripVertical className="h-4 w-4 mt-1 text-muted-foreground/40 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] ${config.color}`}><Icon className="h-3 w-3 mr-0.5" /> {config.label}</Badge>
                    {entry.category && <Badge variant="outline" className="text-[10px]">{entry.category}</Badge>}
                  </div>
                  <h3 className="font-medium text-sm">{entry.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={entry.is_active} onCheckedChange={() => toggleActive(entry.id, entry.is_active)} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(entry)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteEntry(entry.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function KBEntryForm({ entry, onSuccess }: { entry: KBEntry | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    entry_type: entry?.entry_type || "faq",
    title: entry?.title || "",
    content: entry?.content || "",
    category: entry?.category || "",
    is_active: entry?.is_active ?? true,
    sort_order: entry?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    const payload = { entry_type: form.entry_type, title: form.title, content: form.content, category: form.category || null, is_active: form.is_active, sort_order: form.sort_order };
    const { error } = entry
      ? await supabase.from("ai_knowledge_base").update(payload).eq("id", entry.id)
      : await supabase.from("ai_knowledge_base").insert(payload);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: entry ? "Entrada actualizada" : "Entrada creada" }); onSuccess(); }
  };

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={form.entry_type} onValueChange={(v) => set("entry_type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="document">Documento</SelectItem>
              <SelectItem value="custom_text">Texto Libre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Categoría</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Ej: Precios" className="h-9" /></div>
        <div><Label className="text-xs">Orden</Label><Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className="h-9" /></div>
      </div>
      <div><Label className="text-xs">{form.entry_type === "faq" ? "Pregunta *" : "Título *"}</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} required className="h-9" /></div>
      <div><Label className="text-xs">{form.entry_type === "faq" ? "Respuesta *" : "Contenido *"}</Label><Textarea value={form.content} onChange={(e) => set("content", e.target.value)} required rows={6} /></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} /><Label className="text-xs">Activa</Label></div>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : entry ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}

function ConversationsTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [correctionsCount, setCorrectionsCount] = useState(0);
  const { toast } = useToast();

  // Load system prompt on mount
  useEffect(() => {
    (async () => {
      const [convRes, promptRes, corrRes] = await Promise.all([
        supabase.from("ai_conversations").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("app_settings").select("value").eq("key", "chatbot_system_prompt").maybeSingle(),
        supabase.from("ai_messages").select("id", { count: "exact" }).not("corrected_content", "is", null),
      ]);
      setConversations((convRes.data as Conversation[]) || []);
      setSystemPrompt(promptRes.data?.value || "");
      setCorrectionsCount(corrRes.count || 0);
      setLoading(false);
    })();
  }, []);

  const loadMessages = async (convId: string) => {
    setSelectedConv(convId);
    setLoadingMsgs(true);
    setEditingMsgId(null);
    const { data } = await supabase.from("ai_messages").select("id, role, content, created_at, corrected_content, corrected_at").eq("conversation_id", convId).order("created_at");
    setMessages((data as Message[]) || []);
    setLoadingMsgs(false);
  };

  const startCorrection = (msg: Message) => {
    setEditingMsgId(msg.id);
    setCorrectionText((msg as any).corrected_content || msg.content.replace(/\[LEAD_DATA:[^\]]*\]/g, ""));
  };

  const saveCorrection = async (msgId: string) => {
    if (!correctionText.trim()) return;
    setSavingCorrection(true);
    const { error } = await supabase
      .from("ai_messages")
      .update({ corrected_content: correctionText.trim(), corrected_at: new Date().toISOString() })
      .eq("id", msgId);
    setSavingCorrection(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Corrección guardada", description: "Se usará como ejemplo de reentrenamiento en futuras respuestas." });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, corrected_content: correctionText.trim(), corrected_at: new Date().toISOString() } as any : m))
      );
      setCorrectionsCount((c) => c + 1);
      setEditingMsgId(null);
    }
  };

  const removeCorrection = async (msgId: string) => {
    const { error } = await supabase
      .from("ai_messages")
      .update({ corrected_content: null, corrected_at: null, corrected_by: null })
      .eq("id", msgId);
    if (!error) {
      toast({ title: "Corrección eliminada" });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, corrected_content: null, corrected_at: null } as any : m))
      );
      setCorrectionsCount((c) => Math.max(0, c - 1));
    }
  };

  const saveSystemPrompt = async () => {
    setSavingPrompt(true);
    const { error } = await supabase.from("app_settings").upsert({ key: "chatbot_system_prompt", value: promptDraft });
    setSavingPrompt(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSystemPrompt(promptDraft);
      setEditingPrompt(false);
      toast({ title: "System prompt actualizado", description: "Se aplicará en la siguiente conversación." });
    }
  };

  // Get the user question that preceded an assistant message
  const getUserQuestionBefore = (msgId: string): string | null => {
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx <= 0) return null;
    const prev = messages[idx - 1];
    return prev?.role === "user" ? prev.content : null;
  };

  if (selectedConv) {
    const conv = conversations.find((c) => c.id === selectedConv);
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedConv(null)} className="mb-4">← Volver</Button>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-medium text-sm">{conv?.visitor_name || "Visitante anónimo"}</h2>
          {conv?.is_lead_captured && <Badge className="bg-whatsapp/10 text-whatsapp text-[10px]">Lead capturado</Badge>}
          {conv?.source_page && <Badge variant="outline" className="text-[10px]">{conv.source_page}</Badge>}
        </div>

        {/* System Prompt Context Panel */}
        <Collapsible open={promptOpen} onOpenChange={setPromptOpen} className="mb-4">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-2.5 text-left hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">System Prompt activo</span>
                <Badge variant="outline" className="text-[10px]">{correctionsCount} correcciones activas</Badge>
              </div>
              {promptOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="rounded-lg border bg-card p-4 space-y-3">
              {editingPrompt ? (
                <>
                  <Textarea
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    rows={10}
                    className="font-mono text-xs leading-relaxed"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditingPrompt(false)} className="h-7 text-xs">Cancelar</Button>
                    <Button size="sm" onClick={saveSystemPrompt} disabled={savingPrompt} className="h-7 text-xs gap-1">
                      <Save className="h-3 w-3" />
                      {savingPrompt ? "Guardando..." : "Guardar prompt"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed max-h-48 overflow-y-auto">
                    {systemPrompt || "Sin prompt configurado"}
                  </pre>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => { setPromptDraft(systemPrompt); setEditingPrompt(true); }} className="h-7 text-xs gap-1">
                      <Pencil className="h-3 w-3" /> Editar prompt
                    </Button>
                  </div>
                </>
              )}
              <p className="text-[10px] text-muted-foreground border-t pt-2">
                💡 Las correcciones que hagas a las respuestas del bot se inyectan automáticamente como ejemplos de reentrenamiento junto a este prompt.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Messages */}
        <div className="space-y-3 rounded-lg border bg-card p-4 max-h-[55vh] overflow-y-auto">
          {loadingMsgs ? <Skeleton className="h-32 w-full" /> : messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">Sin mensajes</p>
          ) : messages.map((m) => {
            const msg = m as any;
            const isAssistant = m.role === "assistant";
            const isEditing = editingMsgId === m.id;
            const hasCorrected = !!msg.corrected_content;
            const userQuestion = isAssistant ? getUserQuestionBefore(m.id) : null;

            return (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {isEditing ? (
                    <div className="space-y-2">
                      {userQuestion && (
                        <div className="rounded bg-primary/5 border border-primary/10 px-3 py-2 mb-2">
                          <p className="text-[10px] font-medium text-primary mb-0.5">Pregunta del usuario:</p>
                          <p className="text-xs text-muted-foreground">{userQuestion}</p>
                        </div>
                      )}
                      <Label className="text-[10px] text-muted-foreground">Respuesta corregida:</Label>
                      <Textarea
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        rows={5}
                        className="text-sm bg-background"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditingMsgId(null)} className="h-7 text-xs">Cancelar</Button>
                        <Button size="sm" onClick={() => saveCorrection(m.id)} disabled={savingCorrection} className="h-7 text-xs">
                          {savingCorrection ? "Guardando..." : "Guardar corrección"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{m.content.replace(/\[LEAD_DATA:[^\]]*\]/g, "")}</p>
                      {hasCorrected && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Pencil className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-medium text-primary">Respuesta corregida (reentrenamiento)</span>
                          </div>
                          <p className="whitespace-pre-wrap text-xs bg-primary/5 text-foreground rounded px-2 py-1.5">
                            {msg.corrected_content}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] opacity-60">{new Date(m.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
                        {isAssistant && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary"
                              onClick={() => startCorrection(m)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              {hasCorrected ? "Editar" : "Corregir"}
                            </Button>
                            {hasCorrected && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px] text-destructive"
                                onClick={() => removeCorrection(m.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : conversations.length === 0 ? (
        <div className="py-12 text-center">
          <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No hay conversaciones aún</p>
        </div>
      ) : (
        <>
          {correctionsCount > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border bg-primary/5 px-4 py-2.5">
              <Eye className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{correctionsCount} correcciones</strong> activas se inyectan como ejemplos de reentrenamiento en cada conversación.
              </p>
            </div>
          )}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Visitante</th>
                  <th className="px-4 py-3 text-left font-medium">Página</th>
                  <th className="px-4 py-3 text-left font-medium">Mensajes</th>
                  <th className="px-4 py-3 text-left font-medium">Lead</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => loadMessages(c.id)}>
                    <td className="px-4 py-3 font-medium">{c.visitor_name || "Anónimo"}{c.visitor_email && <div className="text-xs text-muted-foreground">{c.visitor_email}</div>}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.source_page || "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{c.message_count}</Badge></td>
                    <td className="px-4 py-3">{c.is_lead_captured ? <Badge className="bg-whatsapp/10 text-whatsapp text-[10px]">✓ Capturado</Badge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
