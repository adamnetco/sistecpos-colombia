
-- Add new fields to client_tickets
ALTER TABLE public.client_tickets
  ADD COLUMN IF NOT EXISTS module text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- Add new fields to reseller_tickets
ALTER TABLE public.reseller_tickets
  ADD COLUMN IF NOT EXISTS module text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS video_url text;
