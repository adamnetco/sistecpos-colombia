
-- Add activation tracking fields to licenses
ALTER TABLE public.licenses 
ADD COLUMN IF NOT EXISTS payment_proof_url text,
ADD COLUMN IF NOT EXISTS activation_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS provider_notes text;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload payment proofs
CREATE POLICY "Admins can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

-- Allow authenticated users to read payment proofs
CREATE POLICY "Admins can read payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
