
-- =============================================
-- Tabla de proveedores
-- =============================================
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  supplier_type TEXT NOT NULL DEFAULT 'otro',
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suppliers"
ON public.suppliers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- Tabla de actividades de contacto (CRM)
-- =============================================
CREATE TABLE public.contact_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'note',
  description TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact activities"
ON public.contact_activities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- Lead score en contacts
-- =============================================
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS lead_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new';

-- =============================================
-- System prompt del chatbot en app_settings
-- =============================================
INSERT INTO public.app_settings (key, value)
VALUES ('chatbot_system_prompt', 'Eres el asistente virtual de SistecPOS, software POS colombiano. Ayuda a los visitantes con información sobre planes, precios, facturación electrónica y soporte técnico. Sé amable, conciso y profesional. Si el usuario muestra interés, captura su nombre, correo y teléfono.')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- Trigger para updated_at en suppliers
-- =============================================
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
