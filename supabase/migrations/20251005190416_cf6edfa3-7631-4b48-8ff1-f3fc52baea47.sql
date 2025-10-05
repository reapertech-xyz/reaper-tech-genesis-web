-- Fix user_reputation security issue
-- Drop the overly permissive policy that allows all authenticated users to view all reputation data
DROP POLICY IF EXISTS "Authenticated users can view user reputation" ON public.user_reputation;

-- Add policy so users can only view their own full reputation details
CREATE POLICY "Users can view their own reputation"
ON public.user_reputation
FOR SELECT
USING (auth.uid() = user_id);

-- Create a public view with only safe aggregated data for marketplace visibility
CREATE OR REPLACE VIEW public.public_user_reputation AS
SELECT 
  user_id,
  rating_average,
  total_rating_count,
  tier,
  -- Hide exact transaction counts, show only tier which is less sensitive
  CASE 
    WHEN total_transactions > 0 THEN true 
    ELSE false 
  END as has_transactions
FROM public.user_reputation;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_user_reputation TO authenticated;

-- Add RLS to the view (views inherit RLS from base tables, but we make it explicit)
ALTER VIEW public.public_user_reputation SET (security_invoker = true);