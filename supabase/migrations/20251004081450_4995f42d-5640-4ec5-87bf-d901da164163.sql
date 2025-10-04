-- Phase 2: Privacy Improvements for Transaction Reviews and Reputation

-- 1. Restrict transaction review visibility to authenticated users only
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.transaction_reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.transaction_reviews
FOR SELECT
TO authenticated
USING (true);

-- Note: user_reputation already has proper authentication requirement
-- The existing policy "Authenticated users can view user reputation" is appropriate
-- for a marketplace where buyers need to see seller reputation before transactions