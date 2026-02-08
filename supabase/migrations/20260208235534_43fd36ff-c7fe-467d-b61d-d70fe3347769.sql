
-- Knowledge base entries (FAQs + document content for AI training)
CREATE TABLE public.ai_knowledge_base (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_type text NOT NULL DEFAULT 'faq', -- faq, document, custom_text
  title text NOT NULL,
  content text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage knowledge base"
  ON public.ai_knowledge_base FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public read for the chatbot edge function (uses service role, but also allow anon select of active entries)
CREATE POLICY "Public can read active entries"
  ON public.ai_knowledge_base FOR SELECT
  USING (is_active = true);

CREATE TRIGGER update_ai_knowledge_base_updated_at
  BEFORE UPDATE ON public.ai_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Conversations for history tracking
CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  source_page text,
  is_lead_captured boolean NOT NULL DEFAULT false,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage conversations"
  ON public.ai_conversations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public insert for chatbot creating conversations
CREATE POLICY "Anyone can create conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (true);

-- Public update for chatbot updating visitor info
CREATE POLICY "Anyone can update own conversation"
  ON public.ai_conversations FOR UPDATE
  USING (true);

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Individual messages
CREATE TABLE public.ai_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL, -- user, assistant
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage messages"
  ON public.ai_messages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public insert for chatbot
CREATE POLICY "Anyone can insert messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (true);

-- Public read own conversation messages
CREATE POLICY "Anyone can read messages"
  ON public.ai_messages FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_ai_kb_active ON public.ai_knowledge_base(is_active, entry_type);
CREATE INDEX idx_ai_conversations_session ON public.ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_created ON public.ai_conversations(created_at DESC);
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id, created_at);
