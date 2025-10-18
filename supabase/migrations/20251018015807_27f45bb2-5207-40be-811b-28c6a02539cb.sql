-- Create audit log table for escrow actions
CREATE TABLE IF NOT EXISTS public.escrow_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_id uuid REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for efficient querying
CREATE INDEX idx_escrow_audit_log_user_id ON public.escrow_audit_log(user_id);
CREATE INDEX idx_escrow_audit_log_transaction_id ON public.escrow_audit_log(transaction_id);
CREATE INDEX idx_escrow_audit_log_created_at ON public.escrow_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.escrow_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs (using service role)
CREATE POLICY "Service role can access all logs"
ON public.escrow_audit_log
FOR ALL
TO service_role
USING (true);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, endpoint, window_start)
);

-- Create index for efficient rate limit checks
CREATE INDEX idx_rate_limit_tracking_user_endpoint ON public.rate_limit_tracking(user_id, endpoint, window_start);

-- Enable RLS
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limit_tracking
FOR ALL
TO service_role
USING (true);

-- Add verification status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_data jsonb,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Create function to get tier transaction limit
CREATE OR REPLACE FUNCTION public.get_tier_transaction_limit(user_tier text)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE user_tier
    WHEN 'Shadow Trader' THEN 500.00
    WHEN 'Reaper''s Mark' THEN 10000.00
    WHEN 'Digital Overlord' THEN 999999999.99
    ELSE 500.00
  END;
END;
$$;

-- Create function to check if user can create transaction
CREATE OR REPLACE FUNCTION public.can_create_transaction(
  _user_id uuid,
  _amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier text;
  tier_limit numeric;
  result jsonb;
BEGIN
  -- Get user's current tier
  SELECT tier INTO user_tier
  FROM public.user_reputation
  WHERE user_id = _user_id;
  
  -- Default to Shadow Trader if no reputation record
  IF user_tier IS NULL THEN
    user_tier := 'Shadow Trader';
  END IF;
  
  -- Get tier limit
  tier_limit := public.get_tier_transaction_limit(user_tier);
  
  -- Check if amount exceeds limit
  IF _amount > tier_limit THEN
    result := jsonb_build_object(
      'allowed', false,
      'current_tier', user_tier,
      'tier_limit', tier_limit,
      'requested_amount', _amount,
      'message', 'Transaction amount exceeds your tier limit'
    );
  ELSE
    result := jsonb_build_object(
      'allowed', true,
      'current_tier', user_tier,
      'tier_limit', tier_limit,
      'requested_amount', _amount
    );
  END IF;
  
  RETURN result;
END;
$$;