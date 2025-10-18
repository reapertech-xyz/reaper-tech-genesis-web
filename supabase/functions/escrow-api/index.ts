import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Database operation retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
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
    
    // Client for auth checks
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Admin client for database operations (bypasses RLS)
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
    
    // Get API credentials from environment
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

    switch (action) {
      case 'create': {
        const { buyerId, sellerId, amount, currency, description, releaseConditions } = data as EscrowCreateRequest;
        
        // Input validation
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

        // Authorization: Only the buyer can create transactions
        if (user.id !== buyerId) {
          console.error(`Authorization failed: User ${user.id} attempted to create transaction for buyer ${buyerId}`);
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
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
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction creation failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();
        console.log('Escrow API transaction created:', result);

        // Store transaction in database with retry logic
        try {
          const dbTransaction = await retryDbOperation(async () => {
            const { data, error } = await supabaseAdmin
              .from('escrow_transactions')
              .insert({
                buyer_id: buyerId,
                seller_id: sellerId,
                amount: amount,
                currency: currency.toUpperCase(),
                status: 'initiated',
                escrow_transaction_id: result.id || result.transaction_id,
                release_conditions: releaseConditions || null,
                crypto_details: data.cryptoDetails || null,
              })
              .select()
              .single();

            if (error) {
              throw new Error(`Database insert failed: ${error.message}`);
            }

            return data;
          }, 'Database insert');

          console.log('Transaction stored in database:', dbTransaction.id);

          return new Response(JSON.stringify({
            success: true,
            data: {
              ...result,
              localTransactionId: dbTransaction.id
            },
            message: 'Escrow transaction created successfully'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (dbError) {
          console.error('CRITICAL: Database storage failed after successful API call:', dbError);
          
          // TODO: Implement compensation logic to cancel the Escrow.com transaction
          // For now, log the orphaned transaction
          console.error(`ORPHANED TRANSACTION: Escrow.com ID ${result.id}, buyer ${buyerId}, seller ${sellerId}`);
          
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

      case 'get': {
        const { transactionId } = data;
        
        if (!isValidUUID(transactionId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid transaction ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify user is participant in the transaction
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
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Escrow API error (${response.status}):`, errorText);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to retrieve transaction' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();

        return new Response(JSON.stringify({
          success: true,
          data: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'release': {
        const { transactionId } = data;
        
        if (!isValidUUID(transactionId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid transaction ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify user is the buyer (only buyer can release funds)
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
          return new Response(
            JSON.stringify({ success: false, error: 'Only buyer can release funds' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}/release`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Escrow API error (${response.status}):`, errorText);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to release funds' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();
        console.log('Escrow API funds released:', result);

        // Update transaction status in database
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

          console.log('Transaction status updated to completed:', transactionId);

        } catch (dbError) {
          console.error('WARNING: Failed to update transaction status after release:', dbError);
          // Continue anyway since funds are released
        }

        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: 'Funds released successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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

        // Verify user is participant in the transaction
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
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const sanitizedReason = sanitizeString(reason, 1000);
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}/dispute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: sanitizedReason })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Escrow API error (${response.status}):`, errorText);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to initiate dispute' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();
        console.log('Escrow API dispute initiated:', result);

        // Update transaction status and dispute reason in database
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

          console.log('Transaction status updated to disputed:', transactionId);

        } catch (dbError) {
          console.error('WARNING: Failed to update transaction status after dispute:', dbError);
          // Continue anyway since dispute is filed
        }

        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: 'Dispute initiated successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cancel': {
        const { transactionId } = data;
        
        if (!isValidUUID(transactionId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid transaction ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify user is participant in the transaction
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
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Escrow API error (${response.status}):`, errorText);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to cancel transaction' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();
        console.log('Escrow API transaction cancelled:', result);

        // Update transaction status in database
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

          console.log('Transaction status updated to cancelled:', transactionId);

        } catch (dbError) {
          console.error('WARNING: Failed to update transaction status after cancellation:', dbError);
          // Continue anyway since cancellation succeeded
        }

        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: 'Transaction cancelled successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'user-transactions': {
        const { userId } = data;
        
        if (!isValidUUID(userId)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid user ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Authorization: Users can only view their own transactions
        if (user.id !== userId) {
          console.error(`Authorization failed: User ${user.id} attempted to view transactions of user ${userId}`);
          return new Response(
            JSON.stringify({ success: false, error: 'Not authorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const response = await fetch(`${baseUrl}/users/${userId}/transactions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Escrow API error (${response.status}):`, errorText);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to retrieve transactions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await response.json();

        return new Response(JSON.stringify({
          success: true,
          data: result.transactions || [],
          message: 'Transactions retrieved successfully'
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
    return new Response(JSON.stringify({
      success: false,
      error: 'An error occurred processing your request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});