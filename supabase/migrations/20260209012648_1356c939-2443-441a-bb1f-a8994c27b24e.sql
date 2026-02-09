
-- Brands table
CREATE TABLE public.catalog_brands (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  website text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage brands" ON public.catalog_brands
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active brands" ON public.catalog_brands
  FOR SELECT USING (is_active = true);

-- Categories table
CREATE TABLE public.catalog_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage categories" ON public.catalog_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active categories" ON public.catalog_categories
  FOR SELECT USING (is_active = true);

-- Products table
CREATE TABLE public.catalog_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text,
  brand_id uuid REFERENCES public.catalog_brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.catalog_categories(id) ON DELETE SET NULL,
  description text,
  long_description text,
  price_cop integer NOT NULL DEFAULT 0,
  original_price_cop integer,
  price_usd numeric(10,2),
  original_price_usd numeric(10,2),
  cost_cop integer,
  image_url text,
  gallery_urls text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  specifications jsonb DEFAULT '[]',
  includes text[] DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_offer boolean NOT NULL DEFAULT false,
  product_type text NOT NULL DEFAULT 'hardware',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage products" ON public.catalog_products
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active products" ON public.catalog_products
  FOR SELECT USING (is_active = true);

-- Indexes
CREATE INDEX idx_catalog_products_brand ON public.catalog_products(brand_id);
CREATE INDEX idx_catalog_products_category ON public.catalog_products(category_id);
CREATE INDEX idx_catalog_products_type ON public.catalog_products(product_type);
CREATE INDEX idx_catalog_products_slug ON public.catalog_products(slug);

-- Triggers for updated_at
CREATE TRIGGER update_catalog_brands_updated_at
  BEFORE UPDATE ON public.catalog_brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_catalog_categories_updated_at
  BEFORE UPDATE ON public.catalog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_catalog_products_updated_at
  BEFORE UPDATE ON public.catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can manage product images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Seed default categories
INSERT INTO public.catalog_categories (name, slug, icon, sort_order) VALUES
  ('Licencias', 'licencias', 'FileText', 1),
  ('Módulos', 'modulos', 'FileText', 2),
  ('Impresoras', 'impresoras', 'Printer', 3),
  ('Etiquetas', 'etiquetas', 'Tag', 4),
  ('Cajones', 'cajones', 'CircleDollarSign', 5),
  ('Lectores', 'lectores', 'Barcode', 6),
  ('Papel', 'papel', 'ScrollText', 7);
