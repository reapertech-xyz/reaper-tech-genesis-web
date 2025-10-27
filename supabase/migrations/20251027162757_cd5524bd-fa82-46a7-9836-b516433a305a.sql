-- Update handle_new_user to encrypt and store email address
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from settings (you'll need to set this in your Supabase dashboard)
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  -- If no encryption key is set, use a default (NOT RECOMMENDED for production)
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'default_encryption_key_change_in_production';
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