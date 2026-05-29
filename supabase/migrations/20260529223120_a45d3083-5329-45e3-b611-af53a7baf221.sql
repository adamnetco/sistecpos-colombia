
-- 1) ai_messages: remove blanket public SELECT
DROP POLICY IF EXISTS "Anyone can read messages" ON public.ai_messages;
CREATE POLICY "Admins can read messages"
ON public.ai_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) google_user_tokens: drop overly broad policy targeting public role
DROP POLICY IF EXISTS "Service role full access google tokens" ON public.google_user_tokens;

-- 3) leads_trials: remove public SELECT by activation_token; expose via RPC
DROP POLICY IF EXISTS "Allow read by activation_token" ON public.leads_trials;

CREATE OR REPLACE FUNCTION public.get_lead_by_activation_token(_token text)
RETURNS TABLE (
  id uuid,
  business_name text,
  contact_name text,
  email text,
  phone text,
  city text,
  business_type text,
  status text,
  trial_ends_at timestamptz,
  activation_completed_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT l.id, l.business_name, l.contact_name, l.email, l.phone, l.city,
         l.business_type, l.status, l.trial_ends_at, l.activation_completed_at
  FROM public.leads_trials l
  WHERE l.activation_token = _token
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_lead_by_activation_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_lead_by_activation_token(text) TO anon, authenticated;

-- 4) page_seo_settings: admin-only writes
DROP POLICY IF EXISTS "Authenticated users can insert page SEO settings" ON public.page_seo_settings;
DROP POLICY IF EXISTS "Authenticated users can update page SEO settings" ON public.page_seo_settings;
DROP POLICY IF EXISTS "Authenticated users can delete page SEO settings" ON public.page_seo_settings;

CREATE POLICY "Admins can insert page SEO settings"
ON public.page_seo_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update page SEO settings"
ON public.page_seo_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page SEO settings"
ON public.page_seo_settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5) training_videos: enforce visibility flags
DROP POLICY IF EXISTS "Authenticated users can read active training videos" ON public.training_videos;
CREATE POLICY "Read training videos by audience"
ON public.training_videos FOR SELECT
USING (
  is_active = true AND (
    visible_to_public = true
    OR (auth.uid() IS NOT NULL AND visible_to_customer = true)
    OR (auth.uid() IS NOT NULL AND visible_to_reseller = true AND has_role(auth.uid(), 'reseller'::app_role))
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 6) wompi_transactions: remove blanket public SELECT, expose via RPC for confirmation page
DROP POLICY IF EXISTS "Anyone can read transactions by reference" ON public.wompi_transactions;

CREATE OR REPLACE FUNCTION public.get_wompi_transaction_by_reference(_reference text)
RETURNS TABLE (
  id uuid,
  reference text,
  status text,
  amount_cents bigint,
  currency text,
  payment_method text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _reference IS NULL OR length(_reference) < 6 THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT t.id, t.reference, t.status, t.amount_cents, t.currency,
         t.payment_method, t.created_at, t.updated_at
  FROM public.wompi_transactions t
  WHERE t.reference = _reference
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_wompi_transaction_by_reference(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_wompi_transaction_by_reference(text) TO anon, authenticated;

-- 7) Storage policies fixes
-- certificate-docs: require auth on upload, drop duplicate
DROP POLICY IF EXISTS "Anyone can upload certificate docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload certificate documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload certificate docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificate-docs'
  AND auth.uid() IS NOT NULL
);

-- payment-proofs: remove public read
DROP POLICY IF EXISTS "Public read payment proofs" ON storage.objects;

-- contract-docs: scope reads to the contract's business
DROP POLICY IF EXISTS "Owners can read own contract docs" ON storage.objects;
CREATE POLICY "Owners can read own contract docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contract-docs'
  AND EXISTS (
    SELECT 1
    FROM public.contracts c
    JOIN public.businesses b ON b.id = c.business_id
    WHERE b.owner_user_id = auth.uid()
      AND (storage.foldername(name))[1] = c.id::text
  )
);
