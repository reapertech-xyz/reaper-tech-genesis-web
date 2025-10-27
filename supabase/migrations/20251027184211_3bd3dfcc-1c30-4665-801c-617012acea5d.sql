-- Update handle_new_user trigger to use Vault for encryption key
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'vault'
AS $function$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from Vault
  SELECT decrypted_secret INTO encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'app.settings.encryption_key'
  LIMIT 1;
  
  -- Raise error if Vault key is not found
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'Encryption key not found in Vault';
  END IF;
  
  INSERT INTO public.profiles (
    id, 
    username, 
    encrypted_email
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    pgp_sym_encrypt(new.email, encryption_key)
  );
  RETURN new;
END;
$function$;