
-- Add category_id and tags to plan_modules
ALTER TABLE public.plan_modules
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.catalog_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Index for tag search performance
CREATE INDEX IF NOT EXISTS idx_plan_modules_tags ON public.plan_modules USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_plan_modules_category_id ON public.plan_modules(category_id);
