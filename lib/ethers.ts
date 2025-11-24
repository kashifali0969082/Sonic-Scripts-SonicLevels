// lib/ethers.ts
import { ethers } from "ethers";

// Example: use environment variable for RPC URL
const RPC_URL = process.env.RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY";

// Optional: If you need a wallet for signing transactions
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

let provider: ethers.providers.JsonRpcProvider;
let wallet: ethers.Wallet | undefined;

if (!globalThis._ethersProvider) {
  provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  if (PRIVATE_KEY) {
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  }

  globalThis._ethersProvider = provider;
  globalThis._ethersWallet = wallet;
} else {
  provider = globalThis._ethersProvider;
  wallet = globalThis._ethersWallet;
}

export { provider, wallet, ethers };
