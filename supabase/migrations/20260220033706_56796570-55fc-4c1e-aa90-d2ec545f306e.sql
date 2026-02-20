
-- 1. Discount Coupons table
CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  lead_id UUID REFERENCES public.leads_trials(id) ON DELETE SET NULL,
  plan_key TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed' or 'percentage'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  original_price_cop NUMERIC NOT NULL DEFAULT 0,
  discounted_price_cop NUMERIC NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.discount_coupons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active coupons by code" ON public.discount_coupons FOR SELECT
  USING (is_active = true AND used_at IS NULL AND expires_at > now());

-- 2. Approved Email Domains table
CREATE TABLE public.approved_email_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.approved_email_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage domains" ON public.approved_email_domains FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active domains" ON public.approved_email_domains FOR SELECT
  USING (is_active = true);

-- Seed default domain
INSERT INTO public.approved_email_domains (domain, is_default, sort_order) VALUES ('ventas.click', true, 0);

-- 3. Add new columns to leads_trials
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS assigned_email TEXT;
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.discount_coupons(id) ON DELETE SET NULL;

-- 4. Trigger for updated_at on discount_coupons
CREATE TRIGGER update_discount_coupons_updated_at
  BEFORE UPDATE ON public.discount_coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approved_email_domains_updated_at
  BEFORE UPDATE ON public.approved_email_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
