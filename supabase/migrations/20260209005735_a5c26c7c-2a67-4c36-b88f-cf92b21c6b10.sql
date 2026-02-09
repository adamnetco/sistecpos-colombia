
-- 1. Add reseller association and RUT to licenses
ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS created_by_reseller_id uuid REFERENCES public.reseller_applications(id),
  ADD COLUMN IF NOT EXISTS rut_url text;

-- 2. Reseller module access (admin configures which modules each reseller can see)
CREATE TABLE public.reseller_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.reseller_applications(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, module_key)
);

ALTER TABLE public.reseller_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reseller modules"
  ON public.reseller_modules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers can view own modules"
  ON public.reseller_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reseller_applications ra
      WHERE ra.id = reseller_id AND ra.user_id = auth.uid()
    )
  );

-- 3. Dynamic commission engine
CREATE TABLE public.reseller_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.reseller_applications(id) ON DELETE CASCADE,
  product_type text NOT NULL,
  commission_type text NOT NULL DEFAULT 'percentage',
  commission_value numeric NOT NULL DEFAULT 0,
  min_amount integer DEFAULT 0,
  max_amount integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commissions"
  ON public.reseller_commissions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers can view own commissions"
  ON public.reseller_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reseller_applications ra
      WHERE ra.id = reseller_id AND ra.user_id = auth.uid()
    )
  );

-- 4. Reseller training/videos
CREATE TABLE public.reseller_trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text,
  content text,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trainings"
  ON public.reseller_trainings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers can view published trainings"
  ON public.reseller_trainings FOR SELECT
  USING (
    is_published = true
    AND has_role(auth.uid(), 'reseller'::app_role)
  );

-- 5. Reseller support tickets
CREATE TABLE public.reseller_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.reseller_applications(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tickets"
  ON public.reseller_tickets FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers can manage own tickets"
  ON public.reseller_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.reseller_applications ra
      WHERE ra.id = reseller_id AND ra.user_id = auth.uid()
    )
  );

-- 6. Update triggers for updated_at
CREATE TRIGGER update_reseller_commissions_updated_at
  BEFORE UPDATE ON public.reseller_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reseller_trainings_updated_at
  BEFORE UPDATE ON public.reseller_trainings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reseller_tickets_updated_at
  BEFORE UPDATE ON public.reseller_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. RLS for licenses: resellers can see only their own created licenses
CREATE POLICY "Resellers can view own licenses"
  ON public.licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reseller_applications ra
      WHERE ra.id = created_by_reseller_id AND ra.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can create licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'reseller'::app_role)
    AND created_by_reseller_id IS NOT NULL
  );
