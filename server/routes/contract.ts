// server/routes/contract.ts
import express from "express";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const router = express.Router();

router.post("/mint", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  try {
    const sdk = new ThirdwebSDK("sepolia", {
      secretKey: process.env.THIRDWEB_SECRET_KEY!,
    });

    const contract = await sdk.getContract("0xYourContractAddressHere");
    const tx = await contract.erc721.mintTo(address, {
      name: "Your NFT Name",
      description: "Sent from backend",
      image: "ipfs://your-ipfs-hash",
    });

    res.json({ receipt: tx.receipt, id: tx.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Minting failed" });
  }
});

export default router;