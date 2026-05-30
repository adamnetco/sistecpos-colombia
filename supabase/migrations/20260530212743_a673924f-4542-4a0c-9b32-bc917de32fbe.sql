-- Public buckets serve content via getPublicUrl (CDN), which does not query storage.objects.
-- Removing broad SELECT policies prevents listing all files while keeping direct URL access working.
DROP POLICY IF EXISTS "License images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "OG images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read product docs" ON storage.objects;
DROP POLICY IF EXISTS "Public can read success story files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read shared resources" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ticket attachments" ON storage.objects;
