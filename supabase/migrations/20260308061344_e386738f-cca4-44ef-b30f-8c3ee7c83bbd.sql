
CREATE OR REPLACE FUNCTION public.insert_pos_user(
  _license_id uuid,
  _pos_username text,
  _pos_store text,
  _pos_password text,
  _pos_role text DEFAULT 'admin',
  _user_email text DEFAULT NULL,
  _display_name text DEFAULT NULL,
  _notes text DEFAULT NULL,
  _registered_by uuid DEFAULT NULL,
  _user_id uuid DEFAULT NULL
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
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  INSERT INTO license_pos_users (
    license_id, pos_username, pos_store, pos_password_encrypted,
    pos_role, user_email, display_name, notes, registered_by, user_id
  ) VALUES (
    _license_id, _pos_username, _pos_store,
    armor(pgp_sym_encrypt(_pos_password, _key)),
    _pos_role, _user_email, _display_name, _notes, _registered_by, _user_id
  )
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;
