import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define ARC Testnet chain
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'ARC Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: { name: 'ARCscan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
});

// Define Stable Testnet chain
export const stableTestnet = defineChain({
  id: 2201,
  name: 'Stable Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'gUSDT',
    symbol: 'gUSDT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.stable.xyz/'],
    },
    public: {
      http: ['https://rpc.testnet.stable.xyz/'],
    },
  },
  blockExplorers: {
    default: { name: 'Stablescan', url: 'https://testnet.stablescan.xyz' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Achswap',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,
  chains: [arcTestnet, stableTestnet],
  ssr: false,
});
