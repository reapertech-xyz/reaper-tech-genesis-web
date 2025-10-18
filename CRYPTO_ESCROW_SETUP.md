# Crypto Escrow Integration Guide

## Overview
The crypto escrow system enables secure cryptocurrency transactions with buyer protection. This document outlines the implementation and requirements.

## Current Implementation

### Edge Function: `crypto-escrow`
Located at `supabase/functions/crypto-escrow/index.ts`

**Features:**
- ✅ Wallet balance checking (ETH, BTC, USDC, USDT, MATIC)
- ✅ Real-time crypto ↔ fiat conversion (CoinGecko API)
- ✅ Deposit creation and tracking
- ✅ Transaction verification
- ✅ Fund release logic
- ✅ Multi-currency support

**Actions:**
- `check-balance`: Check wallet balance for any supported currency
- `create-deposit`: Create crypto escrow deposit
- `verify-deposit`: Verify blockchain transaction
- `release-funds`: Release escrowed funds to seller
- `get-conversion`: Get real-time exchange rates

## Environment Variables

Add these to your Supabase secrets:

```bash
# Blockchain RPC Endpoints (Required for production)
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BTC_RPC_URL=https://blockstream.info/api
POLYGON_RPC_URL=https://polygon-rpc.com

# Optional: Gas estimation API
GAS_STATION_API=https://api.etherscan.io/api
```

## Smart Contract Requirements

### Escrow Smart Contract (Solidity)
For production use, deploy this smart contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EscrowContract {
    enum Status { INITIATED, FUNDED, COMPLETED, DISPUTED, REFUNDED }
    
    struct Escrow {
        address buyer;
        address seller;
        address mediator;
        uint256 amount;
        Status status;
        uint256 createdAt;
    }
    
    mapping(bytes32 => Escrow) public escrows;
    
    event EscrowCreated(bytes32 indexed escrowId, address buyer, address seller, uint256 amount);
    event FundsDeposited(bytes32 indexed escrowId);
    event FundsReleased(bytes32 indexed escrowId);
    event FundsRefunded(bytes32 indexed escrowId);
    event DisputeInitiated(bytes32 indexed escrowId);
    
    // Platform fee (0.5%)
    uint256 public constant PLATFORM_FEE = 50; // 0.5% = 50/10000
    address public platformWallet;
    
    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }
    
    function createEscrow(
        bytes32 escrowId,
        address seller,
        address mediator
    ) external payable {
        require(msg.value > 0, "Must send funds");
        require(escrows[escrowId].buyer == address(0), "Escrow exists");
        
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            mediator: mediator,
            amount: msg.value,
            status: Status.FUNDED,
            createdAt: block.timestamp
        });
        
        emit EscrowCreated(escrowId, msg.sender, seller, msg.value);
        emit FundsDeposited(escrowId);
    }
    
    function releaseFunds(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.buyer == msg.sender, "Only buyer can release");
        require(escrow.status == Status.FUNDED, "Invalid status");
        
        escrow.status = Status.COMPLETED;
        
        // Calculate platform fee
        uint256 fee = (escrow.amount * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = escrow.amount - fee;
        
        // Transfer to seller and platform
        payable(escrow.seller).transfer(sellerAmount);
        payable(platformWallet).transfer(fee);
        
        emit FundsReleased(escrowId);
    }
    
    function initiateDispute(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(
            escrow.buyer == msg.sender || escrow.seller == msg.sender,
            "Not authorized"
        );
        require(escrow.status == Status.FUNDED, "Invalid status");
        
        escrow.status = Status.DISPUTED;
        emit DisputeInitiated(escrowId);
    }
    
    function resolveDispute(
        bytes32 escrowId,
        bool releaseToBuyer
    ) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.mediator == msg.sender, "Only mediator");
        require(escrow.status == Status.DISPUTED, "Not disputed");
        
        if (releaseToBuyer) {
            escrow.status = Status.REFUNDED;
            payable(escrow.buyer).transfer(escrow.amount);
            emit FundsRefunded(escrowId);
        } else {
            escrow.status = Status.COMPLETED;
            uint256 fee = (escrow.amount * PLATFORM_FEE) / 10000;
            uint256 sellerAmount = escrow.amount - fee;
            payable(escrow.seller).transfer(sellerAmount);
            payable(platformWallet).transfer(fee);
            emit FundsReleased(escrowId);
        }
    }
}
```

### Multi-Sig Wallet Integration
For enhanced security, consider using Gnosis Safe for multi-sig escrow:

```typescript
// Example using Thirdweb SDK
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const sdk = ThirdwebSDK.fromPrivateKey(privateKey, "ethereum");
const contract = await sdk.getContract(ESCROW_CONTRACT_ADDRESS);

