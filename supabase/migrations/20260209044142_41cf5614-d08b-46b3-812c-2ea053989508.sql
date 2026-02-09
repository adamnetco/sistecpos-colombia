
-- 1. Add noscript_code to tracking_scripts for GTM dual-snippet support
ALTER TABLE public.tracking_scripts ADD COLUMN IF NOT EXISTS noscript_code text DEFAULT '';

-- 2. Create dian_articles table for dynamic CMS
CREATE TABLE public.dian_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  keyword TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  hero_icon TEXT NOT NULL DEFAULT 'FileText',
  hero_badge TEXT NOT NULL DEFAULT '',
  h1 TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  pain_vs_solution JSONB DEFAULT '[]'::jsonb,
  cta_text TEXT NOT NULL DEFAULT '',
  cta_whatsapp_message TEXT NOT NULL DEFAULT '',
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dian_articles ENABLE ROW LEVEL SECURITY;

-- Public read for published articles
CREATE POLICY "Published articles are viewable by everyone"
ON public.dian_articles FOR SELECT
USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage articles"
ON public.dian_articles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_dian_articles_updated_at
BEFORE UPDATE ON public.dian_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
