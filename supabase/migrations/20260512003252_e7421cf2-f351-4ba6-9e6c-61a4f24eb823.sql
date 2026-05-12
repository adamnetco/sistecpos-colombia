
-- 1. Make businesses owner optional + add CRM fields
ALTER TABLE public.businesses ALTER COLUMN owner_user_id DROP NOT NULL;
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS primary_contact_id uuid;

-- Allow admins to insert businesses freely (CRM-managed)
DROP POLICY IF EXISTS "Admins can insert businesses" ON public.businesses;
CREATE POLICY "Admins can insert businesses" ON public.businesses
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. business_branches
CREATE TABLE IF NOT EXISTS public.business_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  branch_name text NOT NULL DEFAULT 'Sede Principal',
  city text,
  address text,
  phone text,
  email text,
  is_primary boolean NOT NULL DEFAULT false,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_branches_business ON public.business_branches(business_id);

ALTER TABLE public.business_branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage business_branches" ON public.business_branches;
CREATE POLICY "Admins manage business_branches" ON public.business_branches
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_business_branches_updated_at ON public.business_branches;
CREATE TRIGGER update_business_branches_updated_at
  BEFORE UPDATE ON public.business_branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. contacts: business + branch + role
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.business_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role_in_business text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS document_id text;
CREATE INDEX IF NOT EXISTS idx_contacts_business_id ON public.contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_contacts_branch_id ON public.contacts(branch_id);

-- 4. contact_activity_log
CREATE TABLE IF NOT EXISTS public.contact_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  actor_user_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cal_contact ON public.contact_activity_log(contact_id);
ALTER TABLE public.contact_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage contact_activity_log" ON public.contact_activity_log;
CREATE POLICY "Admins manage contact_activity_log" ON public.contact_activity_log
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. find_related_by_contact
CREATE OR REPLACE FUNCTION public.find_related_by_contact(_email text DEFAULT NULL, _phone text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  SELECT jsonb_build_object(
    'contacts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone,
        'business_id', c.business_id, 'business_name', c.business_name,
        'pipeline_stage', c.pipeline_stage, 'contact_type', c.contact_type
      ))
      FROM contacts c
      WHERE (_email IS NOT NULL AND c.email ILIKE _email)
         OR (_phone IS NOT NULL AND c.phone = _phone)
    ), '[]'::jsonb),
    'businesses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', b.id, 'business_name', b.business_name, 'nit', b.nit, 'city', b.city, 'phone', b.phone, 'email', b.email
      ))
      FROM businesses b
      WHERE (_email IS NOT NULL AND b.email ILIKE _email)
         OR (_phone IS NOT NULL AND b.phone = _phone)
    ), '[]'::jsonb),
    'leads', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'business_name', l.business_name, 'contact_name', l.contact_name,
        'email', l.email, 'phone', l.phone, 'status', l.status, 'created_at', l.created_at
      ))
      FROM leads_trials l
      WHERE (_email IS NOT NULL AND l.email ILIKE _email)
         OR (_phone IS NOT NULL AND l.phone = _phone)
    ), '[]'::jsonb),
    'licenses', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', li.id, 'business_name', li.business_name, 'license_key', li.license_key,
        'status', li.status, 'expires_at', li.expires_at
      ))
      FROM licenses li
      WHERE (_email IS NOT NULL AND li.contact_email ILIKE _email)
         OR (_phone IS NOT NULL AND li.contact_phone = _phone)
    ), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;

-- 6. parse_supplier_license: returns extracted fields as jsonb
CREATE OR REPLACE FUNCTION public.parse_supplier_license(_raw text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  _hash text;
  _location text;
  _tier text;
  _invoices int;
  _expires timestamptz;
  _created timestamptz;
  _billing text;
  _days int;
  _m text[];
BEGIN
  -- Hash 32 hex chars
  SELECT (regexp_match(_raw, '\b([a-f0-9]{32})\b', 'i'))[1] INTO _hash;

  -- Ubicación
  SELECT (regexp_match(_raw, 'Ubicaci[oó]n:?\s*([^\n\r\t]+?)(?:\s{2,}|Tipo:|$)', 'i'))[1] INTO _location;

  -- Tipo (Media/Alta/Basica/Premium...)
  SELECT (regexp_match(_raw, 'Tipo:?\s*([A-Za-zÁÉÍÓÚáéíóúñÑ]+)', 'i'))[1] INTO _tier;

  -- Facturas
  SELECT NULLIF((regexp_match(_raw, '\+\s*(\d+)\s*facturas?', 'i'))[1], '')::int INTO _invoices;

  -- Fechas YYYY-MM-DD HH:MM:SS
  SELECT (regexp_match(_raw, '(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})'))[1]::timestamptz INTO _expires;

  SELECT (regexp_match(_raw, 'Fecha de creaci[oó]n[^\d]*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})', 'i'))[1]::timestamptz INTO _created;

  -- Días
  SELECT NULLIF((regexp_match(_raw, '(\d+)\s*d[ií]as'))[1], '')::int INTO _days;

  -- Tipo de licencia (Anual/Mensual)
  SELECT (regexp_match(_raw, 'Tipo de licencia\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)', 'i'))[1] INTO _billing;

  RETURN jsonb_build_object(
    'license_key', _hash,
    'pos_location', trim(BOTH FROM COALESCE(_location, '')),
    'pos_plan_type', _tier,
    'pos_invoice_count', COALESCE(_invoices, 0),
    'pos_expires_at', _expires,
    'pos_created_at', _created,
    'duration_days', _days,
    'billing_type', _billing
  );
END;
$$;

-- 7. relax licenses_status_check to allow 'demo' & 'trial' and free expires_at (already nullable)
ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_status_check;
ALTER TABLE public.licenses ADD CONSTRAINT licenses_status_check
  CHECK (status = ANY (ARRAY['active','suspended','expired','pending_activation','pending_approval','rejected','demo','trial','cancelled']));

-- 8. relax licenses_plan_type_check (allow 'demo' and 'custom')
ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_plan_type_check;
ALTER TABLE public.licenses ADD CONSTRAINT licenses_plan_type_check
  CHECK (plan_type IS NOT NULL);

-- 9. Add business_id link on licenses for CRM linkage
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_licenses_business_id ON public.licenses(business_id);
