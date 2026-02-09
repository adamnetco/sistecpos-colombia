
-- Add cluster column to dian_articles for dynamic hub grouping
ALTER TABLE public.dian_articles
ADD COLUMN cluster TEXT NOT NULL DEFAULT 'otros';

-- Add comment for documentation
COMMENT ON COLUMN public.dian_articles.cluster IS 'Cluster for hub grouping: facturador_gratuito, habilitacion_normativa, firma_digital, comercial, otros';
