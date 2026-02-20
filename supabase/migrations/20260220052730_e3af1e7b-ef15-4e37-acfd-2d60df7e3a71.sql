
-- 1. Add ticket_source column to ticket_messages
ALTER TABLE public.ticket_messages
ADD COLUMN ticket_source TEXT NOT NULL DEFAULT 'client';

-- 2. Add RLS policies for resellers on ticket_messages
CREATE POLICY "Resellers can view messages of own tickets"
ON public.ticket_messages
FOR SELECT
USING (
  ticket_source = 'reseller' AND
  EXISTS (
    SELECT 1 FROM reseller_tickets rt
    JOIN reseller_applications ra ON ra.id = rt.reseller_id
    WHERE rt.id = ticket_messages.ticket_id
    AND ra.user_id = auth.uid()
  )
);

CREATE POLICY "Resellers can insert messages on own tickets"
ON public.ticket_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  ticket_source = 'reseller' AND
  EXISTS (
    SELECT 1 FROM reseller_tickets rt
    JOIN reseller_applications ra ON ra.id = rt.reseller_id
    WHERE rt.id = ticket_messages.ticket_id
    AND ra.user_id = auth.uid()
  )
);

-- 3. Add RLS policy for resellers to insert their own businesses
CREATE POLICY "Resellers can insert own business"
ON public.businesses
FOR INSERT
WITH CHECK (auth.uid() = owner_user_id AND has_role(auth.uid(), 'reseller'::app_role));

-- 4. Add RLS on support_subscriptions for resellers reading via business_id
CREATE POLICY "Owners can view own subscriptions"
ON public.support_subscriptions
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM businesses b WHERE b.id = support_subscriptions.business_id AND b.owner_user_id = auth.uid()
  )
);
