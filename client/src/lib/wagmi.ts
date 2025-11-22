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
    default: { name: 'Explorer', url: 'https://explorer.testnet.arc.network' },
  },
  testnet: true,
});

// IMPORTANT: Before deploying to production, you MUST:
// 1. Get a WalletConnect Project ID from https://cloud.walletconnect.com
// 2. Replace the placeholder below with your actual Project ID
// 3. Add the Project ID as an environment variable for security
export const config = getDefaultConfig({
  appName: 'Achswap',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'achswap-dex-ui-demo-12345', // Replace with your WalletConnect Project ID
  chains: [arcTestnet],
  ssr: false,
});
