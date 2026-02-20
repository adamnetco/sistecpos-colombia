
-- 1. Add max_cajas and max_usuarios to license_pricing (per-plan limits, not per-module)
ALTER TABLE public.license_pricing
  ADD COLUMN IF NOT EXISTS max_cajas integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_usuarios integer DEFAULT 2;

-- 2. Add show_in_catalog toggle to plan_modules (controls visibility on product catalog cards)
ALTER TABLE public.plan_modules
  ADD COLUMN IF NOT EXISTS show_in_catalog boolean NOT NULL DEFAULT false;

-- 3. Drop the incorrectly placed columns from plan_modules (cajas/usuarios belong to plans, not modules)
ALTER TABLE public.plan_modules
  DROP COLUMN IF EXISTS max_cajas,
  DROP COLUMN IF EXISTS max_usuarios;

-- Update license_pricing with real limits per plan based on plan documentation
-- Básico: 1 caja, 2 usuarios
UPDATE public.license_pricing SET max_cajas = 1, max_usuarios = 2 WHERE plan_key = 'basico';
-- Intermedio: 2 cajas, 5 usuarios  
UPDATE public.license_pricing SET max_cajas = 2, max_usuarios = 5 WHERE plan_key = 'intermedio';
-- Premium: 4 cajas, ilimitados (usamos -1 para ilimitado)
UPDATE public.license_pricing SET max_cajas = 4, max_usuarios = -1 WHERE plan_key = 'premium';
-- Premium + Contabilidad: 4 cajas, ilimitados
UPDATE public.license_pricing SET max_cajas = 4, max_usuarios = -1 WHERE plan_key = 'premium_contabilidad';
-- Premium Multitienda 2: 8 cajas (4 por sede x2), ilimitados
UPDATE public.license_pricing SET max_cajas = 8, max_usuarios = -1 WHERE plan_key = 'premium_multi_2';
-- Premium Multitienda 3: 12 cajas, ilimitados
UPDATE public.license_pricing SET max_cajas = 12, max_usuarios = -1 WHERE plan_key = 'premium_multi_3';
-- Premium 2 Años: igual a Premium
UPDATE public.license_pricing SET max_cajas = 4, max_usuarios = -1 WHERE plan_key = 'premium_2anios';
-- Vitalicio: ilimitado
UPDATE public.license_pricing SET max_cajas = -1, max_usuarios = -1 WHERE plan_key = 'vitalicio';
