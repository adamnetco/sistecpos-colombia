
-- Table to store Google OAuth tokens per user (encrypted)
CREATE TABLE public.google_user_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  token_expires_at timestamp with time zone,
  scopes text[] NOT NULL DEFAULT '{}',
  google_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.google_user_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins and the owner can see their own tokens
CREATE POLICY "Users can view own google tokens"
  ON public.google_user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins full access google tokens"
  ON public.google_user_tokens FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role needs access from edge functions
CREATE POLICY "Service role full access google tokens"
  ON public.google_user_tokens FOR ALL
  USING (true)
  WITH CHECK (true);

-- Table to store per-user Google Calendar config
CREATE TABLE public.google_calendar_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id text NOT NULL DEFAULT 'primary',
  label text NOT NULL DEFAULT 'Mi Calendario',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, calendar_id)
);

ALTER TABLE public.google_calendar_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar configs"
  ON public.google_calendar_configs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access calendar configs"
  ON public.google_calendar_configs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Functions to encrypt/decrypt Google tokens (same pattern as POS credentials)
CREATE OR REPLACE FUNCTION public.upsert_google_tokens(
  _user_id uuid,
  _access_token text,
  _refresh_token text,
  _expires_at timestamp with time zone,
  _scopes text[],
  _google_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _id UUID;
  _key TEXT := current_setting('app.settings.google_token_key', true);
BEGIN
  -- Use a fixed key from env or fallback
  IF _key IS NULL OR _key = '' THEN
    _key := 'gT0k3n$1st3cP0S_2025!S3cur3';
  END IF;

  INSERT INTO google_user_tokens (
    user_id, access_token_encrypted, refresh_token_encrypted,
    token_expires_at, scopes, google_email
  ) VALUES (
    _user_id,
    armor(pgp_sym_encrypt(_access_token, _key)),
    armor(pgp_sym_encrypt(_refresh_token, _key)),
    _expires_at, _scopes, _google_email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    access_token_encrypted = armor(pgp_sym_encrypt(_access_token, _key)),
    refresh_token_encrypted = armor(pgp_sym_encrypt(_refresh_token, _key)),
    token_expires_at = _expires_at,
    scopes = _scopes,
    google_email = COALESCE(_google_email, google_user_tokens.google_email),
    updated_at = now()
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_google_tokens(_user_id uuid)
RETURNS TABLE(
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  scopes text[],
  google_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _key TEXT := current_setting('app.settings.google_token_key', true);
BEGIN
  IF _key IS NULL OR _key = '' THEN
    _key := 'gT0k3n$1st3cP0S_2025!S3cur3';
  END IF;

  -- Only the user themselves or an admin can read tokens
  IF _user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT
    pgp_sym_decrypt(dearmor(gut.access_token_encrypted), _key),
    pgp_sym_decrypt(dearmor(gut.refresh_token_encrypted), _key),
    gut.token_expires_at,
    gut.scopes,
    gut.google_email
  FROM google_user_tokens gut
  WHERE gut.user_id = _user_id;
END;
$$;
