# Achswap DEX Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from leading DEX platforms (Uniswap, PancakeSwap, 1inch) while maintaining Achswap's unique identity. This is a utility-focused DeFi application where clarity, trust, and efficiency are paramount.

**Core Principles**:
- Financial clarity: Every number, balance, and transaction must be immediately readable
- Trust signals: Professional polish conveys security and reliability
- Efficient workflows: Minimize clicks for common actions (swap, add liquidity)
- Data density: Pack information without overwhelming users

## Typography System

**Font Stack**: Inter or DM Sans via Google Fonts CDN
- **Primary Headers** (H1): 2.5rem (40px), font-weight: 700, tracking: -0.02em
- **Section Headers** (H2): 1.75rem (28px), font-weight: 600
- **Card Titles** (H3): 1.25rem (20px), font-weight: 600
- **Body Text**: 1rem (16px), font-weight: 400, line-height: 1.5
- **Data/Numbers**: 1.125rem (18px), font-weight: 600, tabular-nums
- **Secondary/Labels**: 0.875rem (14px), font-weight: 500
- **Micro Text**: 0.75rem (12px), font-weight: 400

## Layout & Spacing System

**Tailwind Spacing Units**: Standardize on 2, 4, 6, 8, 12, 16 units
- Component padding: `p-6` or `p-8`
- Section spacing: `gap-4`, `gap-6`, `gap-8`
- Card margins: `mb-6`, `mt-8`
- Button padding: `px-6 py-3` or `px-8 py-4`

**Page Structure**:
- Max container width: `max-w-7xl` for main layout
- Card max-width: `max-w-md` (480px) for swap/liquidity cards
- Centered card layouts with `mx-auto`
- Responsive: Single column mobile, strategic two-column desktop for comparisons

## Core Components

### Navigation Header
- Fixed top navigation: Logo left, wallet connection right
- Network indicator with chain name and status
- Wallet button showing truncated address when connected
- Height: `h-16` to `h-20`
- Horizontal padding: `px-6` to `px-8`

### Main Trading Cards (Swap/Liquidity)
- Prominent centered cards with rounded corners (`rounded-2xl` or `rounded-3xl`)
- Card padding: `p-6` to `p-8`
- Generous whitespace between input fields
- Clear visual hierarchy: Input → Action Button → Details

### Token Selection Interface
- Token row: Logo (40px circle) + Symbol (bold) + Name (muted) + Balance (right-aligned)
- Search input at top with icon
- Scrollable list: `max-h-96 overflow-y-auto`
- Verified badge: Small blue checkmark icon next to symbol
- Unknown tokens: Gray circle with "?" placeholder
- Hover states for selectable rows

### Input Fields
- Large, readable token amount inputs
- Max button positioned right within input
- Balance display below: "Balance: X.XXXX TOKEN"
- Price/USD value in smaller text below amount

### Action Buttons
- Primary CTA: Large, full-width, `rounded-xl`, `py-4`, bold text
- States: Default, Hover, Disabled, Loading
- Secondary buttons: Outlined style for less critical actions
- Icon buttons: Square, `w-10 h-10`, for swap direction toggle

### Token List & Import
- Modal overlay for token selection
- Import flow: Address input → Fetch data → Confirmation
- Warning indicators for unverified tokens
- Balance fetching with loading skeleton states

### Liquidity Pool Interface
- Dual token inputs stacked vertically
- Plus icon separator between inputs
- Pool share percentage display
- Price ratio and pool details in expandable section

### Transaction States
- Loading spinners during blockchain calls
- Success animations (checkmark)
- Error messages: Clear, actionable, dismissible
- Transaction hash links to explorer

## Data Display Patterns

**Financial Numbers**:
- Tabular number formatting for alignment
- 4-6 decimal precision for tokens, 2 for USD
- Monospace or tabular-nums for consistency
- Highlight significant changes (green/red indicators)

**Balance Displays**:
- Token balance + USD equivalent
- Clear labels: "Available", "Staked", "In Pool"
- Real-time updates with subtle loading states

## Page-Specific Layouts

### Swap Page
- Single centered card: `max-w-md`
- Token input → Swap arrow/button → Token output
- Slippage settings in expandable panel
- Transaction summary before confirmation

### Add Liquidity Page
- Centered card with dual inputs
- Pool creation option if pair doesn't exist
- Pool share visualization (percentage bar)
- Risk warnings for new pools

### Remove Liquidity Page
- LP token balance display
- Slider or percentage buttons (25%, 50%, 75%, 100%)
- Preview of tokens to receive
- Clear "You will receive" summary

## Responsive Behavior

- **Mobile** (< 768px): Single column, full-width cards with `mx-4` margins
- **Tablet** (768px - 1024px): Maintain single column for trading cards
- **Desktop** (> 1024px): Centered cards, max 480px width for focus

## Interaction Patterns

- Immediate feedback on all interactions
- Optimistic UI updates (show pending states)
- Auto-refetch balances after transactions
- Persistent imported tokens via localStorage
- Toast notifications for transaction updates

## Trust & Safety Elements

- Network badge always visible
- Verified token indicators prominent
- Unverified token warnings in import flow
- Clear gas estimates before transactions
- Transaction history/recent activity section

## Icons
Use Heroicons via CDN for consistent iconography:
- Wallet, swap arrows, plus/minus, checkmark, warning triangle, external link, search, info tooltips

No custom animations—focus on instant, reliable interactions for financial operations.