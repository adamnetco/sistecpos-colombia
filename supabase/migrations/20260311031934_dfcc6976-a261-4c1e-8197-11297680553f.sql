
-- Table for multi-branch/location support per license
CREATE TABLE public.license_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL DEFAULT 'Sede Principal',
  pos_location TEXT,
  pos_plan_type TEXT,
  pos_license_hash TEXT,
  pos_invoice_count INTEGER DEFAULT 0,
  pos_created_at TIMESTAMPTZ,
  pos_expires_at TIMESTAMPTZ,
  expiry_reminder_sent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.license_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on license_branches"
ON public.license_branches FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_license_branches_updated_at
  BEFORE UPDATE ON public.license_branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_license_branches_license_id ON public.license_branches(license_id);
CREATE INDEX idx_license_branches_expires ON public.license_branches(pos_expires_at) WHERE is_active = true;
