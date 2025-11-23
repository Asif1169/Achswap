# Achswap DEX - Replit Configuration

## Overview

Achswap is a decentralized exchange (DEX) application built for the ARC Network testnet. It provides users with the ability to swap tokens, add/remove liquidity, and interact with automated market maker (AMM) pools. The application is a full-featured DeFi platform with a modern, user-friendly interface inspired by leading DEX platforms like Uniswap and PancakeSwap.

**Core Features:**
- Token swapping with slippage protection and price impact warnings
- Liquidity pool management (add/remove liquidity)
- Native token wrapping/unwrapping (USDC ↔ wUSDC)
- Custom token import functionality
- Real-time balance tracking and transaction handling
- Multi-wallet support via RainbowKit

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Dark theme as the primary interface theme
- Custom CSS variables for consistent color theming across components
- Framer Motion for animations and transitions

**Design System:**
- Typography: Inter font family via Google Fonts
- Spacing: Standardized Tailwind units (2, 4, 6, 8, 12, 16)
- Component styling follows the "New York" shadcn variant
- Glass morphism effects and gradient backgrounds for modern aesthetics
- Responsive design with mobile-first breakpoints

**State Management:**
- React Query (TanStack Query) for server state and data fetching
- React hooks for local component state
- LocalStorage for persisting user preferences (imported tokens, settings)

### Blockchain Integration

**Web3 Stack:**
- Wagmi v2 for React hooks that interact with Ethereum-compatible blockchains
- RainbowKit for wallet connection UI and multi-wallet support
- ethers.js v6 for low-level blockchain interactions and contract calls
- Custom ARC Network testnet configuration (Chain ID: 5042002)

**Smart Contract Interactions:**
- ERC20 token operations (approve, allowance, balanceOf, transfer)
- Uniswap V2-style router contract for swaps and liquidity operations
- Factory contract for pair discovery and creation
- wUSDC (Wrapped USDC) contract for native token wrapping
- All contract addresses are hardcoded for the ARC testnet deployment

**Transaction Flow:**
1. Token approval checks before operations
2. Allowance verification and approval requests when needed
3. Transaction simulation and price quotes before execution
4. Real-time transaction status tracking with toast notifications
5. Post-transaction balance updates

### Application Structure

**Routing:**
- `/` - Swap interface (token exchange)
- `/add-liquidity` - Add liquidity to pools
- `/remove-liquidity` - Remove liquidity from pools
- `*` - 404 Not Found page

**Key Pages:**

1. **Swap Page** (`/pages/Swap.tsx`)
   - Token selection with balance display
   - Amount input with max balance shortcuts
   - Price quote fetching from router contract
   - Slippage tolerance and deadline settings
   - Price impact warnings for large trades
   - Wrap/unwrap modal for USDC ↔ wUSDC conversion

2. **Add Liquidity Page** (`/pages/AddLiquidity.tsx`)
   - Dual token selection for liquidity pairs
   - Proportional amount calculation based on existing reserves
   - New pair creation vs. adding to existing pools
   - LP token receipt estimation
   - Share of pool percentage display

3. **Remove Liquidity Page** (`/pages/RemoveLiquidity.tsx`)
   - Percentage-based liquidity removal (25%, 50%, 75%, 100%)
   - LP token balance tracking
   - Token receipt estimation based on pool reserves
   - Approve + Remove transaction flow

**Shared Components:**

- `Header.tsx` - Navigation bar with wallet connection and network indicator
- `TokenSelector.tsx` - Modal for selecting tokens with search, filtering, and custom import
- `SwapSettings.tsx` - Settings dialog for slippage, deadline, and recipient configuration
- `WrapUnwrapModal.tsx` - Interface for wrapping/unwrapping native tokens

**Data Layer:**

- `tokens.ts` - Default token list (USDC, wUSDC, ACHS)
- `schema.ts` - Zod schemas for type validation (Token, ImportedToken, LiquidityPosition)
- LocalStorage management for user-imported tokens

**Utility Functions:**

- `decimal-utils.ts` - Precision-safe decimal formatting and parsing for token amounts
- `utils.ts` - Tailwind class merging utility (cn function)
- `wagmi.ts` - Blockchain network configuration and RainbowKit setup

### External Dependencies

**Blockchain Infrastructure:**
- ARC Network Testnet RPC: `https://rpc.testnet.arc.network`
- ARC Network Block Explorer: `https://testnet.arcscan.app`
- WalletConnect Project ID required for RainbowKit wallet connections (configured via `VITE_WALLETCONNECT_PROJECT_ID` environment variable)

**Smart Contracts on ARC Testnet:**
- Factory Contract: `0x90195102F2388E8e30E78BC0b1D3A9748379a1F5`
- Router Contract: `0x173A08F94C13a4A64a598361165e84Df871aEa9E`
- wUSDC Contract: `0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA`
- ACHS Token: `0x45Bb5425f293bdd209c894364C462421FF5FfA48`

**Third-Party Services:**
- Google Fonts CDN for Inter font family
- RainbowKit's wallet connection infrastructure
- User's browser wallet extensions (MetaMask, Rainbow, etc.)

**Key NPM Packages:**
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `wagmi` - React hooks for Ethereum
- `ethers` - Blockchain interaction library
- `@tanstack/react-query` - Data fetching and caching
- `@radix-ui/*` - Unstyled accessible UI primitives
- `tailwindcss` - Utility-first CSS framework
- `framer-motion` - Animation library
- `zod` - Schema validation
- `wouter` - Lightweight routing
- `date-fns` - Date utilities

**Development Tools:**
- Vite for development server and builds
- TypeScript for type checking
- PostCSS with Tailwind and Autoprefixer

**Asset Dependencies:**
- Token logos stored in `/public/img/` directory
- Favicon and brand assets in `/public/` directory
- Design guidelines document for UI consistency