import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useActivityTracker } from "./useActivityTracker";
import React from "react";

type Msg = { role: "user" | "assistant"; content: string; messageDbId?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

function generateSessionId() {
  return crypto.randomUUID();
}

/** Detect if a URL is internal (same origin / relative path) */
function isInternalUrl(href: string): boolean {
  if (!href) return false;
  // Relative paths are internal
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

// ─── Chatbot state context (persists across route changes) ───

interface ChatbotContextType {
  messages: Msg[];
  isLoading: boolean;
  error: string | null;
  send: (input: string) => void;
  reset: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  userRole: string | null;
  submitFeedback: (msgIndex: number, isPositive: boolean, comment?: string) => Promise<void>;
  feedbackGiven: Set<number>;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const { user, roles } = useAuth();
  const { trackActivity } = useActivityTracker();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const sessionIdRef = useRef(generateSessionId());
  const sourcePageRef = useRef(window.location.pathname);
  const chatTrackedRef = useRef(false);

  // Determine primary role for context
  const userRole = roles.includes("admin")
    ? "admin"
    : roles.includes("reseller")
    ? "reseller"
    : roles.includes("customer")
    ? "customer"
    : null;

  // Update source page on navigation without resetting conversation
  useEffect(() => {
    sourcePageRef.current = window.location.pathname;
  });

  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;
      setError(null);

      const userMsg: Msg = { role: "user", content: input };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      let assistantSoFar = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        const cleaned = assistantSoFar.replace(/\[LEAD_DATA:[^\]]*\]/g, "");
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: cleaned } : m));
          }
          return [...prev, { role: "assistant", content: cleaned }];
        });
      };

      try {
        // Track chatbot interaction (once per session)
        if (!chatTrackedRef.current && user) {
          chatTrackedRef.current = true;
          const portal = sourcePageRef.current.startsWith("/admin")
            ? "/admin"
            : sourcePageRef.current.startsWith("/socio")
            ? "/socio"
            : sourcePageRef.current.startsWith("/clientes")
            ? "/clientes"
            : "/public";
          trackActivity("chatbot_interaction", portal, { topic: input.slice(0, 100) });
        }

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: updatedMessages,
            session_id: sessionIdRef.current,
            source_page: sourcePageRef.current,
            user_role: userRole,
            user_email: user?.email || null,
            user_id: user?.id || null,
          }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          if (resp.status === 429) {
            setError("Demasiadas solicitudes. Intenta en unos segundos.");
          } else if (resp.status === 402) {
            setError("Servicio temporalmente no disponible.");
          } else {
            setError(errData.error || "Error al contactar el asistente.");
          }
          setIsLoading(false);
          return;
        }

        if (!resp.body) throw new Error("No stream body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) upsertAssistant(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) upsertAssistant(content);
            } catch {
              /* ignore */
            }
          }
        }
      } catch (e) {
        console.error("Chat error:", e);
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, userRole, user?.email, user?.id, trackActivity]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setFeedbackGiven(new Set());
    sessionIdRef.current = generateSessionId();
    chatTrackedRef.current = false;
  }, []);

  const submitFeedback = useCallback(async (msgIndex: number, isPositive: boolean, comment?: string) => {
    const msg = messages[msgIndex];
    if (!msg || msg.role !== "assistant") return;

    // Find the assistant message DB id by matching content in the conversation
    try {
      const { data: conv } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("session_id", sessionIdRef.current)
        .maybeSingle();
      if (!conv) return;

      // Find the most recent assistant message matching this content
      const { data: dbMsg } = await supabase
        .from("ai_messages")
        .select("id")
        .eq("conversation_id", conv.id)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!dbMsg || dbMsg.length === 0) return;

      // Use the message position to find the right DB message
      const assistantMsgs = messages.filter((m, i) => m.role === "assistant" && i <= msgIndex);
      const dbIndex = assistantMsgs.length - 1;
      const targetDbMsg = dbMsg[dbMsg.length - 1 - dbIndex] || dbMsg[0];

      await supabase.from("ai_message_feedback").insert({
        message_id: targetDbMsg.id,
        conversation_id: conv.id,
        is_positive: isPositive,
        user_comment: comment || null,
        user_role: userRole,
      });

      setFeedbackGiven((prev) => new Set(prev).add(msgIndex));
    } catch (e) {
      console.error("Feedback error:", e);
    }
  }, [messages, userRole]);

  const value = React.useMemo(
    () => ({ messages, isLoading, error, send, reset, open, setOpen, userRole, submitFeedback, feedbackGiven }),
    [messages, isLoading, error, send, reset, open, userRole, submitFeedback, feedbackGiven]
  );

  return React.createElement(ChatbotContext.Provider, { value }, children);
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be inside ChatbotProvider");
  return ctx;
}

export { isInternalUrl };

export function useChatbotVisibility(currentPath: string) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(() => {
    // Immediately visible for admin/socio/clientes paths when likely logged in
    return currentPath.startsWith("/admin") || currentPath.startsWith("/socio") || currentPath.startsWith("/clientes");
  });

  useEffect(() => {
    // Always show chatbot for logged-in users or protected paths
    if (user || currentPath.startsWith("/admin") || currentPath.startsWith("/socio") || currentPath.startsWith("/clientes")) {
      setVisible(true);
      return;
    }

    // For anonymous users, check chatbot_settings
    (async () => {
      const { data } = await supabase
        .from("chatbot_settings")
        .select("page_path")
        .eq("is_enabled", true);

      if (data) {
        const enabled = data.some(
          (s: any) => currentPath === s.page_path || currentPath.startsWith(s.page_path + "/")
        );
        setVisible(enabled);
      }
    })();
  }, [currentPath, user]);

  return visible;
}
