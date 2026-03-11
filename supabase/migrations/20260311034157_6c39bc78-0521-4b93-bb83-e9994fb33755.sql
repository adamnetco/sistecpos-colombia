DROP FUNCTION IF EXISTS public.get_pos_users_for_license(uuid);

CREATE OR REPLACE FUNCTION public.get_pos_users_for_license(_license_id uuid)
RETURNS TABLE(
  id uuid, license_id uuid, pos_username text, pos_store text,
  pos_password text, pos_role text, user_email text, display_name text,
  is_active boolean, last_verified_at timestamptz, notes text,
  created_at timestamptz, user_id uuid, branch_id uuid, branch_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT
    lpu.id, lpu.license_id, lpu.pos_username, lpu.pos_store,
    extensions.pgp_sym_decrypt(dearmor(lpu.pos_password_encrypted), _key),
    lpu.pos_role, lpu.user_email, lpu.display_name,
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at,
    lpu.user_id, lpu.branch_id, lb.branch_name
  FROM license_pos_users lpu
  LEFT JOIN license_branches lb ON lb.id = lpu.branch_id
  WHERE lpu.license_id = _license_id
  ORDER BY lpu.created_at DESC;
END;
$$;

-- Fix all other functions to use extensions.pgp_sym_encrypt/decrypt
CREATE OR REPLACE FUNCTION public.insert_pos_user(
  _license_id uuid, _pos_username text, _pos_store text, _pos_password text,
  _pos_role text DEFAULT 'admin', _user_email text DEFAULT NULL,
  _display_name text DEFAULT NULL, _notes text DEFAULT NULL,
  _registered_by uuid DEFAULT NULL, _user_id uuid DEFAULT NULL,
  _branch_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _id uuid;
  _key text := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  INSERT INTO public.license_pos_users (
    license_id, pos_username, pos_store, pos_password_encrypted,
    pos_role, user_email, display_name, notes, registered_by, user_id, branch_id
  ) VALUES (
    _license_id, _pos_username, _pos_store,
    armor(extensions.pgp_sym_encrypt(_pos_password, _key)),
    _pos_role, _user_email, _display_name, _notes, _registered_by, _user_id, _branch_id
  )
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_pos_user(
  _id uuid, _pos_username text DEFAULT NULL, _pos_store text DEFAULT NULL,
  _pos_password text DEFAULT NULL, _pos_role text DEFAULT NULL,
  _user_email text DEFAULT NULL, _display_name text DEFAULT NULL,
  _is_active boolean DEFAULT NULL, _notes text DEFAULT NULL,
  _user_id uuid DEFAULT NULL, _clear_user_link boolean DEFAULT false,
  _branch_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _key text := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  UPDATE public.license_pos_users
  SET
    pos_username = COALESCE(_pos_username, pos_username),
    pos_store = COALESCE(_pos_store, pos_store),
    pos_password_encrypted = CASE
      WHEN _pos_password IS NOT NULL THEN armor(extensions.pgp_sym_encrypt(_pos_password, _key))
      ELSE pos_password_encrypted
    END,
    pos_role = COALESCE(_pos_role, pos_role),
    user_email = CASE WHEN _clear_user_link THEN NULL ELSE COALESCE(_user_email, user_email) END,
    display_name = CASE WHEN _clear_user_link THEN NULL ELSE COALESCE(_display_name, display_name) END,
    user_id = CASE WHEN _clear_user_link THEN NULL WHEN _user_id IS NOT NULL THEN _user_id ELSE user_id END,
    branch_id = CASE WHEN _branch_id IS NOT NULL THEN _branch_id ELSE branch_id END,
    is_active = COALESCE(_is_active, is_active),
    notes = COALESCE(_notes, notes),
    updated_at = now()
  WHERE public.license_pos_users.id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_pos_users()
RETURNS TABLE(
  id uuid, license_id uuid, business_name text, license_key text,
  pos_username text, pos_store text, pos_password text, pos_role text,
  user_email text, display_name text, is_active boolean,
  last_verified_at timestamptz, notes text, created_at timestamptz,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT
    lpu.id, lpu.license_id, l.business_name, l.license_key,
    lpu.pos_username, lpu.pos_store,
    extensions.pgp_sym_decrypt(dearmor(lpu.pos_password_encrypted), _key),
    lpu.pos_role, lpu.user_email, lpu.display_name,
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at,
    lpu.user_id
  FROM license_pos_users lpu
  JOIN licenses l ON l.id = lpu.license_id
  ORDER BY l.business_name, lpu.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_client_pos_session(
  _user_id uuid, _pos_username text, _pos_store text, _pos_password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _id UUID;
  _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  INSERT INTO client_pos_sessions (user_id, pos_username, pos_store, pos_password_encrypted, last_success_at)
  VALUES (_user_id, _pos_username, _pos_store, armor(extensions.pgp_sym_encrypt(_pos_password, _key)), now())
  ON CONFLICT (user_id, pos_username, pos_store) DO UPDATE SET
    pos_password_encrypted = armor(extensions.pgp_sym_encrypt(_pos_password, _key)),
    last_success_at = now(),
    updated_at = now()
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_pos_sessions(_user_id uuid)
RETURNS TABLE(id uuid, pos_username text, pos_store text, pos_password text, last_success_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF _user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT cps.id, cps.pos_username, cps.pos_store,
    extensions.pgp_sym_decrypt(dearmor(cps.pos_password_encrypted), _key),
    cps.last_success_at
  FROM client_pos_sessions cps
  WHERE cps.user_id = _user_id AND cps.consent_given = true
  ORDER BY cps.last_success_at DESC;
END;
$$;