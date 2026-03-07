-- Add device visibility to page_content
ALTER TABLE public.page_content ADD COLUMN IF NOT EXISTS visible_on text NOT NULL DEFAULT 'all';
COMMENT ON COLUMN public.page_content.visible_on IS 'Device visibility: all, desktop, mobile, hidden';

-- Add show_in_products to license_pricing
ALTER TABLE public.license_pricing ADD COLUMN IF NOT EXISTS show_in_products boolean NOT NULL DEFAULT true;