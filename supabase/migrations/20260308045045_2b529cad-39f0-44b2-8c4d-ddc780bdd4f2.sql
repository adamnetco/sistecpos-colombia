
ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS pos_location text,
  ADD COLUMN IF NOT EXISTS pos_plan_type text,
  ADD COLUMN IF NOT EXISTS pos_license_hash text,
  ADD COLUMN IF NOT EXISTS pos_invoice_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pos_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS pos_created_at timestamptz;

COMMENT ON COLUMN public.licenses.pos_location IS 'Ubicación del POS reportada por el proveedor';
COMMENT ON COLUMN public.licenses.pos_plan_type IS 'Tipo de plan reportado por el proveedor (ej: Basic)';
COMMENT ON COLUMN public.licenses.pos_license_hash IS 'Hash o clave de licencia interna del proveedor';
COMMENT ON COLUMN public.licenses.pos_invoice_count IS 'Número de facturas emitidas reportado por el proveedor';
COMMENT ON COLUMN public.licenses.pos_expires_at IS 'Fecha de vencimiento reportada por el proveedor';
COMMENT ON COLUMN public.licenses.pos_created_at IS 'Fecha de creación de la licencia en el sistema del proveedor';
