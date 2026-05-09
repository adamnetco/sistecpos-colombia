
-- 1) Allow license_pos_users to belong to a lead (demo) instead of a license
ALTER TABLE public.license_pos_users
  ALTER COLUMN license_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads_trials(id) ON DELETE CASCADE;

ALTER TABLE public.license_pos_users
  DROP CONSTRAINT IF EXISTS license_pos_users_owner_chk;
ALTER TABLE public.license_pos_users
  ADD CONSTRAINT license_pos_users_owner_chk
  CHECK (license_id IS NOT NULL OR lead_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_license_pos_users_lead ON public.license_pos_users(lead_id);

-- 2) History table needs to support leads
ALTER TABLE public.pos_credential_history
  ALTER COLUMN license_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS lead_id uuid;

CREATE INDEX IF NOT EXISTS idx_pos_credential_history_lead ON public.pos_credential_history(lead_id);

-- 3) Update history trigger to capture lead_id
CREATE OR REPLACE FUNCTION public.log_pos_credential_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO pos_credential_history (pos_user_id, license_id, lead_id, action, pos_username, pos_store, pos_role, display_name, changed_by, source)
    VALUES (NEW.id, NEW.license_id, NEW.lead_id, 'created', NEW.pos_username, NEW.pos_store, NEW.pos_role, NEW.display_name, NEW.registered_by, 'manual');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.pos_username IS DISTINCT FROM NEW.pos_username
       OR OLD.pos_store IS DISTINCT FROM NEW.pos_store
       OR OLD.pos_role IS DISTINCT FROM NEW.pos_role
       OR OLD.is_active IS DISTINCT FROM NEW.is_active
       OR OLD.branch_id IS DISTINCT FROM NEW.branch_id
       OR OLD.license_id IS DISTINCT FROM NEW.license_id
       OR OLD.lead_id IS DISTINCT FROM NEW.lead_id THEN
      INSERT INTO pos_credential_history (pos_user_id, license_id, lead_id, action, pos_username, pos_store, pos_role, display_name, notes, source)
      VALUES (NEW.id, NEW.license_id, NEW.lead_id,
        CASE WHEN OLD.is_active AND NOT NEW.is_active THEN 'deactivated'
             WHEN NOT OLD.is_active AND NEW.is_active THEN 'reactivated'
             WHEN OLD.lead_id IS NOT NULL AND NEW.license_id IS NOT NULL AND NEW.lead_id IS NULL THEN 'migrated_from_demo'
             ELSE 'updated' END,
        NEW.pos_username, NEW.pos_store, NEW.pos_role, NEW.display_name,
        CASE WHEN OLD.pos_username IS DISTINCT FROM NEW.pos_username THEN 'Usuario: ' || OLD.pos_username || ' → ' || NEW.pos_username
             WHEN OLD.pos_role IS DISTINCT FROM NEW.pos_role THEN 'Rol: ' || OLD.pos_role || ' → ' || NEW.pos_role
             ELSE NULL END,
        'system');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) RPC: list POS users for a lead
CREATE OR REPLACE FUNCTION public.get_pos_users_for_lead(_lead_id uuid)
RETURNS TABLE(id uuid, lead_id uuid, pos_username text, pos_store text, pos_password text, pos_role text, user_email text, display_name text, is_active boolean, last_verified_at timestamptz, notes text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acceso denegado'; END IF;
  RETURN QUERY
  SELECT lpu.id, lpu.lead_id, lpu.pos_username, lpu.pos_store,
    extensions.pgp_sym_decrypt(extensions.dearmor(lpu.pos_password_encrypted), _key),
    lpu.pos_role, lpu.user_email, lpu.display_name,
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at
  FROM license_pos_users lpu
  WHERE lpu.lead_id = _lead_id
  ORDER BY lpu.created_at DESC;
END; $function$;

-- 5) RPC: insert POS user for a lead
CREATE OR REPLACE FUNCTION public.insert_pos_user_for_lead(
  _lead_id uuid,
  _pos_username text,
  _pos_store text,
  _pos_password text,
  _pos_role text DEFAULT 'admin',
  _user_email text DEFAULT NULL,
  _display_name text DEFAULT NULL,
  _notes text DEFAULT NULL,
  _registered_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _id uuid;
  _key text := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acceso denegado'; END IF;
  INSERT INTO public.license_pos_users (
    lead_id, pos_username, pos_store, pos_password_encrypted,
    pos_role, user_email, display_name, notes, registered_by
  ) VALUES (
    _lead_id, _pos_username, _pos_store,
    extensions.armor(extensions.pgp_sym_encrypt(_pos_password, _key)),
    _pos_role, _user_email, _display_name, _notes, _registered_by
  ) RETURNING id INTO _id;
  RETURN _id;
END; $function$;

-- 6) RPC: migrate all POS users from a lead to a license (used on conversion)
CREATE OR REPLACE FUNCTION public.migrate_lead_pos_users_to_license(_lead_id uuid, _license_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _count integer;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acceso denegado'; END IF;
  UPDATE public.license_pos_users
  SET license_id = _license_id, lead_id = NULL, updated_at = now()
  WHERE lead_id = _lead_id;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END; $function$;
