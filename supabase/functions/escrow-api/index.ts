import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Database operation retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EscrowCreateRequest {
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  description: string;
  releaseConditions?: string[];
  listingId?: string;
}

// Helper function to log audit events
async function logAuditEvent(
  supabaseAdmin: any,
  userId: string,
  transactionId: string | null,
  action: string,
  details: any,
  req: Request
) {
  try {
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    await supabaseAdmin
      .from('escrow_audit_log')
      .insert({
        user_id: userId,
        transaction_id: transactionId,
        action,
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    
    console.log(`Audit log: ${action} by ${userId}`);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Helper function to check rate limit
async function checkRateLimit(
  supabaseAdmin: any,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    // Get current request count in the window
    const { data: existingRecords } = await supabaseAdmin
      .from('rate_limit_tracking')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart)
      .order('window_start', { ascending: false })
      .limit(1);
    
    const currentCount = existingRecords?.[0]?.request_count || 0;
    
    if (currentCount >= MAX_REQUESTS_PER_WINDOW) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment or create rate limit record
    await supabaseAdmin
      .from('rate_limit_tracking')
      .upsert({
        user_id: userId,
        endpoint,
        request_count: currentCount + 1,
        window_start: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint,window_start'
      });
    
    return { 
      allowed: true, 
      remaining: MAX_REQUESTS_PER_WINDOW - (currentCount + 1) 
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW };
  }
}

// Input validation helpers
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && amount <= 10000000 && !isNaN(amount);
};

const isValidCurrency = (currency: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  return validCurrencies.includes(currency.toUpperCase());
};

const sanitizeString = (str: string, maxLength: number): string => {
  return str.slice(0, maxLength).trim();
};

// Database operation with retry logic
async function retryDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`${operationName}: Attempt ${attempt}/${MAX_RETRIES}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`${operationName} failed (attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`Retrying ${operationName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...data } = await req.json();
    
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    const apiKey = isProduction 
      ? Deno.env.get('ESCROW_PROD_SECRET_KEY')
      : Deno.env.get('ESCROW_SANDBOX_SECRET_KEY');
    
    if (!apiKey) {
      console.error('Escrow API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = isProduction 
      ? 'https://api.escrow.com/v1'
      : 'https://api.sandbox.escrow.com/v1';

    console.log(`Processing escrow action: ${action} for user: ${user.id}`);

    // Check rate limit for all actions
    const rateLimitResult = await checkRateLimit(supabaseAdmin, user.id, action);
    if (!rateLimitResult.allowed) {
      await logAuditEvent(supabaseAdmin, user.id, null, 'rate_limit_exceeded', { action }, req);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: RATE_LIMIT_WINDOW_MS / 1000
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (action) {
      case 'create': {
        const { buyerId, sellerId, amount, currency, description, releaseConditions, listingId } = data as EscrowCreateRequest;
        
        if (!isValidUUID(buyerId) || !isValidUUID(sellerId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid user ID format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!isValidAmount(amount)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid amount' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!isValidCurrency(currency)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid currency' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (user.id !== buyerId) {
          console.error(`Authorization failed: User ${user.id} attempted to create transaction for buyer ${buyerId}`);
          await logAuditEvent(supabaseAdmin, user.id, null, 'unauthorized_create_attempt', { buyerId }, req);
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check tier transaction limits
        const { data: tierCheckData, error: tierCheckError } = await supabaseAdmin
          .rpc('can_create_transaction', {
            _user_id: user.id,
            _amount: amount
          });
        
        if (tierCheckError) {
          console.error('Tier check error:', tierCheckError);
          await logAuditEvent(supabaseAdmin, user.id, null, 'tier_check_failed', { 
            error: tierCheckError.message,
            amount,
            currency 
          }, req);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to verify transaction limits'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!tierCheckData.allowed) {
          await logAuditEvent(supabaseAdmin, user.id, null, 'tier_limit_exceeded', tierCheckData, req);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: tierCheckData.message,
              tierInfo: {
                currentTier: tierCheckData.current_tier,
                tierLimit: tierCheckData.tier_limit,
                requestedAmount: tierCheckData.requested_amount
              }
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const sanitizedDescription = sanitizeString(description, 500);
        
        const payload = {
          buyer: { id: buyerId },
          seller: { id: sellerId },
          transaction: {
            amount: amount,
            currency: currency.toUpperCase(),
            description: sanitizedDescription
          },
          ...(releaseConditions && { release_conditions: releaseConditions.slice(0, 10) })
        };

        const response = await fetch(`${baseUrl}/transactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Escrow API error (${response.status}):`, errorText);
          await logAuditEvent(supabaseAdmin, user.id, null, 'api_create_failed', { 
            status: response.status,
            error: errorText 
          }, req);
          
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction creation failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();
        console.log('Escrow API transaction created:', result);

        try {
          const dbTransaction = await retryDbOperation(async () => {
            const { data, error } = await supabaseAdmin
              .from('escrow_transactions')
              .insert({
                listing_id: listingId || null,
                buyer_id: buyerId,
                seller_id: sellerId,
                amount: amount,
                currency: currency.toUpperCase(),
                status: 'initiated',
                escrow_transaction_id: result.id || result.transaction_id,
                release_conditions: releaseConditions || null,
                crypto_details: data?.cryptoDetails || null,
              })
              .select()
              .single();

            if (error) {
              throw new Error(`Database insert failed: ${error.message}`);
            }

            return data;
          }, 'Database insert');

          console.log('Transaction stored in database:', dbTransaction.id);
          
          await logAuditEvent(supabaseAdmin, user.id, dbTransaction.id, 'transaction_created', {
            amount,
            currency,
            buyer_id: buyerId,
            seller_id: sellerId,
            listing_id: listingId
          }, req);

          return new Response(JSON.stringify({
            success: true,
            data: {
              ...dbTransaction,
              escrowApiData: result
            },
            message: 'Escrow transaction created successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (dbError) {
          console.error('CRITICAL: Database storage failed after successful API call:', dbError);
          await logAuditEvent(supabaseAdmin, user.id, null, 'db_sync_failed', { 
            escrowApiId: result.id,
            error: dbError.message 
          }, req);
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Transaction created but database sync failed. Please contact support.',
            escrowTransactionId: result.id
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'release': {
        const { transactionId } = data;
        
        if (!isValidUUID(transactionId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid transaction ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: transaction, error: txError } = await supabase
          .from('escrow_transactions')
          .select('buyer_id')
          .eq('id', transactionId)
          .single();

        if (txError || !transaction) {
          console.error('Transaction not found or database error:', txError?.message);
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (transaction.buyer_id !== user.id) {
          console.error(`Authorization failed: User ${user.id} not buyer of transaction ${transactionId}`);
          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'unauthorized_release_attempt', {}, req);
          return new Response(
            JSON.stringify({ success: false, error: 'Only buyer can release funds' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          await retryDbOperation(async () => {
            const { error } = await supabaseAdmin
              .from('escrow_transactions')
              .update({
                status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('id', transactionId);

            if (error) {
              throw new Error(`Database update failed: ${error.message}`);
            }
          }, 'Database update (release)');

          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'funds_released', {}, req);

          return new Response(JSON.stringify({
            success: true,
            message: 'Funds released successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (dbError) {
          console.error('Failed to update transaction status:', dbError);
          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'release_failed', { 
            error: dbError.message 
          }, req);
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to release funds'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'dispute': {
        const { transactionId, reason } = data;
        
        if (!isValidUUID(transactionId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid transaction ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!reason || typeof reason !== 'string') {
          return new Response(
            JSON.stringify({ success: false, error: 'Dispute reason required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: transaction, error: txError } = await supabase
          .from('escrow_transactions')
          .select('buyer_id, seller_id')
          .eq('id', transactionId)
          .single();

        if (txError || !transaction) {
          console.error('Transaction not found or database error:', txError?.message);
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
          console.error(`Authorization failed: User ${user.id} not participant in transaction ${transactionId}`);
          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'unauthorized_dispute_attempt', {}, req);
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const sanitizedReason = sanitizeString(reason, 1000);

        try {
          await retryDbOperation(async () => {
            const { error } = await supabaseAdmin
              .from('escrow_transactions')
              .update({
                status: 'disputed',
                dispute_reason: sanitizedReason,
                updated_at: new Date().toISOString()
              })
              .eq('id', transactionId);

            if (error) {
              throw new Error(`Database update failed: ${error.message}`);
            }
          }, 'Database update (dispute)');

          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'dispute_initiated', { reason: sanitizedReason }, req);

          return new Response(JSON.stringify({
            success: true,
            message: 'Dispute initiated successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (dbError) {
          console.error('Failed to initiate dispute:', dbError);
          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'dispute_failed', { 
            error: dbError.message 
          }, req);
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to initiate dispute'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'cancel': {
        const { transactionId } = data;
        
        if (!isValidUUID(transactionId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid transaction ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: transaction, error: txError } = await supabase
          .from('escrow_transactions')
          .select('buyer_id, seller_id')
          .eq('id', transactionId)
          .single();

        if (txError || !transaction) {
          console.error('Transaction not found or database error:', txError?.message);
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
          console.error(`Authorization failed: User ${user.id} not participant in transaction ${transactionId}`);
          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'unauthorized_cancel_attempt', {}, req);
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          await retryDbOperation(async () => {
            const { error } = await supabaseAdmin
              .from('escrow_transactions')
              .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('id', transactionId);

            if (error) {
              throw new Error(`Database update failed: ${error.message}`);
            }
          }, 'Database update (cancel)');

          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'transaction_cancelled', {}, req);

          return new Response(JSON.stringify({
            success: true,
            message: 'Transaction cancelled successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (dbError) {
          console.error('Failed to cancel transaction:', dbError);
          await logAuditEvent(supabaseAdmin, user.id, transactionId, 'cancel_failed', { 
            error: dbError.message 
          }, req);
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to cancel transaction'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'user-transactions': {
        const { userId } = data;
        
        if (!isValidUUID(userId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid user ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (user.id !== userId) {
          console.error(`Authorization failed: User ${user.id} attempted to access transactions for ${userId}`);
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: transactions, error: fetchError } = await supabase
          .from('escrow_transactions')
          .select('*')
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Failed to fetch transactions:', fetchError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch transactions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(JSON.stringify({
          success: true,
          data: transactions
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
