CREATE OR REPLACE FUNCTION public.upsert_lead_from_external_json_srv(_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _id uuid;
  _action text;
  _email text := lower(nullif(_payload->>'email',''));
  _phone text := nullif(_payload->>'phone','');
  _ext_id int := nullif(_payload->>'id','')::int;
  _full_name text := trim(concat_ws(' ', _payload->>'name', _payload->>'last_names'));
  _status_ext text := upper(coalesce(_payload->>'status',''));
  _internal_status text;
  _day_demo text := _payload->>'day_demo';
  _days int;
  _trial_end timestamptz;
  _ba_value int;
  _ba_period text;
  _has_software boolean;
  _knows_inv boolean;
  _ext_created timestamptz;
  _ext_updated timestamptz;
BEGIN
  IF _payload IS NULL OR _payload = '{}'::jsonb THEN
    RAISE EXCEPTION 'Payload vacío';
  END IF;

  _internal_status := CASE _status_ext
    WHEN 'SIN CONTACTAR'  THEN 'new'
    WHEN 'CONTACTADO'     THEN 'contacted'
    WHEN 'INTERESADO'     THEN 'demo_personalized'
    WHEN 'DEMO'           THEN 'active_trial'
    WHEN 'DEMO ACTIVA'    THEN 'active_trial'
    WHEN 'CLIENTE'        THEN 'converted'
    WHEN 'CONVERTIDO'     THEN 'converted'
    WHEN 'DESCARTADO'     THEN 'lost'
    WHEN 'PERDIDO'        THEN 'lost'
    ELSE 'active_trial'
  END;

  IF _day_demo ~ 'demo_day_\d+' THEN
    _days := (regexp_match(_day_demo, 'demo_day_(\d+)'))[1]::int;
    _ext_created := nullif(_payload->>'created_at','')::timestamptz;
    _trial_end := COALESCE(_ext_created, now()) + (_days || ' days')::interval;
  END IF;

  IF (_payload->>'business_time') ~ '\d+' THEN
    _ba_value := (regexp_match(_payload->>'business_time','(\d+)'))[1]::int;
    _ba_period := CASE WHEN _payload->>'business_time' ILIKE '%a%o%' THEN 'Años' ELSE 'Meses' END;
  END IF;

  _has_software := CASE lower(coalesce(_payload->>'manage_software','')) WHEN 'si' THEN true WHEN 'sí' THEN true WHEN 'no' THEN false ELSE NULL END;
  _knows_inv    := CASE lower(coalesce(_payload->>'know_inventory',''))  WHEN 'si' THEN true WHEN 'sí' THEN true WHEN 'no' THEN false ELSE NULL END;

  _ext_created := nullif(_payload->>'created_at','')::timestamptz;
  _ext_updated := nullif(_payload->>'updated_at','')::timestamptz;

  IF _ext_id IS NOT NULL THEN
    SELECT id INTO _id FROM leads_trials WHERE external_lead_id = _ext_id LIMIT 1;
  END IF;
  IF _id IS NULL AND _email IS NOT NULL THEN
    SELECT id INTO _id FROM leads_trials WHERE lower(email) = _email LIMIT 1;
  END IF;
  IF _id IS NULL AND _phone IS NOT NULL THEN
    SELECT id INTO _id FROM leads_trials WHERE phone = _phone LIMIT 1;
  END IF;

  IF _id IS NULL THEN
    INSERT INTO leads_trials (
      business_name, contact_name, email, phone, city, country, business_type,
      status, source, trial_ends_at,
      external_lead_id, external_reseller_id, external_reseller_name,
      external_store_id, pos_store, pos_store_internal,
      license_key_external, pos_password_hash_external, external_token,
      external_created_at, external_updated_at, external_status, external_payload,
      qual_has_software, qual_knows_inventory, qual_main_pain, qual_ideal_pos,
      qual_sales_per_day, qual_employees, qual_time_to_systematize,
      qual_business_age_value, qual_business_age_period, notes
    ) VALUES (
      COALESCE(nullif(_payload->>'store',''), nullif(_payload->>'store_name',''), 'Sin nombre'),
      COALESCE(nullif(_full_name,''), 'Sin nombre'),
      COALESCE(_email, 'sin-email-'||_ext_id||'@import.local'),
      COALESCE(_phone, ''),
      nullif(_payload->>'city',''),
      COALESCE(nullif(_payload->>'country',''),'Colombia'),
      nullif(_payload->>'name_lang_key',''),
      _internal_status, 'panel_franquiciado_auto', _trial_end,
      _ext_id, nullif(_payload->>'reseller_id','')::int, nullif(_payload->>'reseller_name',''),
      nullif(_payload->>'store_id','')::int, nullif(_payload->>'store',''), nullif(_payload->>'store_name',''),
      nullif(_payload->>'license',''), nullif(_payload->>'password',''), nullif(_payload->>'token',''),
      _ext_created, _ext_updated, _status_ext, _payload,
      _has_software, _knows_inv, nullif(_payload->>'change_software_description',''), nullif(_payload->>'software_ideal',''),
      nullif(_payload->>'nom_sale',''), nullif(_payload->>'how_employees',''), nullif(_payload->>'in_time_systematize',''),
      _ba_value, _ba_period,
      'Ingest automático Panel Franquiciado ('||COALESCE(_payload->>'reseller_name','')||')'
    ) RETURNING id INTO _id;
    _action := 'created';
  ELSE
    UPDATE leads_trials SET
      business_name = COALESCE(business_name, nullif(_payload->>'store',''), nullif(_payload->>'store_name','')),
      contact_name  = COALESCE(NULLIF(contact_name,'Sin nombre'), nullif(_full_name,''), contact_name),
      email         = COALESCE(email, _email),
      phone         = COALESCE(NULLIF(phone,''), _phone),
      city          = COALESCE(city, nullif(_payload->>'city','')),
      country       = COALESCE(country, nullif(_payload->>'country','')),
      business_type = COALESCE(business_type, nullif(_payload->>'name_lang_key','')),
      status        = CASE WHEN status IN ('converted','lost') THEN status ELSE _internal_status END,
      trial_ends_at = COALESCE(_trial_end, trial_ends_at),
      external_lead_id       = COALESCE(external_lead_id, _ext_id),
      external_reseller_id   = COALESCE(external_reseller_id, nullif(_payload->>'reseller_id','')::int),
      external_reseller_name = COALESCE(external_reseller_name, nullif(_payload->>'reseller_name','')),
      external_store_id      = COALESCE(external_store_id, nullif(_payload->>'store_id','')::int),
      pos_store              = COALESCE(pos_store, nullif(_payload->>'store','')),
      pos_store_internal     = COALESCE(pos_store_internal, nullif(_payload->>'store_name','')),
      license_key_external   = COALESCE(license_key_external, nullif(_payload->>'license','')),
      pos_password_hash_external = COALESCE(pos_password_hash_external, nullif(_payload->>'password','')),
      external_token         = COALESCE(external_token, nullif(_payload->>'token','')),
      external_created_at    = COALESCE(external_created_at, _ext_created),
      external_updated_at    = _ext_updated,
      external_status        = _status_ext,
      external_payload       = _payload,
      qual_has_software      = COALESCE(qual_has_software, _has_software),
      qual_knows_inventory   = COALESCE(qual_knows_inventory, _knows_inv),
      qual_main_pain         = COALESCE(qual_main_pain, nullif(_payload->>'change_software_description','')),
      qual_ideal_pos         = COALESCE(qual_ideal_pos, nullif(_payload->>'software_ideal','')),
      qual_sales_per_day     = COALESCE(qual_sales_per_day, nullif(_payload->>'nom_sale','')),
      qual_employees         = COALESCE(qual_employees, nullif(_payload->>'how_employees','')),
      qual_time_to_systematize = COALESCE(qual_time_to_systematize, nullif(_payload->>'in_time_systematize','')),
      qual_business_age_value  = COALESCE(qual_business_age_value, _ba_value),
      qual_business_age_period = COALESCE(qual_business_age_period, _ba_period),
      updated_at = now()
    WHERE id = _id;
    _action := 'updated';
  END IF;

  RETURN jsonb_build_object('action', _action, 'lead_id', _id, 'external_lead_id', _ext_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.upsert_lead_from_external_json_srv(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_lead_from_external_json_srv(jsonb) TO service_role;