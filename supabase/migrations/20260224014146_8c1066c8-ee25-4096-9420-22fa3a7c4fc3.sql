
-- Storage bucket for shared resources (images, PDFs)
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-resources', 'shared-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view shared resources
CREATE POLICY "Public read shared resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'shared-resources');

-- Admins can upload/manage shared resources
CREATE POLICY "Admins manage shared resources"
ON storage.objects FOR ALL
USING (bucket_id = 'shared-resources' AND (SELECT has_role(auth.uid(), 'admin'::app_role)))
WITH CHECK (bucket_id = 'shared-resources' AND (SELECT has_role(auth.uid(), 'admin'::app_role)));

-- Add visible_to_public to training_videos for non-registered users
ALTER TABLE training_videos ADD COLUMN IF NOT EXISTS visible_to_public boolean NOT NULL DEFAULT false;

-- Add visible_to_public to support_articles for non-registered users  
ALTER TABLE support_articles ADD COLUMN IF NOT EXISTS visible_to_public boolean NOT NULL DEFAULT false;

-- Add visible_to_customer and visible_to_reseller to support_articles
ALTER TABLE support_articles ADD COLUMN IF NOT EXISTS visible_to_customer boolean NOT NULL DEFAULT true;
ALTER TABLE support_articles ADD COLUMN IF NOT EXISTS visible_to_reseller boolean NOT NULL DEFAULT true;
