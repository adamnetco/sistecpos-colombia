import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, RotateCcw, Bot, User, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot, useChatbotVisibility } from "@/hooks/useChatbot";

/** Convert raw phone numbers like +573176268307 into markdown WhatsApp links */
function linkifyPhones(text: string): string {
  return text.replace(/\+?(57\d{10})/g, (match, num) => `[+${num}](https://wa.me/${num})`);
}

export function ChatbotWidget() {
  const location = useLocation();
  const visible = useChatbotVisibility(location.pathname);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, send, reset } = useChatbot(location.pathname);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!visible) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle button - positioned to the left of WhatsApp */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-[5.5rem] z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-bg text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Abrir chat"
          >
            <Bot className="h-7 w-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[60] flex w-[370px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
            style={{ height: "min(520px, calc(100vh - 6rem))" }}
          >
            {/* Header */}
            <div className="gradient-bg flex items-center justify-between px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Asistente SistecPOS</p>
                  <p className="text-[10px] opacity-80">Respuestas en tiempo real</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-primary-foreground hover:bg-white/20"
                  onClick={reset}
                  title="Nueva conversación"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-primary-foreground hover:bg-white/20"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-10 w-10 mx-auto text-primary/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    ¡Hola! 👋 Soy el asistente de SistecPOS.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pregúntame sobre software POS, planes o facturación electrónica.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["¿Qué planes tienen?", "¿Cómo funciona la facturación?", "Necesito una demo"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { send(q); }}
                        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-bg">
                      <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "gradient-bg text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none break-words [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>li]:my-0.5 [&>p+p]:mt-2">
                        <ReactMarkdown components={{
                          a: ({ href, children }) => {
                            if (!href) return <>{children}</>;
                            return (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary font-medium underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors">
                                <span>{children}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            );
                          },
                        }}>{linkifyPhones(m.content)}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-bg">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t bg-card p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border bg-muted/50 px-4 py-2.5 text-sm outline-none ring-primary focus:ring-2 disabled:opacity-50 transition-all"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-10 w-10 shrink-0 rounded-full gradient-bg text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Asistente IA · Puede cometer errores
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
