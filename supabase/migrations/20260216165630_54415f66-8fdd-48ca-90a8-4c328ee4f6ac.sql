-- Make payment-proofs bucket public so providers can view proof via email links
UPDATE storage.buckets SET public = true WHERE id = 'payment-proofs';

-- Add public SELECT policy for payment-proofs
CREATE POLICY "Public read payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');