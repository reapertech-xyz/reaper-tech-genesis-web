-- Function to update user reputation when a review is submitted
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_avg numeric;
  new_count integer;
  new_tier text;
BEGIN
  -- Calculate new rating average and count for the reviewee
  SELECT 
    AVG(rating)::numeric(10,2),
    COUNT(*)::integer
  INTO new_avg, new_count
  FROM transaction_reviews
  WHERE reviewee_id = NEW.reviewee_id;
  
  -- Determine tier based on rating and transaction count
  IF new_count >= 50 AND new_avg >= 4.5 THEN
    new_tier := 'Digital Overlord';
  ELSIF new_count >= 10 AND new_avg >= 4.0 THEN
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
$$;

-- Create trigger to update reputation after review insert
DROP TRIGGER IF EXISTS update_reputation_on_review ON transaction_reviews;
CREATE TRIGGER update_reputation_on_review
  AFTER INSERT ON transaction_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_reputation();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_reviews_reviewee ON transaction_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_user_id ON user_reputation(user_id);