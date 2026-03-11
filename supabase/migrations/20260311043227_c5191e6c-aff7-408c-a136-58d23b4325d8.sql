
-- Credential history tracking table
CREATE TABLE public.pos_credential_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_user_id uuid REFERENCES public.license_pos_users(id) ON DELETE CASCADE NOT NULL,
  license_id uuid NOT NULL,
  action text NOT NULL DEFAULT 'created',
  pos_username text,
  pos_store text,
  pos_role text,
  display_name text,
  notes text,
  changed_by uuid,
  source text DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.pos_credential_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage credential history"
  ON public.pos_credential_history FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_pos_credential_history_pos_user ON public.pos_credential_history(pos_user_id);
CREATE INDEX idx_pos_credential_history_license ON public.pos_credential_history(license_id);

-- Trigger to auto-log on insert/update of license_pos_users
CREATE OR REPLACE FUNCTION log_pos_credential_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO pos_credential_history (pos_user_id, license_id, action, pos_username, pos_store, pos_role, display_name, changed_by, source)
    VALUES (NEW.id, NEW.license_id, 'created', NEW.pos_username, NEW.pos_store, NEW.pos_role, NEW.display_name, NEW.registered_by, 'manual');
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log only meaningful changes
    IF OLD.pos_username IS DISTINCT FROM NEW.pos_username
       OR OLD.pos_store IS DISTINCT FROM NEW.pos_store
       OR OLD.pos_role IS DISTINCT FROM NEW.pos_role
       OR OLD.is_active IS DISTINCT FROM NEW.is_active
       OR OLD.branch_id IS DISTINCT FROM NEW.branch_id THEN
      INSERT INTO pos_credential_history (pos_user_id, license_id, action, pos_username, pos_store, pos_role, display_name, notes, source)
      VALUES (NEW.id, NEW.license_id, 
        CASE WHEN OLD.is_active AND NOT NEW.is_active THEN 'deactivated'
             WHEN NOT OLD.is_active AND NEW.is_active THEN 'reactivated'
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
$$;

CREATE TRIGGER trg_pos_credential_history
  AFTER INSERT OR UPDATE ON public.license_pos_users
  FOR EACH ROW EXECUTE FUNCTION log_pos_credential_change();
