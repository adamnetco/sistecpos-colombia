
-- Table to store client POS credentials with consent
CREATE TABLE public.client_pos_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pos_username TEXT NOT NULL,
  pos_store TEXT NOT NULL,
  pos_password_encrypted TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  last_success_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pos_username, pos_store)
);

ALTER TABLE public.client_pos_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users read own pos sessions"
  ON public.client_pos_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all sessions
CREATE POLICY "Admins read all pos sessions"
  ON public.client_pos_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Users can delete their own sessions (revoke consent)
CREATE POLICY "Users delete own pos sessions"
  ON public.client_pos_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any session
CREATE POLICY "Admins delete any pos session"
  ON public.client_pos_sessions FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- SECURITY DEFINER function to upsert with encryption (called from edge function)
CREATE OR REPLACE FUNCTION public.upsert_client_pos_session(
  _user_id UUID,
  _pos_username TEXT,
  _pos_store TEXT,
  _pos_password TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _id UUID;
  _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  INSERT INTO client_pos_sessions (user_id, pos_username, pos_store, pos_password_encrypted, last_success_at)
  VALUES (_user_id, _pos_username, _pos_store, armor(pgp_sym_encrypt(_pos_password, _key)), now())
  ON CONFLICT (user_id, pos_username, pos_store) DO UPDATE SET
    pos_password_encrypted = armor(pgp_sym_encrypt(_pos_password, _key)),
    last_success_at = now(),
    updated_at = now()
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- SECURITY DEFINER function to get decrypted sessions for a user
CREATE OR REPLACE FUNCTION public.get_client_pos_sessions(_user_id UUID)
RETURNS TABLE(id UUID, pos_username TEXT, pos_store TEXT, pos_password TEXT, last_success_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _key TEXT := 'sTc2025!P0sKr1pt0S3cur3';
BEGIN
  IF _user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  RETURN QUERY
  SELECT cps.id, cps.pos_username, cps.pos_store,
    pgp_sym_decrypt(dearmor(cps.pos_password_encrypted), _key),
    cps.last_success_at
  FROM client_pos_sessions cps
  WHERE cps.user_id = _user_id AND cps.consent_given = true
  ORDER BY cps.last_success_at DESC;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_client_pos_sessions_updated_at
  BEFORE UPDATE ON public.client_pos_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
