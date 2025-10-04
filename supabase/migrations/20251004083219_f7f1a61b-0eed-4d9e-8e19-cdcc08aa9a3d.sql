-- Drop the current overly permissive review policy
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.transaction_reviews;

-- Create new policy: only transaction participants can view reviews
CREATE POLICY "Only transaction participants can view reviews"
ON public.transaction_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.escrow_transactions et
    WHERE et.id = transaction_reviews.transaction_id
    AND (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
  )
  OR reviewer_id = auth.uid()
  OR reviewee_id = auth.uid()
);

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted_email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS encrypted_email bytea;

-- Create function to encrypt email addresses
CREATE OR REPLACE FUNCTION public.encrypt_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Encrypt email if it's being set or updated
  IF NEW.email IS NOT NULL THEN
    NEW.encrypted_email = pgp_sym_encrypt(NEW.email, current_setting('app.settings.encryption_key', true));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically encrypt emails
DROP TRIGGER IF EXISTS encrypt_email_trigger ON public.profiles;
CREATE TRIGGER encrypt_email_trigger
BEFORE INSERT OR UPDATE OF email ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_profile_email();

-- Create function to decrypt email (for authorized access only)
CREATE OR REPLACE FUNCTION public.get_decrypted_email(profile_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  decrypted_email text;
BEGIN
  -- Only allow users to decrypt their own email
  IF auth.uid() != profile_id THEN
    RAISE EXCEPTION 'Unauthorized access to email';
  END IF;
  
  SELECT pgp_sym_decrypt(encrypted_email, current_setting('app.settings.encryption_key', true))
  INTO decrypted_email
  FROM public.profiles
  WHERE id = profile_id;
  
  RETURN decrypted_email;
END;
$$;