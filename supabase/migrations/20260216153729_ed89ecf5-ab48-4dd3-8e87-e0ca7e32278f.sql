-- Allow anonymous users to read a lead by its activation_token (for the activation wizard)
CREATE POLICY "Allow read by activation_token"
ON public.leads_trials
FOR SELECT
USING (activation_token IS NOT NULL);

-- Also allow anonymous users to UPDATE their own lead during activation (by id, after token lookup)
CREATE POLICY "Allow activation update by token holder"
ON public.leads_trials
FOR UPDATE
USING (activation_token IS NOT NULL AND activation_completed_at IS NULL)
WITH CHECK (activation_token IS NOT NULL);