// Create escrow
await contract.call("createEscrow", [escrowId, sellerAddress, mediatorAddress], {
  value: ethers.utils.parseEther(amount)
});
```

## Deployment Steps

### 1. Deploy Smart Contract
```bash
# Using Hardhat
npx hardhat run scripts/deploy-escrow.js --network mainnet

# Or using Remix IDE at https://remix.ethereum.org
```

### 2. Configure Secrets
Add contract addresses and RPC URLs to Supabase secrets:
```bash
supabase secrets set ESCROW_CONTRACT_ADDRESS=0x...
supabase secrets set ETH_RPC_URL=https://...
```

### 3. Update Edge Function
Replace placeholder wallet generation with actual smart contract calls:

```typescript
// In crypto-escrow/index.ts
const { ethers } = await import("npm:ethers@5.7.2");

const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS.ETH);
const contract = new ethers.Contract(
  ESCROW_CONTRACT_ADDRESS,
  ESCROW_ABI,
  provider
);

// Create escrow with actual blockchain transaction
const tx = await contract.createEscrow(
  escrowId,
  sellerAddress,
  mediatorAddress,
  { value: ethers.utils.parseEther(amount) }
);

await tx.wait(); // Wait for confirmation
```

## Gas Fee Handling

### Estimate Gas Before Transaction
```typescript
const gasEstimate = await contract.estimateGas.createEscrow(
  escrowId,
  sellerAddress,
  mediatorAddress,
  { value: ethers.utils.parseEther(amount) }
);

const gasPrice = await provider.getGasPrice();
const gasCost = gasEstimate.mul(gasPrice);
```

### Display to User
Show estimated gas fees in the UI before transaction submission.

## Testing

### Testnet Deployment
1. Deploy to Sepolia or Goerli testnet first
2. Use testnet ETH from faucets
3. Test all escrow flows:
   - Create deposit
   - Release funds
   - Initiate dispute
   - Resolve dispute

### Integration Tests
```typescript
// Test balance checking
const balance = await checkBalance(testWalletAddress, 'ETH');
expect(balance).toBeDefined();

// Test conversion
const conversion = await getConversion('USD', 'ETH', 100);
expect(conversion.convertedAmount).toBeGreaterThan(0);
```

## Security Considerations

1. **Multi-Sig Mediation**: Use 2-of-3 multi-sig for dispute resolution
2. **Time Locks**: Implement automatic release after X days if no dispute
3. **Rate Limiting**: Prevent spam transactions
4. **Reentrancy Protection**: Use OpenZeppelin's ReentrancyGuard
5. **Audit**: Get smart contract audited before mainnet deployment

## Production Checklist

- [ ] Deploy smart contract to mainnet
- [ ] Configure production RPC endpoints (Alchemy/Infura)
- [ ] Set up blockchain monitoring (Etherscan webhooks)
- [ ] Implement gas price oracle
- [ ] Add transaction retry logic
- [ ] Set up mediator wallet for disputes
- [ ] Configure platform fee wallet
- [ ] Test on testnet thoroughly
- [ ] Security audit completed
- [ ] Set up blockchain explorer integration
- [ ] Add transaction status tracking
- [ ] Implement automatic refund after timeout

## Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Thirdweb SDK](https://portal.thirdweb.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Gnosis Safe](https://gnosis-safe.io/)
- [Alchemy API](https://www.alchemy.com/)
- [CoinGecko API](https://www.coingecko.com/en/api)

## Support

For questions or issues:
1. Check edge function logs: `/functions/crypto-escrow/logs`
2. Review blockchain transactions on Etherscan
3. Check Supabase secrets are properly configured
4. Verify RPC endpoints are responding
