
-- ══════════════════════════════════════════════════
-- User Activity Tracking System
-- ══════════════════════════════════════════════════

-- 1. Portal access logs (login/access tracking)
CREATE TABLE public.user_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  user_role TEXT NOT NULL, -- admin, reseller, customer
  portal TEXT NOT NULL,    -- /admin, /socio, /clientes
  action TEXT NOT NULL DEFAULT 'portal_access', -- portal_access, video_view, chatbot_interaction, ticket_create, license_activate, demo_request
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast queries by user and by date
CREATE INDEX idx_user_access_logs_user ON public.user_access_logs (user_id, created_at DESC);
CREATE INDEX idx_user_access_logs_action ON public.user_access_logs (action, created_at DESC);
CREATE INDEX idx_user_access_logs_portal ON public.user_access_logs (portal, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read all logs
CREATE POLICY "Admins can read all access logs"
ON public.user_access_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Any authenticated user can insert their own logs
CREATE POLICY "Users can insert own access logs"
ON public.user_access_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. User access summary (materialized per-user stats)
CREATE TABLE public.user_access_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  user_email TEXT,
  total_access_count INT NOT NULL DEFAULT 0,
  last_access_at TIMESTAMPTZ,
  last_portal TEXT,
  total_videos_watched INT NOT NULL DEFAULT 0,
  total_chatbot_interactions INT NOT NULL DEFAULT 0,
  total_tickets_created INT NOT NULL DEFAULT 0,
  total_licenses_activated INT NOT NULL DEFAULT 0,
  total_demos_requested INT NOT NULL DEFAULT 0,
  first_access_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_access_summary_email ON public.user_access_summary (user_email);

ALTER TABLE public.user_access_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all summaries"
ON public.user_access_summary FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own summary"
ON public.user_access_summary FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow insert/update for system
CREATE POLICY "Users can upsert own summary"
ON public.user_access_summary FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summary"
ON public.user_access_summary FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Add user_id and user_role to ai_conversations for logged-in user tracking
ALTER TABLE public.ai_conversations
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS user_role TEXT;

-- 4. Function to upsert access summary on each log insert
CREATE OR REPLACE FUNCTION public.update_access_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_access_summary (user_id, user_email, total_access_count, last_access_at, last_portal, first_access_at,
    total_videos_watched, total_chatbot_interactions, total_tickets_created, total_licenses_activated, total_demos_requested)
  VALUES (
    NEW.user_id, NEW.user_email, 
    CASE WHEN NEW.action = 'portal_access' THEN 1 ELSE 0 END,
    now(), NEW.portal, now(),
    CASE WHEN NEW.action = 'video_view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'chatbot_interaction' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'ticket_create' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'license_activate' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'demo_request' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    user_email = COALESCE(EXCLUDED.user_email, user_access_summary.user_email),
    total_access_count = user_access_summary.total_access_count + CASE WHEN NEW.action = 'portal_access' THEN 1 ELSE 0 END,
    last_access_at = CASE WHEN NEW.action = 'portal_access' THEN now() ELSE user_access_summary.last_access_at END,
    last_portal = CASE WHEN NEW.action = 'portal_access' THEN NEW.portal ELSE user_access_summary.last_portal END,
    total_videos_watched = user_access_summary.total_videos_watched + CASE WHEN NEW.action = 'video_view' THEN 1 ELSE 0 END,
    total_chatbot_interactions = user_access_summary.total_chatbot_interactions + CASE WHEN NEW.action = 'chatbot_interaction' THEN 1 ELSE 0 END,
    total_tickets_created = user_access_summary.total_tickets_created + CASE WHEN NEW.action = 'ticket_create' THEN 1 ELSE 0 END,
    total_licenses_activated = user_access_summary.total_licenses_activated + CASE WHEN NEW.action = 'license_activate' THEN 1 ELSE 0 END,
    total_demos_requested = user_access_summary.total_demos_requested + CASE WHEN NEW.action = 'demo_request' THEN 1 ELSE 0 END,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_access_summary
AFTER INSERT ON public.user_access_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_access_summary();
