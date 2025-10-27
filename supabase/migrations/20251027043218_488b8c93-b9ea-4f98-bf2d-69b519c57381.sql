-- Add persona_account_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN persona_account_id text;

-- Create index for faster lookups
CREATE INDEX idx_profiles_persona_account_id ON public.profiles(persona_account_id);