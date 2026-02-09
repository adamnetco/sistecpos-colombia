-- 1. Admin can manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Resellers can view their own application
CREATE POLICY "Resellers can view own application"
ON public.reseller_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Resellers can update their own application (profile edits)
CREATE POLICY "Resellers can update own application"
ON public.reseller_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);