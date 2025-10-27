import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { corsHeaders } from '../_shared/cors.ts';

const PERSONA_API_KEY = Deno.env.get('PERSONA_API_KEY');
const PERSONA_TEMPLATE_ID = Deno.env.get('PERSONA_TEMPLATE_ID');
const PERSONA_WEBHOOK_SECRET = Deno.env.get('PERSONA_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PersonaInquiryData {
  type: string;
  attributes: {
    'reference-id'?: string;
    'inquiry-template-id': string;
    'email-address'?: string;
  };
}

interface PersonaWebhookPayload {
  data: {
    type: string;
    id: string;
    attributes: {
      status: string;
      reference_id?: string;
    };
    relationships?: {
      account?: {
        data?: {
          id: string;
        };
      };
      verifications?: {
        data?: Array<{
          id: string;
          type: string;
        }>;
      };
    };
  };
}

async function logAuditEvent(
  supabaseAdmin: any,
  userId: string,
  action: string,
  details: any
) {
  await supabaseAdmin.from('escrow_audit_log').insert({
    user_id: userId,
    action,
    details,
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, webhookPayload } = await req.json();

    // Handle webhook from Persona
    if (action === 'webhook-handler') {
      console.log('Received Persona webhook:', webhookPayload);

      // Verify webhook signature (basic implementation)
      const signature = req.headers.get('X-Persona-Signature');
      // In production, verify the signature against PERSONA_WEBHOOK_SECRET

      const payload = webhookPayload as PersonaWebhookPayload;
      const inquiryId = payload.data.id;
      const status = payload.data.attributes.status;
      const referenceId = payload.data.attributes.reference_id;
      
      // Extract verification IDs
      const accountId = payload.data.relationships?.account?.data?.id || null;
      const verifications = payload.data.relationships?.verifications?.data || [];
      const governmentIdVerification = verifications.find(v => v.type === 'verification/government-id');
      const selfieVerification = verifications.find(v => v.type === 'verification/selfie');

      let verificationStatus = 'pending';
      let verificationCompletedAt = null;

      switch (status) {
        case 'completed':
          verificationStatus = 'pending';
          break;
        case 'approved':
          verificationStatus = 'verified';
          verificationCompletedAt = new Date().toISOString();
          break;
        case 'declined':
          verificationStatus = 'rejected';
          verificationCompletedAt = new Date().toISOString();
          break;
        case 'expired':
          verificationStatus = 'unverified';
          break;
      }

      // Update profile with verification status and verification IDs
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_status: verificationStatus,
          verification_completed_at: verificationCompletedAt,
          verified_at: verificationStatus === 'verified' ? verificationCompletedAt : null,
          persona_account_id: accountId,
          government_id_verification_id: governmentIdVerification?.id || null,
          selfie_verification_id: selfieVerification?.id || null,
        })
        .eq('verification_inquiry_id', inquiryId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      // Log the webhook event with verification IDs
      if (referenceId) {
        await logAuditEvent(supabaseAdmin, referenceId, 'verification_webhook_received', {
          inquiry_id: inquiryId,
          status,
          verification_status: verificationStatus,
          persona_account_id: accountId,
          government_id_verification_id: governmentIdVerification?.id || null,
          selfie_verification_id: selfieVerification?.id || null,
          completed_at: verificationCompletedAt,
        });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or resume Persona inquiry
    if (action === 'create-inquiry') {
      console.log('Starting verification inquiry for user:', user.id);

      if (!PERSONA_API_KEY) {
        console.error('PERSONA_API_KEY is not set');
        throw new Error('Persona API key not configured');
      }

      if (!PERSONA_TEMPLATE_ID) {
        console.error('PERSONA_TEMPLATE_ID is not set');
        throw new Error('Persona template ID not configured');
      }

      // Check if user has an existing inquiry
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('verification_inquiry_id, verification_status')
        .eq('id', user.id)
        .single();

      const existingInquiryId = profile?.verification_inquiry_id;
      const currentStatus = profile?.verification_status;

      // Resume existing inquiry if it exists and is in a resumable state
      if (existingInquiryId && ['unverified', 'canceled'].includes(currentStatus)) {
        console.log('Resuming existing inquiry:', existingInquiryId);

        const resumeResponse = await fetch(
          `https://withpersona.com/api/v1/inquiries/${existingInquiryId}/resume`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PERSONA_API_KEY}`,
              'Content-Type': 'application/json',
              'Persona-Version': '2023-01-05',
            },
          }
        );

        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          console.log('Successfully resumed inquiry');

          const sessionToken = resumeData.data.attributes['session-token'];

          // Update status to pending
          await supabaseAdmin
            .from('profiles')
            .update({
              verification_status: 'pending',
              verification_initiated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          await logAuditEvent(supabaseAdmin, user.id, 'verification_inquiry_resumed', {
            inquiry_id: existingInquiryId,
          });

          return new Response(
            JSON.stringify({
              success: true,
              inquiry_id: existingInquiryId,
              session_token: sessionToken,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.log('Could not resume inquiry, will create new one');
        }
      }

      // Create new inquiry
      console.log('Creating new Persona inquiry for user:', user.id);

      const inquiryData: PersonaInquiryData = {
        type: 'inquiry',
        attributes: {
          'reference-id': user.id,
          'inquiry-template-id': PERSONA_TEMPLATE_ID,
        },
      };

      // Add email if user is logged in via email
      if (user.email) {
        inquiryData.attributes['email-address'] = user.email;
        console.log('Including email in Persona inquiry:', user.email);
      }

      console.log('Sending request to Persona API with template ID:', PERSONA_TEMPLATE_ID);

      const personaResponse = await fetch('https://withpersona.com/api/v1/inquiries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERSONA_API_KEY}`,
          'Content-Type': 'application/json',
          'Persona-Version': '2023-01-05',
        },
        body: JSON.stringify({ data: inquiryData }),
      });

      const responseText = await personaResponse.text();
      console.log('Persona API response status:', personaResponse.status);
      console.log('Persona API response:', responseText);

      if (!personaResponse.ok) {
        console.error('Persona API error. Status:', personaResponse.status, 'Response:', responseText);
        throw new Error(`Persona API error (${personaResponse.status}): ${responseText}`);
      }

      const personaData = JSON.parse(responseText);
      const inquiryId = personaData.data.id;
      const sessionToken = personaData.data.attributes['session-token'];
      
      // Extract Persona account ID if available
      const personaAccountId = personaData.data.relationships?.account?.data?.id || null;

      console.log('Inquiry created successfully. ID:', inquiryId);
      if (personaAccountId) {
        console.log('Persona account ID:', personaAccountId);
      }

      // Update profile with inquiry details and Persona account ID
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_inquiry_id: inquiryId,
          verification_initiated_at: new Date().toISOString(),
          verification_status: 'pending',
          persona_account_id: personaAccountId,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      await logAuditEvent(supabaseAdmin, user.id, 'verification_inquiry_created', {
        inquiry_id: inquiryId,
        persona_account_id: personaAccountId,
        email: user.email || null,
      });

      return new Response(
        JSON.stringify({
          success: true,
          inquiry_id: inquiryId,
          session_token: sessionToken,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle cancellation of verification
    if (action === 'cancel-inquiry') {
      console.log('Cancelling verification inquiry for user:', user.id);

      // Update verification status to canceled (keep inquiry_id for resumption)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_status: 'canceled',
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      await logAuditEvent(supabaseAdmin, user.id, 'verification_inquiry_cancelled', {
        cancelled_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check verification status
    if (action === 'check-status') {
      console.log('Checking verification status for user:', user.id);

      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('verification_status, verification_inquiry_id, verified_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          verification_status: profile.verification_status,
          inquiry_id: profile.verification_inquiry_id,
          verified_at: profile.verified_at,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in persona-verification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
