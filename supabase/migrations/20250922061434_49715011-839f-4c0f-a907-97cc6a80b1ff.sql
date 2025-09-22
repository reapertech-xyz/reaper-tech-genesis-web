-- Fix RLS policy conflicts on profiles table

-- Remove conflicting policies that might be causing the issue
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a single, clear policy that blocks all anonymous access
CREATE POLICY "Profiles require authentication" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- Create a policy that allows authenticated users to only see their own profile
CREATE POLICY "Users can only access their own profile" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify other sensitive tables have proper blocking policies
DROP POLICY IF EXISTS "Block anonymous access to escrow_transactions" ON public.escrow_transactions;
CREATE POLICY "Escrow transactions require authentication" 
ON public.escrow_transactions 
FOR ALL 
TO anon
USING (false);

DROP POLICY IF EXISTS "Block anonymous access to user_reputation" ON public.user_reputation;  
CREATE POLICY "User reputation requires authentication" 
ON public.user_reputation 
FOR ALL 
TO anon
USING (false);