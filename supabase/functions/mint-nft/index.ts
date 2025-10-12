import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ThirdwebSDK } from "npm:@thirdweb-dev/sdk@4.0.99";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helpers
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidIPFSHash = (hash: string): boolean => {
  return /^ipfs:\/\/[a-zA-Z0-9]{46,59}$/.test(hash);
};

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
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { address, contractAddress, nftMetadata } = await req.json();

    // Input validation
    if (!address) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient address required" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!isValidEthereumAddress(address)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Ethereum address format" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!contractAddress || !isValidEthereumAddress(contractAddress)) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid contract address required" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate NFT metadata if provided
    if (nftMetadata) {
      if (!nftMetadata.name || typeof nftMetadata.name !== 'string' || nftMetadata.name.length > 100) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid NFT name" }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (nftMetadata.description && (typeof nftMetadata.description !== 'string' || nftMetadata.description.length > 500)) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid NFT description" }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (nftMetadata.image && !isValidIPFSHash(nftMetadata.image) && !nftMetadata.image.startsWith('https://')) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid NFT image URL" }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const THIRDWEB_SECRET_KEY = Deno.env.get('THIRDWEB_SECRET_KEY');
    if (!THIRDWEB_SECRET_KEY) {
      console.error('THIRDWEB_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: "Service configuration error" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Authorization check - verify user has permission to mint
    // For now, we'll allow authenticated users to mint
    // In production, you should check user roles or permissions here
    console.log(`User ${user.id} initiating NFT mint to address: ${address}`);

    const sdk = new ThirdwebSDK("sepolia", {
      secretKey: THIRDWEB_SECRET_KEY,
    });

    const contract = await sdk.getContract(contractAddress);
    
    const metadata = nftMetadata || {
      name: "Reaper Tech NFT",
      description: "Minted via Reaper Tech",
      image: "ipfs://QmExample", // Replace with actual IPFS hash
    };

    const tx = await contract.erc721.mintTo(address, metadata);

    console.log(`NFT minted successfully by user ${user.id}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'NFT minted successfully',
        data: {
          transactionId: tx.id
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Minting error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to mint NFT"
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});