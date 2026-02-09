
-- Create wompi_transactions table
CREATE TABLE public.wompi_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  wompi_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'COP',
  status text NOT NULL DEFAULT 'PENDING',
  payment_method text,
  customer_email text,
  customer_name text,
  customer_phone text,
  certificate_order_id uuid REFERENCES public.certificate_orders(id),
  cart_quote_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  wompi_response jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wompi_transactions ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage wompi transactions"
ON public.wompi_transactions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read own transactions by reference (for result page)
CREATE POLICY "Anyone can read transactions by reference"
ON public.wompi_transactions
FOR SELECT
USING (true);

-- Service role inserts handled via edge functions (no anon insert needed)

-- Trigger for updated_at
CREATE TRIGGER update_wompi_transactions_updated_at
BEFORE UPDATE ON public.wompi_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index on reference for fast lookups
CREATE INDEX idx_wompi_transactions_reference ON public.wompi_transactions(reference);
CREATE INDEX idx_wompi_transactions_status ON public.wompi_transactions(status);
