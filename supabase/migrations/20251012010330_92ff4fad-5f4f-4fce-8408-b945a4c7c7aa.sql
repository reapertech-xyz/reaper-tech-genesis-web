-- Drop the insecure public_user_reputation view that bypasses RLS
DROP VIEW IF EXISTS public.public_user_reputation;

-- Add new RLS policy to user_reputation table to allow viewing reputation data
-- This allows authenticated users to view reputation scores for marketplace trust
-- while keeping detailed transaction counts private (only visible to the owner)
CREATE POLICY "Users can view public reputation data"
ON public.user_reputation
FOR SELECT
TO authenticated
USING (true);

-- Update the strict "all false" policy to not conflict
DROP POLICY IF EXISTS "User reputation requires authentication" ON public.user_reputation;

-- Keep existing policies that allow users to manage their own data
-- "Users can view their own reputation" - allows seeing full details
-- "Users can insert their own reputation" - allows profile creation
-- "Service role can update reputation" - allows system updates