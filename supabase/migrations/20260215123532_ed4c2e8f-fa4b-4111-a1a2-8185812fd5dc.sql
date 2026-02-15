
-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table for POS users per license (credentials encrypted)
CREATE TABLE public.license_pos_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  pos_username TEXT NOT NULL,
  pos_store TEXT NOT NULL,
  pos_password_encrypted TEXT NOT NULL,
  pos_role TEXT NOT NULL DEFAULT 'admin',
  user_email TEXT,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  registered_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only admins
ALTER TABLE public.license_pos_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on license_pos_users"
  ON public.license_pos_users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_license_pos_users_updated_at
  BEFORE UPDATE ON public.license_pos_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_license_pos_users_license ON public.license_pos_users(license_id);
CREATE INDEX idx_license_pos_users_email ON public.license_pos_users(user_email);

-- ===================== ENCRYPTED CRUD FUNCTIONS =====================

-- INSERT (encrypts password)
CREATE OR REPLACE FUNCTION public.insert_pos_user(
  _license_id UUID,
  _pos_username TEXT,
  _pos_store TEXT,
  _pos_password TEXT,
  _pos_role TEXT DEFAULT 'admin',
  _user_email TEXT DEFAULT NULL,
  _display_name TEXT DEFAULT NULL,
  _notes TEXT DEFAULT NULL,
  _registered_by UUID DEFAULT NULL
)
RETURNS UUID
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
    pos_role, user_email, display_name, notes, registered_by
  ) VALUES (
    _license_id, _pos_username, _pos_store,
    armor(pgp_sym_encrypt(_pos_password, _key)),
    _pos_role, _user_email, _display_name, _notes, _registered_by
  )
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- SELECT for a specific license (decrypts)
CREATE OR REPLACE FUNCTION public.get_pos_users_for_license(_license_id UUID)
RETURNS TABLE(
  id UUID,
  license_id UUID,
  pos_username TEXT,
  pos_store TEXT,
  pos_password TEXT,
  pos_role TEXT,
  user_email TEXT,
  display_name TEXT,
  is_active BOOLEAN,
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ
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
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at
  FROM license_pos_users lpu
  WHERE lpu.license_id = _license_id
  ORDER BY lpu.created_at DESC;
END;
$$;

-- SELECT ALL (admin global view, decrypts)
CREATE OR REPLACE FUNCTION public.get_all_pos_users()
RETURNS TABLE(
  id UUID,
  license_id UUID,
  business_name TEXT,
  license_key TEXT,
  pos_username TEXT,
  pos_store TEXT,
  pos_password TEXT,
  pos_role TEXT,
  user_email TEXT,
  display_name TEXT,
  is_active BOOLEAN,
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ
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
    lpu.is_active, lpu.last_verified_at, lpu.notes, lpu.created_at
  FROM license_pos_users lpu
  JOIN licenses l ON l.id = lpu.license_id
  ORDER BY l.business_name, lpu.created_at DESC;
END;
$$;

-- UPDATE (re-encrypts password if changed)
CREATE OR REPLACE FUNCTION public.update_pos_user(
  _id UUID,
  _pos_username TEXT DEFAULT NULL,
  _pos_store TEXT DEFAULT NULL,
  _pos_password TEXT DEFAULT NULL,
  _pos_role TEXT DEFAULT NULL,
  _user_email TEXT DEFAULT NULL,
  _display_name TEXT DEFAULT NULL,
  _is_active BOOLEAN DEFAULT NULL,
  _notes TEXT DEFAULT NULL
)
RETURNS VOID
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

  UPDATE license_pos_users SET
    pos_username = COALESCE(_pos_username, pos_username),
    pos_store = COALESCE(_pos_store, pos_store),
    pos_password_encrypted = CASE
      WHEN _pos_password IS NOT NULL THEN armor(pgp_sym_encrypt(_pos_password, _key))
      ELSE pos_password_encrypted
    END,
    pos_role = COALESCE(_pos_role, pos_role),
    user_email = COALESCE(_user_email, user_email),
    display_name = COALESCE(_display_name, display_name),
    is_active = COALESCE(_is_active, is_active),
    notes = COALESCE(_notes, notes),
    updated_at = now()
  WHERE license_pos_users.id = _id;
END;
$$;

-- DELETE
CREATE OR REPLACE FUNCTION public.delete_pos_user(_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  DELETE FROM license_pos_users WHERE id = _id;
END;
$$;

-- Seed demo credentials in app_settings
INSERT INTO public.app_settings (key, value) VALUES
  ('demo_pos_user', 'demo'),
  ('demo_pos_store', 'demo'),
  ('demo_pos_pass', 'demo')
ON CONFLICT (key) DO NOTHING;
