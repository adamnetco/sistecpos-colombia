
-- Function to auto-link a Google OAuth user to their approved reseller application
-- This runs as SECURITY DEFINER to bypass RLS on user_roles and reseller_applications
CREATE OR REPLACE FUNCTION public.link_reseller_on_login(_user_id uuid, _user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reseller_id uuid;
  _reseller_status text;
  _result jsonb := '{"linked": false}'::jsonb;
BEGIN
  -- Find approved reseller application matching user email
  SELECT id, status INTO _reseller_id, _reseller_status
  FROM reseller_applications
  WHERE lower(email) = lower(_user_email)
    AND status = 'approved'
  LIMIT 1;

  IF _reseller_id IS NULL THEN
    RETURN _result;
  END IF;

  -- Upsert reseller role for this user
  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'reseller')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Link user_id to reseller_applications if not already linked
  UPDATE reseller_applications
  SET user_id = _user_id, updated_at = now()
  WHERE id = _reseller_id
    AND (user_id IS NULL OR user_id != _user_id);

  _result := jsonb_build_object(
    'linked', true,
    'reseller_id', _reseller_id
  );

  RETURN _result;
END;
$$;
