
-- Add correction fields to ai_messages for admin retraining
ALTER TABLE public.ai_messages
  ADD COLUMN corrected_content text,
  ADD COLUMN corrected_by uuid,
  ADD COLUMN corrected_at timestamptz;

-- Index for quickly loading corrections as training examples
CREATE INDEX idx_ai_messages_corrected ON public.ai_messages (corrected_at)
  WHERE corrected_content IS NOT NULL;
