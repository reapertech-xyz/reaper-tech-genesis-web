-- Fix audit log RLS policies
DROP POLICY IF EXISTS "Service role can access all logs" ON escrow_audit_log;

-- Only admins can view all audit logs
CREATE POLICY "Only admins can view audit logs"
ON escrow_audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON escrow_audit_log FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert audit logs (via edge functions)
CREATE POLICY "Service role can insert audit logs"
ON escrow_audit_log FOR INSERT
WITH CHECK (true);

-- Restrict dispute resolution to admins only
CREATE POLICY "Only admins can resolve disputes"
ON escrow_transactions FOR UPDATE
USING (
  status = 'disputed' AND 
  public.has_role(auth.uid(), 'admin')
);