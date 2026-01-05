import { QueryClient } from '@tanstack/react-query'
import { KeyManager, webAuthn } from 'tempo.ts/wagmi'
import { mnemonicToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import { tempoTestnet } from 'viem/chains'
import { withFeePayer } from 'viem/tempo'
import { createConfig, http, webSocket } from 'wagmi'

export const alphaUsd = '0x20c0000000000000000000000000000000000001'
export const betaUsd = '0x20c0000000000000000000000000000000000002'

// Sponsor account for gasless transactions (test mnemonic)
export const sponsorAccount = mnemonicToAccount(
  'test test test test test test test test test test test junk',
)

export const queryClient = new QueryClient()

import { injected } from 'wagmi/connectors'

// Arc Testnet chain configuration
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
})

export const config = createConfig({
  connectors: [
    injected(),
    webAuthn({
      keyManager: KeyManager.localStorage(),
    }),
  ],
  chains: [tempoTestnet, arcTestnet],
  // multiInjectedProviderDiscovery: true, // Defaults to true, enabling EIP-6963
  transports: {
    [tempoTestnet.id]: withFeePayer(
      // Transport for regular transactions
      webSocket(),
      // Transport for sponsored transactions (feePayer: true)
      http('/fee-payer'),
    ),
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
