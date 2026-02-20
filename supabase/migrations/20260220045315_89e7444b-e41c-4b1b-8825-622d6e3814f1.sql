
-- =============================================
-- 1. BUSINESSES TABLE
-- =============================================
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  nit TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on businesses"
  ON public.businesses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can view own business"
  ON public.businesses FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update own business"
  ON public.businesses FOR UPDATE TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. SUPPORT_SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE public.support_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'autogestion',
  status TEXT NOT NULL DEFAULT 'active',
  price_cop INTEGER NOT NULL DEFAULT 0,
  billing_anchor_day INTEGER DEFAULT 1,
  current_period_start DATE,
  current_period_end DATE,
  payment_method TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on support_subscriptions"
  ON public.support_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own subscription"
  ON public.support_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_support_subscriptions_updated_at
  BEFORE UPDATE ON public.support_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. CONTRACTS TABLE
-- =============================================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL DEFAULT 'sla_soporte',
  title TEXT NOT NULL,
  signed_at DATE,
  expires_at DATE,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on contracts"
  ON public.contracts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can view own contracts"
  ON public.contracts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = contracts.business_id
        AND b.owner_user_id = auth.uid()
    )
  );

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 4. TICKET_MESSAGES TABLE
-- =============================================
CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.client_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'customer',
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on ticket_messages"
  ON public.ticket_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view messages of own tickets"
  ON public.ticket_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_tickets t
      WHERE t.id = ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages on own tickets"
  ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.client_tickets t
      WHERE t.id = ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- =============================================
-- 5. ADD business_id TO profiles
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- =============================================
-- 6. STORAGE BUCKET for contract docs
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-docs', 'contract-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins full access on contract-docs"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'contract-docs' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'contract-docs' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can read own contract docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'contract-docs'
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.owner_user_id = auth.uid()
    )
  );
