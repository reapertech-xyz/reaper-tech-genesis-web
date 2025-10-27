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

      // Update profile with verification status
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_status: verificationStatus,
          verification_completed_at: verificationCompletedAt,
          verified_at: verificationStatus === 'verified' ? verificationCompletedAt : null,
        })
        .eq('verification_inquiry_id', inquiryId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      // Log the webhook event
      if (referenceId) {
        await logAuditEvent(supabaseAdmin, referenceId, 'verification_webhook_received', {
          inquiry_id: inquiryId,
          status,
          verification_status: verificationStatus,
        });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new Persona inquiry
    if (action === 'create-inquiry') {
      console.log('Creating Persona inquiry for user:', user.id);

      if (!PERSONA_API_KEY) {
        console.error('PERSONA_API_KEY is not set');
        throw new Error('Persona API key not configured');
      }

      if (!PERSONA_TEMPLATE_ID) {
        console.error('PERSONA_TEMPLATE_ID is not set');
        throw new Error('Persona template ID not configured');
      }

      const inquiryData: PersonaInquiryData = {
        type: 'inquiry',
        attributes: {
          'reference-id': user.id,
          'inquiry-template-id': PERSONA_TEMPLATE_ID,
        },
      };

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

      console.log('Inquiry created successfully. ID:', inquiryId);

      // Update profile with inquiry details
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          verification_inquiry_id: inquiryId,
          verification_initiated_at: new Date().toISOString(),
          verification_status: 'pending',
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      await logAuditEvent(supabaseAdmin, user.id, 'verification_inquiry_created', {
        inquiry_id: inquiryId,
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
