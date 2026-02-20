
-- Tabla centralizada de etiquetas de catálogo
CREATE TABLE IF NOT EXISTS public.catalog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT 'default',
  -- Entidad a la que pertenece: product, module, service, subscription, plan
  entity_type TEXT NOT NULL DEFAULT 'product',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_boost BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de relación entre etiquetas y cualquier entidad (polimórfica)
CREATE TABLE IF NOT EXISTS public.catalog_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id UUID NOT NULL REFERENCES public.catalog_tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'product', 'module', 'service', 'subscription', 'plan'
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tag_id, entity_type, entity_id)
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_catalog_tags_entity_type ON public.catalog_tags(entity_type);
CREATE INDEX IF NOT EXISTS idx_catalog_tags_slug ON public.catalog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_catalog_tag_assignments_entity ON public.catalog_tag_assignments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_catalog_tag_assignments_tag ON public.catalog_tag_assignments(tag_id);

-- RLS
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tags"
  ON public.catalog_tags FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active tags"
  ON public.catalog_tags FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tag assignments"
  ON public.catalog_tag_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read tag assignments"
  ON public.catalog_tag_assignments FOR SELECT
  USING (true);

-- Trigger updated_at
CREATE TRIGGER update_catalog_tags_updated_at
  BEFORE UPDATE ON public.catalog_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Datos iniciales de etiquetas frecuentes
INSERT INTO public.catalog_tags (name, slug, description, color, entity_type, seo_boost, sort_order) VALUES
  ('Facturación electrónica', 'facturacion-electronica', 'Módulos y productos relacionados con facturación electrónica DIAN', 'blue', 'module', true, 1),
  ('Inventario', 'inventario', 'Control y gestión de inventario', 'green', 'module', true, 2),
  ('Contabilidad', 'contabilidad', 'Módulos contables y de finanzas', 'purple', 'module', true, 3),
  ('Restaurante', 'restaurante', 'Soluciones para sector restaurante', 'orange', 'product', true, 4),
  ('Comercio', 'comercio', 'Soluciones para comercios y tiendas', 'teal', 'product', true, 5),
  ('Impresora térmica', 'impresora-termica', 'Impresoras térmicas para punto de venta', 'gray', 'product', false, 6),
  ('Lector código barras', 'lector-codigo-barras', 'Lectores ópticos y escáneres', 'gray', 'product', false, 7),
  ('Add-on premium', 'addon-premium', 'Módulos adicionales de alto valor', 'gold', 'module', true, 8),
  ('Soporte prioritario', 'soporte-prioritario', 'Planes con soporte prioritario incluido', 'red', 'plan', true, 9),
  ('Multitienda', 'multitienda', 'Funcionalidad para múltiples tiendas o puntos de venta', 'indigo', 'module', true, 10),
  ('Tienda online', 'tienda-online', 'Módulos de comercio electrónico', 'cyan', 'module', true, 11),
  ('Nuevo', 'nuevo', 'Productos o módulos de reciente lanzamiento', 'green', 'product', false, 12),
  ('Oferta', 'oferta', 'Items en promoción especial', 'red', 'product', false, 13),
  ('Más vendido', 'mas-vendido', 'Top de ventas del catálogo', 'orange', 'product', true, 14),
  ('Anual', 'anual', 'Licencias de pago anual', 'blue', 'plan', false, 15),
  ('Emprendedor', 'emprendedor', 'Para negocios pequeños e iniciantes', 'green', 'plan', true, 16),
  ('Empresa', 'empresa', 'Para empresas medianas y grandes', 'purple', 'plan', true, 17),
  ('DIAN', 'dian', 'Relacionado con normativa DIAN Colombia', 'blue', 'module', true, 18),
  ('Accesorio POS', 'accesorio-pos', 'Accesorios y periféricos para punto de venta', 'gray', 'product', false, 19),
  ('Capacitación', 'capacitacion', 'Servicios de formación y entrenamiento', 'teal', 'service', true, 20)
ON CONFLICT (slug) DO NOTHING;
