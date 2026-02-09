
-- Clean ALL email duplicates (not just chatbot_ai), keep oldest record
-- Step 1: Reassign ai_conversations from duplicates to keeper
WITH dupes AS (
  SELECT id, email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn
  FROM public.contacts
  WHERE email IS NOT NULL
),
keepers AS (
  SELECT email, id AS keeper_id FROM dupes WHERE rn = 1
),
to_remove AS (
  SELECT d.id AS old_id, k.keeper_id
  FROM dupes d JOIN keepers k ON d.email = k.email
  WHERE d.rn > 1
)
UPDATE public.ai_conversations ac
SET contact_id = tr.keeper_id
FROM to_remove tr
WHERE ac.contact_id = tr.old_id;

-- Step 2: Reassign contact_activities
WITH dupes AS (
  SELECT id, email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn
  FROM public.contacts
  WHERE email IS NOT NULL
),
keepers AS (
  SELECT email, id AS keeper_id FROM dupes WHERE rn = 1
),
to_remove AS (
  SELECT d.id AS old_id, k.keeper_id
  FROM dupes d JOIN keepers k ON d.email = k.email
  WHERE d.rn > 1
)
UPDATE public.contact_activities ca
SET contact_id = tr.keeper_id
FROM to_remove tr
WHERE ca.contact_id = tr.old_id;

-- Step 3: Delete duplicate contacts
WITH dupes AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn
  FROM public.contacts
  WHERE email IS NOT NULL
)
DELETE FROM public.contacts WHERE id IN (SELECT id FROM dupes WHERE rn > 1);

-- Step 4: Same for phone-only duplicates
WITH dupes AS (
  SELECT id, phone,
    ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC) AS rn
  FROM public.contacts
  WHERE phone IS NOT NULL AND email IS NULL
),
keepers AS (
  SELECT phone, id AS keeper_id FROM dupes WHERE rn = 1
),
to_remove AS (
  SELECT d.id AS old_id, k.keeper_id
  FROM dupes d JOIN keepers k ON d.phone = k.phone
  WHERE d.rn > 1
)
UPDATE public.ai_conversations ac
SET contact_id = tr.keeper_id
FROM to_remove tr
WHERE ac.contact_id = tr.old_id;

WITH dupes AS (
  SELECT id, phone,
    ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC) AS rn
  FROM public.contacts
  WHERE phone IS NOT NULL AND email IS NULL
),
keepers AS (
  SELECT phone, id AS keeper_id FROM dupes WHERE rn = 1
),
to_remove AS (
  SELECT d.id AS old_id, k.keeper_id
  FROM dupes d JOIN keepers k ON d.phone = k.phone
  WHERE d.rn > 1
)
UPDATE public.contact_activities ca
SET contact_id = tr.keeper_id
FROM to_remove tr
WHERE ca.contact_id = tr.old_id;

WITH dupes AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC) AS rn
  FROM public.contacts
  WHERE phone IS NOT NULL AND email IS NULL
)
DELETE FROM public.contacts WHERE id IN (SELECT id FROM dupes WHERE rn > 1);

-- Step 5: Create unique partial indexes
CREATE UNIQUE INDEX idx_contacts_email_unique ON public.contacts (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_contacts_phone_unique ON public.contacts (phone) WHERE phone IS NOT NULL AND email IS NULL;
