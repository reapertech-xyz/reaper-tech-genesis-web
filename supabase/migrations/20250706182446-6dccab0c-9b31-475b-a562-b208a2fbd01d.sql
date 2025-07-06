-- Add wallet_address field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN wallet_address TEXT UNIQUE;

-- Create index for wallet lookups
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Create function to handle wallet-based authentication
CREATE OR REPLACE FUNCTION public.get_or_create_wallet_profile(_wallet_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Try to find existing profile with this wallet address
  SELECT id INTO profile_id 
  FROM public.profiles 
  WHERE wallet_address = _wallet_address;
  
  -- If not found, create a new profile
  IF profile_id IS NULL THEN
    INSERT INTO public.profiles (id, wallet_address, username)
    VALUES (
      gen_random_uuid(),
      _wallet_address,
      CONCAT('wallet_', SUBSTRING(_wallet_address, 1, 8))
    )
    RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$;