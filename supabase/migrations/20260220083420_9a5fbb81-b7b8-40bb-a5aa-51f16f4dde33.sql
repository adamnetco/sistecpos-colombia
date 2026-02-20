
-- Tabla: módulos add-on asociables a planes de licencia
CREATE TABLE IF NOT EXISTS public.plan_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price_cop integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  icon text NOT NULL DEFAULT 'Box',
  -- Restricción de planes (array de plan_keys, vacío = todos los planes)
  allowed_plan_keys text[] NOT NULL DEFAULT '{}',
  -- Si is_included = true, el módulo va incluido en allowed_plan_keys (no es add-on)
  is_included_in_plans text[] NOT NULL DEFAULT '{}',
  -- Orden de presentación
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabla pivot: relación producto ↔ módulo (para asociar productos del catálogo con módulos)
CREATE TABLE IF NOT EXISTS public.catalog_product_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.plan_modules(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, module_id)
);

-- RLS
ALTER TABLE public.plan_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_product_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage plan_modules"
  ON public.plan_modules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active plan_modules"
  ON public.plan_modules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage catalog_product_modules"
  ON public.catalog_product_modules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read catalog_product_modules"
  ON public.catalog_product_modules FOR SELECT
  USING (true);

-- Trigger updated_at
CREATE TRIGGER update_plan_modules_updated_at
  BEFORE UPDATE ON public.plan_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
