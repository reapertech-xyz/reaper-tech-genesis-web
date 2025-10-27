-- Update user verification status to approved
UPDATE profiles 
SET 
  verification_status = 'verified',
  verified_at = NOW(),
  verification_completed_at = NOW()
WHERE id = 'd3cc121a-1d70-4bda-8a56-04f6130fa572';

-- Add audit log entry for manual verification approval
INSERT INTO escrow_audit_log (
  user_id,
  action,
  details
)
VALUES (
  'd3cc121a-1d70-4bda-8a56-04f6130fa572',
  'verification_manually_approved',
  jsonb_build_object(
    'inquiry_id', 'inq_5qxfJBVNMHiGQR9pVZ8X8jhBftCr',
    'persona_account_id', 'act_buVoAoWov7o4mjdPTWwmJZwLPKQ8',
    'government_id_verification_id', 'ver_GovIDExample123',
    'selfie_verification_id', 'ver_SelfieExample456',
    'status', 'approved',
    'verification_status', 'verified',
    'completed_at', NOW(),
    'manually_approved_by', 'admin',
    'note', 'Manual verification approval for testing'
  )
);