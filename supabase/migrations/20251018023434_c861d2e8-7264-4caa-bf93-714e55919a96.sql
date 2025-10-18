-- 1. Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 5. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. Create helper function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- 7. Drop email encryption trigger and function (no longer needed)
DROP TRIGGER IF EXISTS encrypt_email_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.encrypt_profile_email();

-- 8. Remove plain text email column from profiles (only use encrypted_email)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- 9. Add updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Create dispute_evidence storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dispute-evidence',
  'dispute-evidence',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- 11. Create RLS policies for dispute-evidence bucket
CREATE POLICY "Users can upload evidence for their disputes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dispute-evidence' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM public.escrow_transactions et
      WHERE (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
        AND et.status = 'disputed'
        AND et.id::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Users can view evidence for their disputes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dispute-evidence' AND
    EXISTS (
      SELECT 1 FROM public.escrow_transactions et
      WHERE (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
        AND et.id::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Admins can view all dispute evidence"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dispute-evidence' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can delete their own evidence"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dispute-evidence' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );