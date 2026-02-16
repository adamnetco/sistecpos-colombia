
-- Add SEO fields to catalog_products
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS google_product_category TEXT,
  ADD COLUMN IF NOT EXISTS gtin TEXT,
  ADD COLUMN IF NOT EXISTS mpn TEXT,
  ADD COLUMN IF NOT EXISTS brand_name TEXT,
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS shipping_weight_kg NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS custom_label_0 TEXT,
  ADD COLUMN IF NOT EXISTS custom_label_1 TEXT;
