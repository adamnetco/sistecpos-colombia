
-- 1. Fix certificate-docs storage: remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read certificate docs" ON storage.objects;

-- Only admins (via service role / signed URLs) should access these sensitive docs
CREATE POLICY "Only admins can read certificate docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'certificate-docs' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- 2. Fix user_roles: add explicit TO authenticated
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Fix otp_codes: ensure no public read access, only admin via service role
-- First drop any existing SELECT policies
DROP POLICY IF EXISTS "Service role manages OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Admin manages OTP codes" ON public.otp_codes;

-- Deny all public/authenticated SELECT access - only service role can read
CREATE POLICY "No public read access to OTP codes"
  ON public.otp_codes FOR SELECT
  TO authenticated
  USING (false);

-- Allow admin full management
CREATE POLICY "Admins manage OTP codes"
  ON public.otp_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow public INSERT for OTP generation (edge function uses service role anyway)
DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;

-- 4. Fix profiles: ensure SELECT is restricted to owner + admin only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fix payments: ensure no public access, admin only + explicit deny for non-admin
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;

CREATE POLICY "Admins manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
