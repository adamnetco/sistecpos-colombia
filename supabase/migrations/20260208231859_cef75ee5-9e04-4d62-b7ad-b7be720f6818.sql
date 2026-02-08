-- Table to store OTP codes for 2FA and email verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '2fa',
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, type)
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can manage OTP codes (edge functions use service role)
-- No public policies needed - all access goes through edge function
CREATE POLICY "Service role full access on otp_codes"
ON public.otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Auto-cleanup expired OTPs (optional index for performance)
CREATE INDEX idx_otp_codes_email_type ON public.otp_codes (email, type);
CREATE INDEX idx_otp_codes_expires ON public.otp_codes (expires_at);
