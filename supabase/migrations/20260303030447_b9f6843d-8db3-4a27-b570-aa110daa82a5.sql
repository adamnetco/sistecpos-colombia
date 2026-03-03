
-- CMS: Page content blocks table
CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  section_key text NOT NULL,
  content_type text NOT NULL DEFAULT 'text', -- text, markdown, image, html, json
  text_value text,
  image_url text,
  image_alt text,
  json_value jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page_path, section_key)
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage page_content"
  ON public.page_content FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public read active content
CREATE POLICY "Anyone can read active page_content"
  ON public.page_content FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_page_content_path ON public.page_content(page_path);
CREATE INDEX idx_page_content_path_section ON public.page_content(page_path, section_key);
