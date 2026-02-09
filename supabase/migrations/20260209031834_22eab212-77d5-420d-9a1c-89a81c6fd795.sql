
-- Add social media columns to success_stories
ALTER TABLE public.success_stories
  ADD COLUMN instagram_url text,
  ADD COLUMN website_url text,
  ADD COLUMN tiktok_url text,
  ADD COLUMN social_links jsonb DEFAULT '[]'::jsonb;
