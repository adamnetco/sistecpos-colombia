
-- Add missing categories for SeposColombia products
INSERT INTO catalog_categories (id, name, slug, sort_order, is_active)
VALUES
  (gen_random_uuid(), 'Básculas', 'basculas', 12, true),
  (gen_random_uuid(), 'Contadoras', 'contadoras', 13, true)
ON CONFLICT DO NOTHING;
