
-- Create storage bucket for OG/social images
INSERT INTO storage.buckets (id, name, public) VALUES ('og-images', 'og-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "OG images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'og-images');

-- Allow authenticated users to upload
CREATE POLICY "Admins can upload OG images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'og-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Admins can update OG images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'og-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Admins can delete OG images"
ON storage.objects FOR DELETE
USING (bucket_id = 'og-images' AND auth.role() = 'authenticated');
