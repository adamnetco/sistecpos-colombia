
-- Protect master admin role: eduardotp77@gmail.com can never have their admin role removed
-- and no one can delete/update their role entry

CREATE OR REPLACE FUNCTION public.protect_master_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  master_uid uuid;
BEGIN
  -- Get the master user's ID
  SELECT id INTO master_uid FROM auth.users WHERE email = 'eduardotp77@gmail.com' LIMIT 1;
  
  IF master_uid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Block DELETE of master's roles
  IF TG_OP = 'DELETE' AND OLD.user_id = master_uid THEN
    RAISE EXCEPTION 'No se puede eliminar el rol del usuario maestro';
  END IF;

  -- Block UPDATE of master's roles
  IF TG_OP = 'UPDATE' AND OLD.user_id = master_uid THEN
    RAISE EXCEPTION 'No se puede modificar el rol del usuario maestro';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER protect_master_admin_trigger
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_master_admin();
