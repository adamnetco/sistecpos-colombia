ALTER TABLE public.leads_trials
  ADD COLUMN IF NOT EXISTS qual_has_software boolean,
  ADD COLUMN IF NOT EXISTS qual_knows_inventory boolean,
  ADD COLUMN IF NOT EXISTS qual_main_pain text,
  ADD COLUMN IF NOT EXISTS qual_ideal_pos text,
  ADD COLUMN IF NOT EXISTS qual_sales_per_day text,
  ADD COLUMN IF NOT EXISTS qual_employees text,
  ADD COLUMN IF NOT EXISTS qual_time_to_systematize text,
  ADD COLUMN IF NOT EXISTS qual_business_age_value integer,
  ADD COLUMN IF NOT EXISTS qual_business_age_period text;