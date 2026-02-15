
-- Add POS credentials fields to leads_trials for demo management
ALTER TABLE public.leads_trials 
  ADD COLUMN IF NOT EXISTS pos_username text,
  ADD COLUMN IF NOT EXISTS pos_company text,
  ADD COLUMN IF NOT EXISTS pos_password text;
