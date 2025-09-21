-- Fix security issues in RLS policies

-- 1. Fix profiles table - add public viewing restriction  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 2. Fix user_reputation table - restrict system updates to service role only
DROP POLICY IF EXISTS "System can update reputation" ON public.user_reputation;
CREATE POLICY "Service role can update reputation" 
ON public.user_reputation 
FOR UPDATE 
TO service_role
USING (true);

-- 3. Restrict reputation viewing to authenticated users only
DROP POLICY IF EXISTS "Anyone can view user reputation" ON public.user_reputation;
CREATE POLICY "Authenticated users can view user reputation" 
ON public.user_reputation 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Ensure escrow_transactions is properly restricted to authenticated users only
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.escrow_transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.escrow_transactions 
FOR SELECT 
TO authenticated
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.escrow_transactions;
CREATE POLICY "Users can update their own transactions" 
ON public.escrow_transactions 
FOR UPDATE 
TO authenticated
USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Users can create transactions as buyer" ON public.escrow_transactions;
CREATE POLICY "Users can create transactions as buyer" 
ON public.escrow_transactions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- 5. Add policy to prevent anonymous access to sensitive tables
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Block anonymous access to escrow_transactions" 
ON public.escrow_transactions 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Block anonymous access to user_reputation" 
ON public.user_reputation 
FOR ALL 
TO anon
USING (false);