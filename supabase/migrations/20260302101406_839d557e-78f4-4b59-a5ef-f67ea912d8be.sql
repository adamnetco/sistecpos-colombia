
-- Add is_active column to license_pricing (default true so existing plans remain visible)
ALTER TABLE public.license_pricing ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
