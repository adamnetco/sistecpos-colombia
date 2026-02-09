
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  page_label TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot settings"
  ON public.chatbot_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read chatbot settings"
  ON public.chatbot_settings FOR SELECT
  USING (true);

INSERT INTO public.chatbot_settings (page_path, page_label, is_enabled) VALUES
  ('/', 'Inicio', true),
  ('/contacto', 'Contacto', true),
  ('/software-pos-colombia', 'Software POS Colombia', true),
  ('/facturacion-electronica', 'Facturación Electrónica', true),
  ('/comparativa-licencias', 'Comparativa Licencias', true),
  ('/soluciones', 'Soluciones', false),
  ('/productos', 'Productos', false);
