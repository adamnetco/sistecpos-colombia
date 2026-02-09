
-- Allow admins to read/manage files in certificate-docs bucket
CREATE POLICY "Admins can read certificate docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificate-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete certificate docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'certificate-docs' AND public.has_role(auth.uid(), 'admin'));

-- Allow anyone to upload to certificate-docs (public form)
CREATE POLICY "Anyone can upload certificate docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificate-docs');
