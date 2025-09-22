import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  releaseConditions?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();
    
    // Get API credentials from environment
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    const apiKey = isProduction 
      ? Deno.env.get('ESCROW_PROD_SECRET_KEY')
      : Deno.env.get('ESCROW_SANDBOX_SECRET_KEY');
    
    if (!apiKey) {
      throw new Error('Escrow API key not configured');
    }

    const baseUrl = isProduction 
      ? 'https://api.escrow.com/v1'
      : 'https://api.sandbox.escrow.com/v1';

    console.log(`Processing escrow action: ${action}`);

    switch (action) {
      case 'create': {
        const { buyerId, sellerId, amount, currency, description, releaseConditions } = data as EscrowCreateRequest;
        
        const payload = {
          buyer: { id: buyerId },
          seller: { id: sellerId },
          transaction: {
            amount: amount,
            currency: currency,
            description: description
          },
          ...(releaseConditions && { release_conditions: releaseConditions })
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
          console.error('Escrow API error:', errorText);
          throw new Error(`Escrow API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Escrow transaction created:', result);

        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: 'Escrow transaction created successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get': {
        const { transactionId } = data;
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Escrow API error:', errorText);
          throw new Error(`Escrow API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Escrow transaction retrieved:', result);

        return new Response(JSON.stringify({
          success: true,
          data: result
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'release': {
        const { transactionId } = data;
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}/release`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Escrow API error:', errorText);
          throw new Error(`Escrow API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Escrow funds released:', result);

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
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}/dispute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Escrow API error:', errorText);
          throw new Error(`Escrow API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Escrow dispute initiated:', result);

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
        
        const response = await fetch(`${baseUrl}/transactions/${transactionId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Escrow API error:', errorText);
          throw new Error(`Escrow API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Escrow transaction cancelled:', result);

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
        
        const response = await fetch(`${baseUrl}/users/${userId}/transactions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Escrow API error:', errorText);
          throw new Error(`Escrow API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('User transactions retrieved:', result);

        return new Response(JSON.stringify({
          success: true,
          data: result.transactions || [],
          message: 'Transactions retrieved successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});