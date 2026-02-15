import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (msg: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
  );
}
