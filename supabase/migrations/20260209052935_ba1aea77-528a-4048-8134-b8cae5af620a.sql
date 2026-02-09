
-- =====================================================
-- AUTO-SYNC TRIGGERS: Leads, Certificates, Resellers → contacts
-- =====================================================

-- 1. When a new lead_trial is created, auto-create a contact in CRM
CREATE OR REPLACE FUNCTION public.sync_lead_to_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_id uuid;
BEGIN
  -- Check for existing contact by email or phone (smart dedup)
  SELECT id INTO existing_id FROM contacts
  WHERE (email = NEW.email AND email IS NOT NULL)
     OR (phone = NEW.phone AND phone IS NOT NULL)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Link existing contact to this lead
    UPDATE contacts SET
      lead_id = NEW.id,
      business_name = COALESCE(contacts.business_name, NEW.business_name),
      business_type = COALESCE(contacts.business_type, NEW.business_type),
      city = COALESCE(contacts.city, NEW.city),
      utm_source = COALESCE(NEW.utm_source, contacts.utm_source),
      utm_medium = COALESCE(NEW.utm_medium, contacts.utm_medium),
      utm_campaign = COALESCE(NEW.utm_campaign, contacts.utm_campaign),
      updated_at = now()
    WHERE id = existing_id;
  ELSE
    -- Create new contact
    INSERT INTO contacts (
      full_name, email, phone, city, business_name, business_type,
      contact_type, source, pipeline_stage, lead_id,
      utm_source, utm_medium, utm_campaign
    ) VALUES (
      NEW.contact_name, NEW.email, NEW.phone, NEW.city,
      NEW.business_name, NEW.business_type,
      'prospect', COALESCE(NEW.source, 'website'), 'new', NEW.id,
      NEW.utm_source, NEW.utm_medium, NEW.utm_campaign
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lead_to_contact
AFTER INSERT ON leads_trials
FOR EACH ROW
EXECUTE FUNCTION sync_lead_to_contact();

-- 2. When a certificate_order is created, auto-create/link contact
CREATE OR REPLACE FUNCTION public.sync_certificate_to_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM contacts
  WHERE (email = NEW.email AND email IS NOT NULL)
     OR (phone = NEW.phone AND phone IS NOT NULL)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE contacts SET
      business_name = COALESCE(contacts.business_name, 'NIT: ' || NEW.nit),
      tags = array_append(COALESCE(contacts.tags, '{}'::text[]), 'certificado'),
      updated_at = now()
    WHERE id = existing_id;
  ELSE
    INSERT INTO contacts (
      full_name, email, phone, contact_type, source, pipeline_stage,
      business_name, tags
    ) VALUES (
      NEW.full_name, NEW.email, NEW.phone,
      'prospect', 'website', 'new',
      'NIT: ' || NEW.nit,
      ARRAY['certificado']
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_certificate_to_contact
AFTER INSERT ON certificate_orders
FOR EACH ROW
EXECUTE FUNCTION sync_certificate_to_contact();

-- 3. When a reseller is approved, auto-create/update contact as partner
CREATE OR REPLACE FUNCTION public.sync_reseller_to_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_id uuid;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status != 'approved' OR (OLD IS NOT NULL AND OLD.status = 'approved') THEN
    RETURN NEW;
  END IF;

  SELECT id INTO existing_id FROM contacts
  WHERE (email = NEW.email AND email IS NOT NULL)
     OR (phone = NEW.phone AND phone IS NOT NULL)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE contacts SET
      contact_type = 'partner',
      reseller_id = NEW.id,
      city = COALESCE(contacts.city, NEW.city),
      pipeline_stage = 'client',
      tags = array_append(COALESCE(contacts.tags, '{}'::text[]), 'socio'),
      updated_at = now()
    WHERE id = existing_id;
  ELSE
    INSERT INTO contacts (
      full_name, email, phone, city, contact_type, source,
      pipeline_stage, reseller_id, tags
    ) VALUES (
      NEW.full_name, NEW.email, NEW.phone, NEW.city,
      'partner', 'website', 'client', NEW.id,
      ARRAY['socio']
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reseller_to_contact
AFTER INSERT OR UPDATE ON reseller_applications
FOR EACH ROW
EXECUTE FUNCTION sync_reseller_to_contact();
