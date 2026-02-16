
-- Add lead_id to licenses for traceability from CRM lead to license
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads_trials(id);

-- Add converted_at to leads_trials to track when a lead was converted
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS converted_at timestamptz;

-- Add index for lead_id on licenses
CREATE INDEX IF NOT EXISTS idx_licenses_lead_id ON public.licenses(lead_id);
