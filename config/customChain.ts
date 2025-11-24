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


export const monad = defineChain({
  id: 143,
  name: "Monad",
  network: "MON",
  rpcUrls: {
    default: {
      http: ["https://monad-mainnet.g.alchemy.com/v2/dn58Cx-lDJHKiX8XYZwcPYZqZAUsT5JQ"],
    },
  },
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "MonadScan",
      url: "https://monadscan.io",
    },
  },
});
