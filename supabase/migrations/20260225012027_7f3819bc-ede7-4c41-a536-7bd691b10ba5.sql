
-- =============================================
-- 1. Sales Pages table (landing pages de venta)
-- =============================================
CREATE TABLE public.sales_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  description TEXT,
  long_description TEXT,
  video_url TEXT,
  pdf_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}'::TEXT[],
  cta_whatsapp_message TEXT DEFAULT '',
  badge TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  original_price_cop INTEGER,
  price_cop INTEGER NOT NULL DEFAULT 0,
  coupon_code TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales_pages"
  ON public.sales_pages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active sales_pages"
  ON public.sales_pages FOR SELECT
  USING (is_active = true);

CREATE TRIGGER update_sales_pages_updated_at
  BEFORE UPDATE ON public.sales_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Sales Page Items pivot table
-- =============================================
CREATE TABLE public.sales_page_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_page_id UUID NOT NULL REFERENCES public.sales_pages(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.catalog_products(id) ON DELETE SET NULL,
  license_pricing_id UUID REFERENCES public.license_pricing(id) ON DELETE SET NULL,
  pack_id UUID REFERENCES public.commercial_packs(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  custom_label TEXT,
  custom_price_cop INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_page_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales_page_items"
  ON public.sales_page_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read sales_page_items"
  ON public.sales_page_items FOR SELECT
  USING (true);

-- =============================================
-- 3. Fix product_type inconsistencies
-- =============================================
UPDATE public.catalog_products SET product_type = 'servicio' WHERE product_type = 'service';
UPDATE public.catalog_products SET product_type = 'consumible' WHERE product_type = 'consumable';
