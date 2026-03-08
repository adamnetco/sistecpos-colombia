
-- Drop functions that need return type changes
DROP FUNCTION IF EXISTS public.get_pos_users_for_license(uuid);
DROP FUNCTION IF EXISTS public.get_all_pos_users();

-- Recreate get_pos_users_for_license with user_id
CREATE FUNCTION public.get_pos_users_for_license(_license_id uuid)
RETURNS TABLE(
  id uuid, license_id uuid, pos_username text, pos_store text,
  pos_password text, pos_role text, user_email text, display_name text,
  is_active boolean, last_verified_at timestamptz, notes text,
  created_at timestamptz, user_id uuid
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
    pgp_sym_decrypt(dearmor(lpu.pos_password_encrypted), _key),
    lpu.pos_role, lpu.user_email, lpu.display_name,
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at,
    lpu.user_id
  FROM license_pos_users lpu
  WHERE lpu.license_id = _license_id
  ORDER BY lpu.created_at DESC;
END;
$$;

-- Recreate get_all_pos_users with user_id
CREATE FUNCTION public.get_all_pos_users()
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
    pgp_sym_decrypt(dearmor(lpu.pos_password_encrypted), _key),
    lpu.pos_role, lpu.user_email, lpu.display_name,
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at,
    lpu.user_id
  FROM license_pos_users lpu
  JOIN licenses l ON l.id = lpu.license_id
  ORDER BY l.business_name, lpu.created_at DESC;
END;
$$;

-- Helper: search profiles for user picker (admin only)
CREATE OR REPLACE FUNCTION public.search_profiles(_query text, _limit int DEFAULT 10)
RETURNS TABLE(user_id uuid, email text, full_name text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT p.user_id, p.email, p.full_name, p.phone
  FROM profiles p
  WHERE p.email ILIKE '%' || _query || '%'
     OR p.full_name ILIKE '%' || _query || '%'
     OR p.phone ILIKE '%' || _query || '%'
  ORDER BY p.full_name
  LIMIT _limit;
END;
$$;
