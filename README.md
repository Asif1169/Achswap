# Achswap DEX 


## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- A Web3 wallet (MetaMask recommended)

###  Quick Start

#### 1 Clone the Repository
```bash
git clone https://github.com/Asif2902/Achswap.git
cd Achswap
```

#### 2 Install Dependencies
```bash
npm install
```
*Make sure you're connected to the internet for package installation*

#### 3 Set Up Environment Variables
Create a `.env` file or use Vercel Secrets:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

>  **Get your WalletConnect Project ID:**
> 1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
> 2. Create a free account and project
> 3. Copy your Project ID

#### 4 Run Development Server
```bash
npm run dev
```
 **Development server with hot-reload enabled**  
🌐 Access at: `http://localhost:5000`

---

### Production Build

#### Build the Application
```bash
npm run build
```
Generates optimized production files in `dist/public`

#### Start Production Server
```bash
npm start
```
Launches the production-ready application

---

### 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build optimized production bundle |
| `npm start` | Serve production build locally |
| `npm run preview` | Preview production build before deployment |




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


## Key Files
- `vite.config.ts` - Vite configuration (configured for Replit with host 0.0.0.0:5000)
- `client/src/pages/` - Main application pages (Swap, AddLiquidity, RemoveLiquidity)
- `client/src/lib/wagmi.ts` - Multi-chain RainbowKit configuration
- `client/src/lib/contracts.ts` - Chain-specific contract addresses (Factory, Router)
- `client/src/lib/decimal-utils.ts` - Decimal handling for tokens with any decimal precision
- `client/src/data/tokens.ts` - Token definitions with chain filtering
- `package.json` - Dependencies and scripts

## Multi-Chain Implementation

### Supported Networks

**ARC Testnet (Chain ID: 5042002)**
- Native Token: USDC (18 decimals)
- Wrapped Token: wUSDC (18 decimals)
- Factory: `0x7cC023C7184810B84657D55c1943eBfF8603B72B`
- Router: `0xB92428D440c335546b69138F7fAF689F5ba8D436`
- Explorer: https://testnet.arcscan.app
- RPC: https://rpc.testnet.arc.network
- Default Token Pair: USDC + ACHS

**Stable Testnet (Chain ID: 2201)**
- Native Token: gUSDT (18 decimals - Gas Token)
- Wrapped Token: wUSDT (18 decimals)
- Factory: `0x774453B7A832c83a1BD4adB4ca1e332107432A8f`
- Router: `0xFb5B0cc9a61E76C5B5c60b52dF092F30B36c547e`
- Explorer: https://testnet.stablescan.xyz
- RPC: https://rpc.testnet.stable.xyz/
- Default Token Pair: gUSDT + ACHS

### Chain Switching
Users can switch between networks using their wallet (MetaMask, etc.). The application automatically:
- Filters token lists by the active chain
- Updates router and factory contract addresses
- Sets appropriate default token pairs per chain
- Handles wrap/unwrap operations for each chain's native token (USDC/wUSDC for ARC, gUSDT/wUSDT for Stable)

### Token Handling
- All token imports include chainId field for proper multi-chain filtering
- Decimal support: handles tokens with any decimal precision (0-77 decimals)
- Price impact calculation uses mid-point comparison for accuracy across all token types
- Automatic token filtering shows only tokens available on the active chain

### Transaction Features
- **150% Gas Boost**: All transactions (swaps, approvals, liquidity operations) include automatic gas estimation with 150% buffer
- **Multi-hop Swaps**: Automatically routes through wrapped token for token pairs without direct liquidity
- **Slippage Protection**: Configurable slippage tolerance with automatic minimum amount calculation
- **Safe Operations**: All transactions validated for balance, allowance, and chain compatibility

## Environment Variables
Required environment variable:
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect Cloud project ID for wallet connectivity

### Setting up WalletConnect (Required for full functionality)
1. Visit https://cloud.walletconnect.com/
2. Create a free account and project
3. Copy your Project ID
4. Update the environment variable in Replit Secrets or .env file

## Running the Application
The application runs automatically via configured workflow:
- **Command**: `npm run dev`
- **Access**: Port 5000 webview
- **Development**: Hot module reloading enabled for fast iteration

## Deployment
Configured for static deployment:
- **Build command**: `npm run build`
- **Output directory**: `dist/public`
- **Status**: Ready to publish directly from Replit

## Asset Organization

### Logo Files (Cleaned & Organized)
All logo files are stored in `client/public/img/logos/`:
- `usdc.webp` - USDC token logo
- `wusdc.png` - Wrapped USDC logo
- `gusdt.png` - gUSDT token logo
- `wusdt.png` - Wrapped gUSDT logo
- `achs-token.png` - Achswap token logo
- `achswap-logo.png` - Achswap brand logo
- `arc-network.png` - ARC Testnet network logo
- `stable-network.png` - Stable Testnet network logo
- `unknown-token.png` - Fallback logo for tokens without custom logo

**Cleanup Completed**: Removed duplicate and unused logo files:
- Deleted: `achs.png` (duplicate of achs-token.png)
- Deleted: `arc-network.png` (from parent img folder - consolidation)
- Deleted: `meta.jpg` (unused metadata file)
- Deleted: `wusdc.jpeg` (duplicate of wusdc.png)
- Removed: `logos/stable-testnet/` subdirectory (consolidated to main logos folder)

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

## Recent Updates

### November 23, 2025 - Multi-Chain & Production Polish
**Chain Integration:**
- ✅ Stable Testnet (Chain ID: 2201) fully integrated alongside ARC Testnet
- ✅ Chain-specific token filtering and contract management
- ✅ Automatic default token pair selection per chain
- ✅ Multi-chain wrap/unwrap support (USDC/wUSDC, gUSDT/wUSDT)

**Transaction Safety:**
- ✅ 150% gas boost applied to all transactions automatically
- ✅ Gas estimation with safety buffer on all chain operations

**Decimal & Price Handling:**
- ✅ Full decimal support for tokens with any precision (0-77 decimals)
- ✅ Fixed price impact calculation for accurate small amounts on all chains
- ✅ Improved mid-point comparison method for consistent results

**Assets & Cleanup:**
- ✅ Professional token logos added for Stable Testnet (gUSDT, wUSDT)
- ✅ Removed 2.2MB of duplicate/unused logo files
- ✅ Consolidated asset organization for cleaner codebase
- ✅ Logo paths optimized and unified across application

**Code Quality:**
- ✅ All pages (Swap, Add Liquidity, Remove Liquidity) updated for multi-chain
- ✅ Token imports include chainId for proper filtering
- ✅ Consistent decimal handling across all operations
- ✅ Comprehensive error handling for cross-chain operations

### November 23, 2025 - Initial Setup
- ✅ Imported Achswap GitHub project
- ✅ Installed all npm dependencies
- ✅ Configured Vite dev server for port 5000
- ✅ Set up RainbowKit with ARC Testnet support
- ✅ Configured static deployment settings
- ✅ Verified frontend loads successfully

## Architecture Notes
- **Frontend-Only Architecture**: No backend server required, all blockchain interactions via RPC
- **Chain Abstraction**: Single codebase supports unlimited chains via configuration
- **Wallet Integration**: RainbowKit handles multi-chain wallet connections seamlessly
- **Decimal Agnostic**: All math operations handle different token decimals automatically
- **Production Ready**: Gas optimization, error handling, and user feedback on all operations

## Known Limitations
- Some TypeScript LSP warnings exist but don't affect functionality
- WalletConnect requires valid Project ID for full wallet connectivity
- Token import requires valid ERC20 contract address on current chain

