
-- Add business age fields to leads_trials
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS business_age_value integer;
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS business_age_period text; -- 'meses' or 'años'
ALTER TABLE public.leads_trials ADD COLUMN IF NOT EXISTS software_change_reason text;

-- Add description (markdown) to training_videos
ALTER TABLE public.training_videos ADD COLUMN IF NOT EXISTS description text;

-- Create support articles table (blog-style, Notion-like)
CREATE TABLE public.support_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '', -- Markdown content with checklists, videos, etc.
  category TEXT NOT NULL DEFAULT 'general',
  cover_image_url TEXT,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  author_name TEXT DEFAULT 'Equipo SistecPOS',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_articles ENABLE ROW LEVEL SECURITY;

-- Admins manage articles
CREATE POLICY "Admins can manage support articles"
ON public.support_articles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Published articles readable by authenticated users (clients/resellers)
CREATE POLICY "Authenticated users can read published articles"
ON public.support_articles FOR SELECT
USING (is_published = true AND auth.uid() IS NOT NULL);

-- Increment view count function
CREATE OR REPLACE FUNCTION public.increment_article_view(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE support_articles SET view_count = view_count + 1 WHERE id = article_id;
END;
$$;

-- Updated_at trigger
CREATE TRIGGER update_support_articles_updated_at
BEFORE UPDATE ON public.support_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
