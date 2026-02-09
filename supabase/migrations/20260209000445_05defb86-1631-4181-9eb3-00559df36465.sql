
-- Table for tracking scripts (GA, GTM, Facebook Pixel, custom code)
CREATE TABLE public.tracking_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  script_type TEXT NOT NULL DEFAULT 'custom',
  placement TEXT NOT NULL DEFAULT 'head',
  code TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tracking scripts"
  ON public.tracking_scripts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active tracking scripts"
  ON public.tracking_scripts FOR SELECT
  USING (is_enabled = true);

-- Add UTM columns to leads_trials
ALTER TABLE public.leads_trials
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add UTM columns to reseller_applications
ALTER TABLE public.reseller_applications
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Add UTM columns to contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
