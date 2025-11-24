import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {  sepolia } from 'wagmi/chains';
import { sonic,monad} from './customChain';
export const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [monad, sonic],
  transports: {
    [monad.id]: http(),
    [sonic.id]: http(),
  },
});


