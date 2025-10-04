import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ThirdwebSDK } from "npm:@thirdweb-dev/sdk@4.0.99";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, contractAddress, nftMetadata } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: "Missing address" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const THIRDWEB_SECRET_KEY = Deno.env.get('THIRDWEB_SECRET_KEY');
    if (!THIRDWEB_SECRET_KEY) {
      console.error('THIRDWEB_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Initializing Thirdweb SDK for minting...');
    const sdk = new ThirdwebSDK("sepolia", {
      secretKey: THIRDWEB_SECRET_KEY,
    });

    const contract = await sdk.getContract(contractAddress || "0xYourContractAddressHere");
    
    const metadata = nftMetadata || {
      name: "Your NFT Name",
      description: "Minted via Reaper Tech Edge Function",
      image: "ipfs://your-ipfs-hash",
    };

    console.log('Minting NFT to address:', address);
    const tx = await contract.erc721.mintTo(address, metadata);

    console.log('NFT minted successfully:', tx.id);
    return new Response(
      JSON.stringify({ 
        success: true,
        receipt: tx.receipt, 
        id: tx.id 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Minting error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Minting failed" 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
