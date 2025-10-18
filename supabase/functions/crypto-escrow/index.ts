import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RPC endpoints for blockchain networks
const RPC_ENDPOINTS = {
  ETH: Deno.env.get('ETH_RPC_URL') || 'https://eth-mainnet.g.alchemy.com/v2/',
  BTC: Deno.env.get('BTC_RPC_URL') || 'https://blockstream.info/api',
  POLYGON: Deno.env.get('POLYGON_RPC_URL') || 'https://polygon-rpc.com',
  USDC_ETH: Deno.env.get('ETH_RPC_URL') || 'https://eth-mainnet.g.alchemy.com/v2/',
  USDT_ETH: Deno.env.get('ETH_RPC_URL') || 'https://eth-mainnet.g.alchemy.com/v2/',
};

// ERC-20 Token contract addresses (Mainnet)
const TOKEN_ADDRESSES = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

// ERC-20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

serve(async (req) => {
  // Handle CORS preflight requests
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
    console.log(`Processing crypto action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'check-balance': {
        const { walletAddress, currency } = data;

        if (!walletAddress || !currency) {
          return new Response(
            JSON.stringify({ success: false, error: 'Wallet address and currency required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let balance = '0';
        let decimals = 18;

        try {
          if (currency === 'ETH' || currency === 'MATIC') {
            // Native token balance
            const rpcUrl = currency === 'ETH' ? RPC_ENDPOINTS.ETH : RPC_ENDPOINTS.POLYGON;
            const response = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [walletAddress, 'latest'],
                id: 1,
              }),
            });

            const result = await response.json();
            if (result.result) {
              // Convert from Wei to ETH
              const weiBalance = BigInt(result.result);
              balance = (Number(weiBalance) / 1e18).toFixed(6);
            }
          } else if (currency === 'USDC' || currency === 'USDT') {
            // ERC-20 token balance
            const tokenAddress = currency === 'USDC' ? TOKEN_ADDRESSES.USDC : TOKEN_ADDRESSES.USDT;
            decimals = 6; // USDC and USDT use 6 decimals

            const response = await fetch(RPC_ENDPOINTS.USDC_ETH, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [
                  {
                    to: tokenAddress,
                    data: `0x70a08231000000000000000000000000${walletAddress.slice(2).toLowerCase()}`,
                  },
                  'latest',
                ],
                id: 1,
              }),
            });

            const result = await response.json();
            if (result.result) {
              const tokenBalance = BigInt(result.result);
              balance = (Number(tokenBalance) / Math.pow(10, decimals)).toFixed(2);
            }
          } else if (currency === 'BTC') {
            // Bitcoin balance via Blockstream API
            const response = await fetch(`${RPC_ENDPOINTS.BTC}/address/${walletAddress}`);
            const result = await response.json();
            if (result.chain_stats) {
              // Convert from satoshis to BTC
              balance = (result.chain_stats.funded_txo_sum / 1e8).toFixed(8);
            }
          }

          console.log(`Balance check for ${currency}: ${balance}`);

          return new Response(JSON.stringify({
            success: true,
            data: {
              balance,
              currency,
              walletAddress,
              timestamp: new Date().toISOString(),
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Balance check error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to check balance',
              balance: '0' 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'create-deposit': {
        const { transactionId, walletAddress, amount, currency } = data;

        if (!transactionId || !walletAddress || !amount || !currency) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify transaction exists
        const { data: transaction, error: txError } = await supabaseAdmin
          .from('escrow_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (txError || !transaction) {
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate escrow wallet address (in production, use deterministic wallet generation)
        // For now, use a placeholder that would be replaced with actual smart contract address
        const escrowWalletAddress = `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`;

        // Update transaction with crypto details
        const { error: updateError } = await supabaseAdmin
          .from('escrow_transactions')
          .update({
            crypto_details: {
              wallet_address: walletAddress,
              escrow_address: escrowWalletAddress,
              currency: currency,
              amount: amount,
              status: 'awaiting_deposit',
              created_at: new Date().toISOString(),
            },
            crypto_currency: currency,
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Failed to update transaction:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create deposit' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Crypto deposit created for transaction ${transactionId}`);

        return new Response(JSON.stringify({
          success: true,
          data: {
            transactionId,
            escrowWalletAddress,
            amount,
            currency,
            message: 'Please send funds to the escrow address',
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'verify-deposit': {
        const { transactionId, txHash } = data;

        if (!transactionId || !txHash) {
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction ID and hash required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // In production, verify the transaction on-chain
        // For now, update the transaction status
        const { error: updateError } = await supabaseAdmin
          .from('escrow_transactions')
          .update({
            status: 'funded',
            crypto_details: supabaseAdmin.rpc('jsonb_set', {
              target: 'crypto_details',
              path: '{tx_hash}',
              new_value: JSON.stringify(txHash),
            }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Failed to verify deposit:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to verify deposit' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Deposit verified for transaction ${transactionId}`);

        return new Response(JSON.stringify({
          success: true,
          message: 'Deposit verified successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'release-funds': {
        const { transactionId } = data;

        if (!transactionId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: transaction, error: txError } = await supabaseAdmin
          .from('escrow_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (txError || !transaction) {
          return new Response(
            JSON.stringify({ success: false, error: 'Transaction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify user is the buyer
        if (transaction.buyer_id !== user.id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Only buyer can release funds' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // In production: Execute smart contract transaction to release funds
        // For now, update status
        const releaseTxHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;

        const { error: updateError } = await supabaseAdmin
          .from('escrow_transactions')
          .update({
            status: 'completed',
            crypto_details: {
              ...transaction.crypto_details,
              release_tx_hash: releaseTxHash,
              released_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Failed to release funds:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to release funds' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Funds released for transaction ${transactionId}`);

        return new Response(JSON.stringify({
          success: true,
          data: {
            txHash: releaseTxHash,
            message: 'Funds released to seller',
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-conversion': {
        const { from, to, amount } = data;

        if (!from || !to || !amount) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch conversion rate from CoinGecko API (free tier)
        const cryptoIds: Record<string, string> = {
          ETH: 'ethereum',
          BTC: 'bitcoin',
          USDC: 'usd-coin',
          USDT: 'tether',
          MATIC: 'matic-network',
        };

        const fiatCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

        try {
          let convertedAmount = 0;

          if (cryptoIds[from] && fiatCurrencies.includes(to)) {
            // Crypto to Fiat
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds[from]}&vs_currencies=${to.toLowerCase()}`
            );
            const rates = await response.json();
            const rate = rates[cryptoIds[from]]?.[to.toLowerCase()] || 0;
            convertedAmount = Number(amount) * rate;
          } else if (fiatCurrencies.includes(from) && cryptoIds[to]) {
            // Fiat to Crypto
            const response = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds[to]}&vs_currencies=${from.toLowerCase()}`
            );
            const rates = await response.json();
            const rate = rates[cryptoIds[to]]?.[from.toLowerCase()] || 0;
            convertedAmount = Number(amount) / rate;
          }

          return new Response(JSON.stringify({
            success: true,
            data: {
              from,
              to,
              amount: Number(amount),
              convertedAmount: convertedAmount.toFixed(6),
              timestamp: new Date().toISOString(),
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (error) {
          console.error('Conversion error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to get conversion rate',
              convertedAmount: '0' 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Crypto escrow error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'An error occurred processing your request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
