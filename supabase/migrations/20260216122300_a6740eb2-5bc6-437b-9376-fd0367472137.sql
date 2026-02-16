
-- Add qualification fields to leads_trials for the activation flow
ALTER TABLE public.leads_trials
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Colombia',
  ADD COLUMN IF NOT EXISTS uses_software boolean,
  ADD COLUMN IF NOT EXISTS knows_inventory boolean,
  ADD COLUMN IF NOT EXISTS main_pain text,
  ADD COLUMN IF NOT EXISTS ideal_pos_features text,
  ADD COLUMN IF NOT EXISTS daily_sales text,
  ADD COLUMN IF NOT EXISTS employee_count text,
  ADD COLUMN IF NOT EXISTS urgency text,
  ADD COLUMN IF NOT EXISTS activation_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS activation_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS requested_by_reseller_id uuid REFERENCES public.reseller_applications(id);

-- Create index for activation token lookup
CREATE INDEX IF NOT EXISTS idx_leads_trials_activation_token ON public.leads_trials(activation_token) WHERE activation_token IS NOT NULL;
