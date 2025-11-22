import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity px-2 py-1.5 rounded-lg -ml-2">
            <img src="/img/logos/achswap-logo.png" alt="Achswap" className="h-9 w-9 md:h-10 md:w-10 rounded-lg" onError={(e) => console.error('Failed to load logo:', e)} />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Achswap
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" data-testid="link-swap" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
              Swap
            </Link>
            <Link href="/add-liquidity" data-testid="link-add-liquidity" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
              Liquidity
            </Link>
            <Link href="/remove-liquidity" data-testid="link-remove-liquidity" className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
              Remove
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/40">
            <img src="/img/logos/arc-network.png" alt="ARC Network" className="h-5 w-5 rounded-full" onError={(e) => console.error('Failed to load network logo:', e)} />
            <span className="text-xs md:text-sm font-medium">ARC Testnet</span>
          </div>

          <div data-testid="connect-wallet-button">
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
            />
          </div>
        </div>
      </div>

      <nav className="md:hidden border-t border-border/40 bg-background/50">
        <div className="container px-4 py-2 flex items-center gap-1 overflow-x-auto max-w-7xl mx-auto">
          <Link href="/" data-testid="link-swap-mobile" className="px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors whitespace-nowrap">
            Swap
          </Link>
          <Link href="/add-liquidity" data-testid="link-add-liquidity-mobile" className="px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors whitespace-nowrap">
            Add Liquidity
          </Link>
          <Link href="/remove-liquidity" data-testid="link-remove-liquidity-mobile" className="px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors whitespace-nowrap">
            Remove
          </Link>
        </div>
      </nav>
    </header>
  );
}
