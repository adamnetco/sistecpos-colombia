
-- Table to store per-page SEO overrides
CREATE TABLE public.page_seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  page_label TEXT NOT NULL DEFAULT '',
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  robots TEXT DEFAULT 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  noindex BOOLEAN DEFAULT false,
  json_ld JSONB,
  priority NUMERIC(2,1) DEFAULT 0.5,
  changefreq TEXT DEFAULT 'weekly',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_seo_settings ENABLE ROW LEVEL SECURITY;

-- Public read for the SEO component
CREATE POLICY "Anyone can read page SEO settings"
  ON public.page_seo_settings FOR SELECT
  USING (true);

-- Only authenticated users (admins) can manage
CREATE POLICY "Authenticated users can insert page SEO settings"
  ON public.page_seo_settings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update page SEO settings"
  ON public.page_seo_settings FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete page SEO settings"
  ON public.page_seo_settings FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Auto-update timestamp trigger
CREATE TRIGGER update_page_seo_settings_updated_at
  BEFORE UPDATE ON public.page_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with main site pages
INSERT INTO public.page_seo_settings (page_path, page_label, meta_title, meta_description, noindex) VALUES
  ('/', 'Inicio', 'SistecPOS — Software POS Colombia | Facturación Electrónica DIAN', 'Software punto de venta para Colombia con facturación electrónica DIAN. Gestiona inventario, ventas y clientes desde $49.900/mes.', false),
  ('/soluciones', 'Soluciones', 'Soluciones POS por Tipo de Negocio | SistecPOS', 'Encuentra la solución POS ideal para tu negocio: restaurantes, tiendas, minimercados, droguerías y más.', false),
  ('/productos', 'Productos', 'Equipos y Periféricos POS Colombia | SistecPOS', 'Catálogo de hardware POS: impresoras térmicas, lectores de código de barras, cajones monederos y más.', false),
  ('/nosotros', 'Nosotros', 'Sobre SistecPOS — Empresa de Software POS en Colombia', 'Conoce al equipo detrás de SistecPOS, nuestra misión y valores como proveedor líder de soluciones POS en Colombia.', false),
  ('/comparativa-licencias', 'Comparativa Licencias', 'Planes y Precios SistecPOS 2026 | Comparativa de Licencias', 'Compara los planes Emprendedor, Negocio, Empresarial y Vitalicia de SistecPOS. Encuentra el ideal para tu negocio.', false),
  ('/comparar', 'Comparar Software', 'Comparar Software POS Colombia | SistecPOS vs Competencia', 'Compara SistecPOS con otros software POS de Colombia. Análisis detallado de funcionalidades, precios y soporte.', false),
  ('/representantes', 'Representantes', 'Programa de Representantes SistecPOS | Gana Comisiones', 'Únete al programa de representantes comerciales de SistecPOS y genera ingresos vendiendo software POS.', false),
  ('/guias-dian', 'Guías DIAN', 'Guías DIAN — Facturación Electrónica Colombia | SistecPOS', 'Guías completas sobre facturación electrónica DIAN, firma digital, habilitación y más para tu negocio en Colombia.', false),
  ('/contacto', 'Contacto', 'Contacto SistecPOS — Soporte y Ventas', 'Contáctanos por WhatsApp, teléfono o formulario. Soporte técnico y asesoría comercial para tu software POS.', false),
  ('/software-pos-colombia', 'Software POS Colombia', 'Software POS Colombia — Mejor Sistema Punto de Venta 2026', 'El mejor software punto de venta de Colombia con facturación electrónica DIAN, inventario y reportes en tiempo real.', false),
  ('/facturacion-electronica', 'Facturación Electrónica', 'Facturación Electrónica DIAN Colombia | SistecPOS', 'Sistema de facturación electrónica autorizado por la DIAN. Emite facturas, notas crédito y documentos soporte.', false),
  ('/casos-de-exito', 'Casos de Éxito', 'Casos de Éxito — Clientes SistecPOS', 'Descubre cómo negocios reales en Colombia optimizaron su operación con SistecPOS.', false),
  ('/ayuda', 'Centro de Ayuda', 'Centro de Ayuda SistecPOS | Soporte y Documentación', 'Encuentra respuestas a tus preguntas sobre el software POS SistecPOS, configuración y uso.', false),
  ('/auth', 'Autenticación', NULL, NULL, true),
  ('/gracias', 'Gracias', NULL, NULL, true),
  ('/pago/resultado', 'Resultado de Pago', NULL, NULL, true),
  ('/politica-privacidad', 'Política de Privacidad', 'Política de Privacidad | SistecPOS', 'Conoce nuestra política de privacidad y tratamiento de datos personales conforme a la ley colombiana.', false),
  ('/terminos-condiciones', 'Términos y Condiciones', 'Términos y Condiciones | SistecPOS', 'Lee los términos y condiciones de uso del software SistecPOS y servicios asociados.', false);
