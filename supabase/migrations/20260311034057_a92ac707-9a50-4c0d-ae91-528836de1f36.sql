-- 1. Enable pgcrypto extension (fixes pgp_sym_encrypt error)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Add branch_id to license_pos_users for user-to-branch assignment
ALTER TABLE public.license_pos_users
ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.license_branches(id) ON DELETE SET NULL;