
CREATE OR REPLACE FUNCTION public.sync_lead_to_contact()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_existing_id uuid;
BEGIN
  SELECT id INTO v_existing_id FROM public.contacts WHERE lead_id = NEW.id LIMIT 1;
  IF v_existing_id IS NOT NULL THEN RETURN NEW; END IF;

  IF NEW.email IS NOT NULL THEN
    SELECT id INTO v_existing_id FROM public.contacts WHERE lower(email) = lower(NEW.email) LIMIT 1;
  END IF;
  IF v_existing_id IS NULL AND NEW.phone IS NOT NULL THEN
    SELECT id INTO v_existing_id FROM public.contacts WHERE phone = NEW.phone LIMIT 1;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.contacts
       SET lead_id = NEW.id,
           business_name = COALESCE(business_name, NEW.business_name),
           updated_at = now()
     WHERE id = v_existing_id;
    RETURN NEW;
  END IF;

  INSERT INTO public.contacts (full_name, email, phone, business_name, contact_type, source, lead_id, pipeline_stage, notes)
  VALUES (
    COALESCE(NULLIF(NEW.contact_name,''),'Sin nombre'),
    NEW.email, NEW.phone, NEW.business_name,
    'prospect', COALESCE(NEW.source,'website'),
    NEW.id, 'new',
    'Auto-creado desde solicitud de demo (' || COALESCE(NEW.source,'web') || ')'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_lead_to_contact ON public.leads_trials;
CREATE TRIGGER trg_sync_lead_to_contact
AFTER INSERT ON public.leads_trials
FOR EACH ROW EXECUTE FUNCTION public.sync_lead_to_contact();

-- Backfill 1: vincular contactos existentes (mismo email o teléfono) a leads sin contacto
UPDATE public.contacts c
   SET lead_id = lt.id, updated_at = now()
  FROM public.leads_trials lt
 WHERE c.lead_id IS NULL
   AND lt.id NOT IN (SELECT lead_id FROM public.contacts WHERE lead_id IS NOT NULL)
   AND (
     (lt.email IS NOT NULL AND lower(c.email) = lower(lt.email))
     OR (lt.phone IS NOT NULL AND c.phone = lt.phone)
   );

-- Backfill 2: crear contactos para leads que aún no tienen ninguno y cuyo email/teléfono no choca
INSERT INTO public.contacts (full_name, email, phone, business_name, contact_type, source, lead_id, pipeline_stage, notes, created_at)
SELECT
  COALESCE(NULLIF(lt.contact_name,''),'Sin nombre'),
  lt.email, lt.phone, lt.business_name,
  'prospect', COALESCE(lt.source,'website'),
  lt.id, 'new', 'Backfill desde leads_trials', lt.created_at
FROM public.leads_trials lt
LEFT JOIN public.contacts c ON c.lead_id = lt.id
WHERE c.id IS NULL
  AND (lt.email IS NULL OR NOT EXISTS (SELECT 1 FROM public.contacts x WHERE lower(x.email) = lower(lt.email)));
