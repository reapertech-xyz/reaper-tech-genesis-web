-- Add verification tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_inquiry_id text,
ADD COLUMN IF NOT EXISTS verification_initiated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_completed_at timestamp with time zone;

-- Create index for faster verification status queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_inquiry_id ON public.profiles(verification_inquiry_id);

-- Update the reputation tier calculation to factor in verification status
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_avg numeric;
  new_count integer;
  new_tier text;
  user_verified boolean;
BEGIN
  -- Calculate new rating average and count for the reviewee
  SELECT 
    AVG(rating)::numeric(10,2),
    COUNT(*)::integer
  INTO new_avg, new_count
  FROM transaction_reviews
  WHERE reviewee_id = NEW.reviewee_id;
  
  -- Check if user is verified
  SELECT verification_status = 'verified' INTO user_verified
  FROM profiles
  WHERE id = NEW.reviewee_id;
  
  -- Determine tier based on rating, transaction count, and verification status
  -- Verified users get tier upgrades with fewer transactions
  IF user_verified AND new_count >= 25 AND new_avg >= 4.5 THEN
    new_tier := 'Digital Overlord';
  ELSIF NOT user_verified AND new_count >= 50 AND new_avg >= 4.5 THEN
    new_tier := 'Digital Overlord';
  ELSIF user_verified AND new_count >= 5 AND new_avg >= 4.0 THEN
    new_tier := 'Reaper''s Mark';
  ELSIF NOT user_verified AND new_count >= 10 AND new_avg >= 4.0 THEN
    new_tier := 'Reaper''s Mark';
  ELSE
    new_tier := 'Shadow Trader';
  END IF;
  
  -- Update or insert reputation record
  INSERT INTO user_reputation (
    user_id,
    rating_average,
    total_rating_count,
    tier,
    total_transactions,
    updated_at
  )
  VALUES (
    NEW.reviewee_id,
    new_avg,
    new_count,
    new_tier,
    new_count,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    rating_average = new_avg,
    total_rating_count = new_count,
    tier = new_tier,
    total_transactions = GREATEST(user_reputation.total_transactions, new_count),
    successful_transactions = GREATEST(user_reputation.successful_transactions, new_count),
    updated_at = now();
  
  RETURN NEW;
END;
$function$;