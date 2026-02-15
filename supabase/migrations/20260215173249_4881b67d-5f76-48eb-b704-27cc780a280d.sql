
-- Storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for ticket-attachments bucket
CREATE POLICY "Authenticated users can upload ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view ticket attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Users can delete own ticket attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'ticket-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add attachment columns to both ticket tables
ALTER TABLE public.client_tickets ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE public.reseller_tickets ADD COLUMN IF NOT EXISTS attachment_url text;
