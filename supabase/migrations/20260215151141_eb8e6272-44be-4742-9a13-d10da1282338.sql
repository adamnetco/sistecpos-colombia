
-- Table to log scraping jobs
CREATE TABLE public.ai_scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pages_scraped INTEGER DEFAULT 0,
  entries_created INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.ai_scraping_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scraping jobs"
  ON public.ai_scraping_jobs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
