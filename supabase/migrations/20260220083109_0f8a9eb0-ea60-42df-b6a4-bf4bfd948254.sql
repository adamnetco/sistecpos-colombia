
-- Add whatsapp_support column to suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS whatsapp_support text NULL;

COMMENT ON COLUMN public.suppliers.whatsapp_support IS 'Número WhatsApp de soporte técnico de 2do nivel del proveedor (formato internacional, ej: 573001234567)';
