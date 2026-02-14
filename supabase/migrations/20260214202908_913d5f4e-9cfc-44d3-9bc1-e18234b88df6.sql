
-- Dynamic license pricing table
CREATE TABLE public.license_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE,
  plan_label TEXT NOT NULL,
  plan_description TEXT,
  official_price_cop NUMERIC NOT NULL DEFAULT 0,
  selling_price_cop NUMERIC NOT NULL DEFAULT 0,
  implementation_price_cop NUMERIC NOT NULL DEFAULT 0,
  support_monthly_cop NUMERIC NOT NULL DEFAULT 120000,
  facilpos_product_url TEXT,
  is_annual BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.license_pricing ENABLE ROW LEVEL SECURITY;

-- Public read (prices are public info)
CREATE POLICY "Anyone can read license pricing"
ON public.license_pricing FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage license pricing"
ON public.license_pricing FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_license_pricing_updated_at
BEFORE UPDATE ON public.license_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data based on current FacilPOS prices
INSERT INTO public.license_pricing (plan_key, plan_label, plan_description, official_price_cop, selling_price_cop, implementation_price_cop, support_monthly_cop, facilpos_product_url, is_annual, sort_order) VALUES
('emprendedor', 'Plan Emprendedor', '1 punto de venta, ideal para pequeños negocios. 900 ventas/mes, 2 usuarios.', 472966, 549000, 150000, 120000, 'https://facilpos.co/producto/licencia-vip-anual-facil-pos-2-tiendas-ahorre-un-20/', true, 1),
('negocio', 'Plan Negocio', 'Inventario detallado, 2.000 ventas/mes con Facturación Electrónica, 4 usuarios.', 868937, 999000, 250000, 120000, 'https://facilpos.co/producto/software-pos-licencia-anual-muti-tienda-3-sucursales/', true, 2),
('empresarial', 'Plan Empresarial', 'Múltiples sedes, ilimitado F.E., ilimitados usuarios.', 1272241, 1479000, 400000, 120000, 'https://facilpos.co/producto/software-pos-licencia-anual-1-sucursal/', true, 3);
