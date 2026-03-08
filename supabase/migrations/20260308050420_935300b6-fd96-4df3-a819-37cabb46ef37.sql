-- Alinear constraints con estados/planes/métodos usados por la app
ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_status_check;
ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'active'::text,
        'suspended'::text,
        'expired'::text,
        'pending_activation'::text,
        'pending_approval'::text,
        'rejected'::text
      ]
    )
  );

ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_plan_type_check;
ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_plan_type_check
  CHECK (
    plan_type = ANY (
      ARRAY[
        'basico'::text,
        'intermedio'::text,
        'premium'::text,
        'premium_contabilidad'::text,
        'premium_multi_2'::text,
        'premium_multi_3'::text,
        'premium_2anios'::text,
        'vitalicio'::text,
        -- Legacy compatibility
        'mensual'::text,
        'anual'::text,
        'emprendedor'::text,
        'negocio'::text,
        'empresarial'::text
      ]
    )
  );

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_payment_method_check
  CHECK (
    payment_method IS NULL OR payment_method = ANY (
      ARRAY[
        'transfer'::text,
        'cash'::text,
        'nequi'::text,
        'daviplata'::text,
        'card'::text,
        'other'::text,
        -- Backward compatibility with UI labels in use
        'transferencia'::text,
        'efectivo'::text,
        'wompi'::text,
        'otro'::text
      ]
    )
  );

ALTER TABLE public.leads_trials DROP CONSTRAINT IF EXISTS leads_trials_status_check;
ALTER TABLE public.leads_trials
  ADD CONSTRAINT leads_trials_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'new'::text,
        'contacted'::text,
        'welcome_sent'::text,
        'activation_completed'::text,
        'demo_personalized'::text,
        'active_trial'::text,
        'software_presentation'::text,
        'converted'::text,
        'lost'::text
      ]
    )
  );