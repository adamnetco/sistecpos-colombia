
-- ==========================================
-- 1. SUCCESS STORIES / CASOS DE ÉXITO
-- ==========================================
CREATE TABLE public.success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  city TEXT,
  contact_name TEXT,
  contact_role TEXT,
  quote TEXT,
  challenge TEXT,
  solution TEXT,
  results TEXT,
  image_url TEXT,
  logo_url TEXT,
  video_url TEXT,
  metrics JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage success stories"
  ON public.success_stories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read published stories"
  ON public.success_stories FOR SELECT
  USING (is_published = true);

CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON public.success_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 2. DYNAMIC FAQs
-- ==========================================
CREATE TABLE public.dynamic_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  page_slug TEXT DEFAULT 'global',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dynamic_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage FAQs"
  ON public.dynamic_faqs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active FAQs"
  ON public.dynamic_faqs FOR SELECT
  USING (is_active = true);

CREATE TRIGGER update_dynamic_faqs_updated_at
  BEFORE UPDATE ON public.dynamic_faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 3. SITE SETTINGS (extensible key-value + structured)
-- ==========================================
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_group TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(setting_group, setting_key)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active settings"
  ON public.site_settings FOR SELECT
  USING (is_active = true);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 4. NAV ITEMS (gestion de navegación)
-- ==========================================
CREATE TABLE public.nav_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  parent_id UUID REFERENCES public.nav_items(id) ON DELETE SET NULL,
  position TEXT NOT NULL DEFAULT 'main',
  is_external BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage nav items"
  ON public.nav_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active nav items"
  ON public.nav_items FOR SELECT
  USING (is_active = true);

CREATE TRIGGER update_nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 5. ADD MULTIMEDIA FIELDS TO PRODUCTS
-- ==========================================
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pdf_urls JSONB DEFAULT '[]'::jsonb;

-- ==========================================
-- 6. SEED DEFAULT WHATSAPP SETTINGS
-- ==========================================
INSERT INTO public.site_settings (setting_group, setting_key, setting_value) VALUES
  ('whatsapp', 'main_number', '"573176268307"'),
  ('whatsapp', 'welcome_message', '"Hola, quiero información sobre SistecPOS"'),
  ('whatsapp', 'is_enabled', 'true'),
  ('whatsapp', 'schedule', '{"start": "08:00", "end": "18:00", "timezone": "America/Bogota"}')
ON CONFLICT (setting_group, setting_key) DO NOTHING;

-- ==========================================
-- 7. CREATE STORAGE BUCKET FOR CASE STUDY ASSETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('success-stories', 'success-stories', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read success story files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'success-stories');

CREATE POLICY "Admins can manage success story files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'success-stories' AND has_role(auth.uid(), 'admin'::app_role));

-- Product documents bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-docs', 'product-docs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read product docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-docs');

CREATE POLICY "Admins can manage product docs"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-docs' AND has_role(auth.uid(), 'admin'::app_role));
