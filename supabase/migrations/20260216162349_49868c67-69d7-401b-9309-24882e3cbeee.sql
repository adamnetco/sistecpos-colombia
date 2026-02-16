
-- Add supplier_id to licenses for traceability
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_licenses_supplier_id ON public.licenses(supplier_id);
