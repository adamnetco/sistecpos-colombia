
-- Add pipeline_stage to reseller_applications for funnel tracking
ALTER TABLE public.reseller_applications
ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'registered';

-- Add calendar_url to app_settings for Google Calendar booking link
INSERT INTO public.app_settings (key, value)
VALUES ('google_calendar_url', '')
ON CONFLICT (key) DO NOTHING;

-- Track reseller funnel events (video watched, CTA clicked, etc.)
CREATE TABLE IF NOT EXISTS public.reseller_funnel_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_email text NOT NULL,
  reseller_id uuid REFERENCES public.reseller_applications(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- 'page_view', 'video_started', 'video_completed', 'cta_clicked', 'google_registered', 'calendar_booked'
  event_data jsonb DEFAULT '{}'::jsonb,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reseller_funnel_events ENABLE ROW LEVEL SECURITY;

-- Admins can read all events
CREATE POLICY "Admins can read reseller funnel events"
ON public.reseller_funnel_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert events (for anonymous tracking on landing pages)
CREATE POLICY "Anyone can insert reseller funnel events"
ON public.reseller_funnel_events FOR INSERT
WITH CHECK (true);
