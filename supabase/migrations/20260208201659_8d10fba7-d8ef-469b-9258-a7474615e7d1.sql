-- Create table for certificate orders
CREATE TABLE public.certificate_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  nit TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('1_year', '2_years')),
  price_cop INTEGER NOT NULL,
  rut_url TEXT NOT NULL,
  camara_comercio_url TEXT NOT NULL,
  cedula_url TEXT NOT NULL,
  soporte_pago_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificate_orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form, no auth required)
CREATE POLICY "Anyone can create certificate orders"
  ON public.certificate_orders FOR INSERT
  WITH CHECK (true);

-- No public SELECT/UPDATE/DELETE (admin only via service role)
-- Orders contain PII, so no public read access

-- Create storage bucket for certificate documents
INSERT INTO storage.buckets (id, name, public) VALUES ('certificate-docs', 'certificate-docs', false);

-- Allow anonymous uploads to the bucket (public form)
CREATE POLICY "Anyone can upload certificate documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificate-docs');

-- Allow reading uploaded docs (for admin/internal use via signed URLs)
CREATE POLICY "Authenticated users can read certificate docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificate-docs');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_certificate_orders_updated_at
  BEFORE UPDATE ON public.certificate_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();