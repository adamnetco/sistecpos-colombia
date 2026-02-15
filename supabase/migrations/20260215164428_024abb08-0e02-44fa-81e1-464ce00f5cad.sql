
-- Feedback table for chatbot messages
CREATE TABLE public.ai_message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  is_positive BOOLEAN NOT NULL,
  user_comment TEXT,
  user_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_ai_message_feedback_message ON public.ai_message_feedback(message_id);
CREATE INDEX idx_ai_message_feedback_positive ON public.ai_message_feedback(is_positive);

-- Enable RLS
ALTER TABLE public.ai_message_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (chatbot is used by all visitors)
CREATE POLICY "Anyone can submit feedback" ON public.ai_message_feedback
  FOR INSERT WITH CHECK (true);

-- Only admins can read feedback
CREATE POLICY "Admins can read feedback" ON public.ai_message_feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
