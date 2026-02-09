
CREATE TABLE public.reseller_commission_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.reseller_applications(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_commission_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commission payments"
ON public.reseller_commission_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers can view own commission payments"
ON public.reseller_commission_payments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM reseller_applications ra
  WHERE ra.id = reseller_commission_payments.reseller_id
  AND ra.user_id = auth.uid()
));
