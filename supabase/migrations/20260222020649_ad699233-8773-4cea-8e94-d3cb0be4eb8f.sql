
-- Table for commercial packs (combo: License + Modules + Implementation + Support)
CREATE TABLE public.commercial_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tagline TEXT,
  badge TEXT,
  license_pricing_id UUID REFERENCES public.license_pricing(id),
  included_module_ids UUID[] DEFAULT '{}',
  implementation_included BOOLEAN NOT NULL DEFAULT true,
  support_months_included INTEGER NOT NULL DEFAULT 3,
  price_cop INTEGER NOT NULL DEFAULT 0,
  original_price_cop INTEGER,
  savings_cop INTEGER DEFAULT 0,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  target_business_types TEXT[] DEFAULT '{}',
  cta_whatsapp_message TEXT DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commercial_packs ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read active packs"
  ON public.commercial_packs FOR SELECT
  USING (is_active = true);

-- Admin management
CREATE POLICY "Admins can manage packs"
  ON public.commercial_packs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add show_in_catalog and plan metadata to support_subscriptions for the /planes landing
ALTER TABLE public.support_subscriptions
  ADD COLUMN IF NOT EXISTS plan_label TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS plan_description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_in_landing BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS cta_whatsapp_message TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'both';
