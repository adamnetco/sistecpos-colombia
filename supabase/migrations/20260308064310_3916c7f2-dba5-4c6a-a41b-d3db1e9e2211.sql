-- 1) Schema alignment: add missing user_id column for POS-user platform linkage
ALTER TABLE public.license_pos_users
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Link to public profile identities (never auth.users directly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'license_pos_users_user_id_fkey'
      AND conrelid = 'public.license_pos_users'::regclass
  ) THEN
    ALTER TABLE public.license_pos_users
      ADD CONSTRAINT license_pos_users_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(user_id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_license_pos_users_user_id
  ON public.license_pos_users(user_id);

-- 3) Remove legacy overload to avoid function-resolution ambiguity
DROP FUNCTION IF EXISTS public.insert_pos_user(
  uuid, text, text, text, text, text, text, text, uuid
);

-- 4) Canonical insert function with user linkage support
CREATE OR REPLACE FUNCTION public.insert_pos_user(
  _license_id uuid,
  _pos_username text,
  _pos_store text,
  _pos_password text,
  _pos_role text DEFAULT 'admin'::text,
  _user_email text DEFAULT NULL::text,
  _display_name text DEFAULT NULL::text,
  _notes text DEFAULT NULL::text,
  _registered_by uuid DEFAULT NULL::uuid,
  _user_id uuid DEFAULT NULL::uuid
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
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  INSERT INTO public.license_pos_users (
    license_id,
    pos_username,
    pos_store,
    pos_password_encrypted,
    pos_role,
    user_email,
    display_name,
    notes,
    registered_by,
    user_id
  ) VALUES (
    _license_id,
    _pos_username,
    _pos_store,
    armor(pgp_sym_encrypt(_pos_password, _key)),
    _pos_role,
    _user_email,
    _display_name,
    _notes,
    _registered_by,
    _user_id
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$;

-- 5) Update function to support linking/unlinking platform users
CREATE OR REPLACE FUNCTION public.update_pos_user(
  _id uuid,
  _pos_username text DEFAULT NULL::text,
  _pos_store text DEFAULT NULL::text,
  _pos_password text DEFAULT NULL::text,
  _pos_role text DEFAULT NULL::text,
  _user_email text DEFAULT NULL::text,
  _display_name text DEFAULT NULL::text,
  _is_active boolean DEFAULT NULL::boolean,
  _notes text DEFAULT NULL::text,
  _user_id uuid DEFAULT NULL::uuid,
  _clear_user_link boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      WHEN _pos_password IS NOT NULL THEN armor(pgp_sym_encrypt(_pos_password, _key))
      ELSE pos_password_encrypted
    END,
    pos_role = COALESCE(_pos_role, pos_role),
    user_email = CASE
      WHEN _clear_user_link THEN NULL
      ELSE COALESCE(_user_email, user_email)
    END,
    display_name = CASE
      WHEN _clear_user_link THEN NULL
      ELSE COALESCE(_display_name, display_name)
    END,
    user_id = CASE
      WHEN _clear_user_link THEN NULL
      WHEN _user_id IS NOT NULL THEN _user_id
      ELSE user_id
    END,
    is_active = COALESCE(_is_active, is_active),
    notes = COALESCE(_notes, notes),
    updated_at = now()
  WHERE public.license_pos_users.id = _id;
END;
$function$;