import { defineChain } from "viem";

export const sonic = defineChain({
  id: 146,
  name: "Sonic Mainnet",
  network: "sonic",
  rpcUrls: {
    default: { http: ["https://rpc.soniclabs.com"] },
  },
  nativeCurrency: {
    name: "Sonic",
    symbol: "S",
    decimals: 18,
  },
  blockExplorers: {
    default: { name: "SonicScan", url: "https://sonicscan.org" },
  },
});
