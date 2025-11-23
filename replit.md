# Achswap DEX - Replit Setup

## Overview
Achswap is a decentralized exchange (DEX) frontend application built with React, Vite, and Web3 technologies. It allows users to:
- Swap tokens on the ARC Testnet
- Add liquidity to trading pairs
- Remove liquidity from positions
- Wrap/unwrap tokens (USDC ↔ wUSDC)

## Project Structure
- **Frontend**: React + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Web3**: wagmi, viem, RainbowKit, ethers.js
- **Network**: ARC Testnet (Chain ID: 5042002)
- **Port**: 5000 (required for Replit webview)

## Key Files
- `vite.config.ts` - Vite configuration (already configured for Replit with host 0.0.0.0:5000)
- `client/src/pages/` - Main application pages (Swap, AddLiquidity, RemoveLiquidity)
- `client/src/lib/wagmi.ts` - Web3 wallet configuration
- `client/src/data/tokens.ts` - Token definitions
- `package.json` - Dependencies and scripts

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
