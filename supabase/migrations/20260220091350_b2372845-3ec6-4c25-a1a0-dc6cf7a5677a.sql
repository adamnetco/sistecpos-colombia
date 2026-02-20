
-- Add max_cajas and max_usuarios columns to plan_modules for per-plan limits
ALTER TABLE public.plan_modules
  ADD COLUMN IF NOT EXISTS max_cajas jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_usuarios jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.plan_modules.max_cajas IS 'JSON map of plan_key -> number of cajas allowed, e.g. {"basico":1,"intermedio":2,"premium":4}';
COMMENT ON COLUMN public.plan_modules.max_usuarios IS 'JSON map of plan_key -> number of users allowed, e.g. {"basico":2,"intermedio":4,"premium":0}';
