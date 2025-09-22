-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  crypto_currency TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'pending')),
  image_urls TEXT[],
  shipping_required BOOLEAN DEFAULT false,
  shipping_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create escrow transactions table to track Escrow.com transactions
CREATE TABLE public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  escrow_transaction_id TEXT UNIQUE, -- ID from Escrow.com
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  crypto_details JSONB, -- Store crypto-specific info like wallet addresses, confirmations
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'funded', 'in_progress', 'disputed', 'completed', 'cancelled', 'refunded')),
  dispute_reason TEXT,
  release_conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user reputation table
CREATE TABLE public.user_reputation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  total_rating_count INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Shadow Trader' CHECK (tier IN ('Shadow Trader', 'Reaper''s Mark', 'Digital Overlord')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction reviews table
CREATE TABLE public.transaction_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_listings
CREATE POLICY "Anyone can view active listings" 
ON public.marketplace_listings 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own listings" 
ON public.marketplace_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.marketplace_listings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.marketplace_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for escrow_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.escrow_transactions 
FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions as buyer" 
ON public.escrow_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own transactions" 
ON public.escrow_transactions 
FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for user_reputation
CREATE POLICY "Anyone can view user reputation" 
ON public.user_reputation 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own reputation" 
ON public.user_reputation 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update reputation" 
ON public.user_reputation 
FOR UPDATE 
USING (true); -- This will be handled by triggers/functions

-- RLS Policies for transaction_reviews
CREATE POLICY "Anyone can view reviews" 
ON public.transaction_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews for their transactions" 
ON public.transaction_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reputation_updated_at
  BEFORE UPDATE ON public.user_reputation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user reputation on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_reputation (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create reputation when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_reputation();

-- Create indexes for better performance
CREATE INDEX idx_marketplace_listings_user_id ON public.marketplace_listings(user_id);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_category ON public.marketplace_listings(category);
CREATE INDEX idx_escrow_transactions_buyer_id ON public.escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_transactions_seller_id ON public.escrow_transactions(seller_id);
CREATE INDEX idx_escrow_transactions_listing_id ON public.escrow_transactions(listing_id);
CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX idx_transaction_reviews_transaction_id ON public.transaction_reviews(transaction_id);