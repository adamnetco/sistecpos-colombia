CREATE POLICY "Anyone can submit lead from landing"
ON public.leads_trials
FOR INSERT
TO public
WITH CHECK (true);