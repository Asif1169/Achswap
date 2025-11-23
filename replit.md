# Achswap DEX - Replit Setup

## Overview
Achswap is a multi-chain decentralized exchange (DEX) frontend application built with React, Vite, and Web3 technologies. It allows users to:
- Swap tokens on multiple testnets (ARC Testnet & Stable Testnet)
- Add liquidity to trading pairs
- Remove liquidity from positions
- Wrap/unwrap tokens (USDC ↔ wUSDC on ARC, gUSDT ↔ wUSDT on Stable)

## Project Structure
- **Frontend**: React + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Web3**: wagmi, viem, RainbowKit, ethers.js
- **Networks**: 
  - ARC Testnet (Chain ID: 5042002)
  - Stable Testnet (Chain ID: 2201)
- **Port**: 5000 (required for Replit webview)

## Key Files
- `vite.config.ts` - Vite configuration (already configured for Replit with host 0.0.0.0:5000)
- `client/src/pages/` - Main application pages (Swap, AddLiquidity, RemoveLiquidity)
- `client/src/lib/wagmi.ts` - Multi-chain configuration for RainbowKit
- `client/src/lib/contracts.ts` - Chain-specific contract addresses (Factory, Router)
- `client/src/data/tokens.ts` - Token definitions with chain filtering
- `package.json` - Dependencies and scripts

## Multi-Chain Configuration

### Supported Networks

**ARC Testnet (Chain ID: 5042002)**
- Native Token: USDC
- Wrapped Token: wUSDC
- Factory: `0x7cC023C7184810B84657D55c1943eBfF8603B72B`
- Router: `0xB92428D440c335546b69138F7fAF689F5ba8D436`
- Explorer: https://testnet.arcscan.app
- RPC: https://rpc.testnet.arc.network
- Default Tokens: USDC + ACHS

**Stable Testnet (Chain ID: 2201)**
- Native Token: gUSDT (Gas Token)
- Wrapped Token: wUSDT
- Factory: `0x774453B7A832c83a1BD4adB4ca1e332107432A8f`
- Router: `0xFb5B0cc9a61E76C5B5c60b52dF092F30B36c547e`
- Explorer: https://testnet.stablescan.xyz
- RPC: https://rpc.testnet.stable.xyz/
- Default Tokens: gUSDT + ACHS

### Chain Switching
Users can switch between networks using their wallet (MetaMask, etc.). The application automatically:
- Filters tokens by the active chain
- Updates contract addresses (Factory/Router)
- Sets appropriate default token pairs
- Handles wrap/unwrap operations for each chain's native token

## Environment Variables
Required environment variable:
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect Cloud project ID

### Setting up WalletConnect (Required for full functionality)
1. Visit https://cloud.walletconnect.com/
2. Create a free account and project
3. Copy your Project ID
4. Update the environment variable in Replit Secrets or .env file

## Running the Application
The application is already configured to run automatically via the workflow:
- Command: `npm run dev`
- Access at: Port 5000 webview

## Deployment
Configured for static deployment:
- Build command: `npm run build`
- Output directory: `dist/public`
- Ready to publish directly from Replit

## Technologies Used
- React 18.3.1
- Vite 5.4.20
- TypeScript 5.6.3
- Tailwind CSS 3.4.17
- wagmi 2.13.4
- RainbowKit 2.1.6
- ethers 6.13.4
- viem 2.21.4
- Radix UI components
- wouter (routing)

## Recent Changes
- 2024-11-23: Multi-chain support added
  - Added Stable Testnet (Chain ID: 2201) alongside ARC Testnet
  - Implemented chain-specific token filtering and contract addresses
  - Updated Swap, AddLiquidity, and RemoveLiquidity pages for multi-chain
  - Created chain-agnostic wrap/unwrap functionality
  - Set default tokens per chain (gUSDT+ACHS for Stable, USDC+ACHS for ARC)
  - Added placeholder logos for Stable Testnet tokens
  
- 2024-11-23: Initial Replit setup
  - Installed all npm dependencies
  - Configured workflow for port 5000
  - Set up placeholder WalletConnect Project ID
  - Verified frontend loads successfully
  - Configured static deployment

## Notes
- The Vite config is already properly configured for Replit with `allowedHosts: true`
- No backend server required - this is a frontend-only dApp
- Interacts directly with ARC Testnet blockchain via RPC
- Some TypeScript LSP warnings exist but don't affect functionality
