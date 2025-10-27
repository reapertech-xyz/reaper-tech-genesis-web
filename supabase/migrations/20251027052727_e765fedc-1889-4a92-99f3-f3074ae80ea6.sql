-- Add columns for government ID and selfie verification IDs to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS government_id_verification_id text,
ADD COLUMN IF NOT EXISTS selfie_verification_id text;