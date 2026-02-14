-- Add image_url column to license_pricing
ALTER TABLE public.license_pricing
ADD COLUMN image_url text;

-- Create storage bucket for license product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('license-images', 'license-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "License images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'license-images');

-- Admin upload policy
CREATE POLICY "Admins can upload license images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'license-images'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin update policy
CREATE POLICY "Admins can update license images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'license-images'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin delete policy
CREATE POLICY "Admins can delete license images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'license-images'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);