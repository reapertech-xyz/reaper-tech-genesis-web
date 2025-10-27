-- Add fields for Unstoppable Domains and email linking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS linked_domains TEXT[],
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS linked_wallets TEXT[],
ADD COLUMN IF NOT EXISTS primary_login_method TEXT DEFAULT 'email';

-- Update wallet_address to be part of linked_wallets array for existing users
UPDATE public.profiles
SET linked_wallets = ARRAY[wallet_address]
WHERE wallet_address IS NOT NULL 
  AND (linked_wallets IS NULL OR NOT (wallet_address = ANY(linked_wallets)));

-- Add index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_linked_domains ON public.profiles USING GIN(linked_domains);

-- Function to add domain to profile
CREATE OR REPLACE FUNCTION public.add_domain_to_profile(_user_id uuid, _domain text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET linked_domains = array_append(
    COALESCE(linked_domains, ARRAY[]::text[]),
    _domain
  )
  WHERE id = _user_id
  AND NOT (_domain = ANY(COALESCE(linked_domains, ARRAY[]::text[])));
END;
$$;

-- Function to add wallet to profile
CREATE OR REPLACE FUNCTION public.add_wallet_to_profile(_user_id uuid, _wallet text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET linked_wallets = array_append(
    COALESCE(linked_wallets, ARRAY[]::text[]),
    _wallet
  )
  WHERE id = _user_id
  AND NOT (_wallet = ANY(COALESCE(linked_wallets, ARRAY[]::text[])));
END;
$$;