import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 md:gap-8 slide-in">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-all duration-300 px-2 py-1.5 rounded-lg -ml-2 group">
            <img src="/img/logos/achswap-logo.png" alt="Achswap" className="h-9 w-9 md:h-10 md:w-10 rounded-lg group-hover:rotate-12 transition-transform duration-300" onError={(e) => console.error('Failed to load logo:', e)} />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-blue-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Achswap
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" data-testid="link-swap" className="px-4 py-2 text-sm font-medium hover:bg-accent/80 hover:text-accent-foreground rounded-lg transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Swap</span>
              <span className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </Link>
            <Link href="/add-liquidity" data-testid="link-add-liquidity" className="px-4 py-2 text-sm font-medium hover:bg-accent/80 hover:text-accent-foreground rounded-lg transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Liquidity</span>
              <span className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </Link>
            <Link href="/remove-liquidity" data-testid="link-remove-liquidity" className="px-4 py-2 text-sm font-medium hover:bg-accent/80 hover:text-accent-foreground rounded-lg transition-all duration-300 hover:scale-105 relative group">
              <span className="relative z-10">Remove</span>
              <span className="absolute inset-0 bg-primary/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4 fade-in">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-primary/30 hover:border-primary/60 transition-all duration-300 shimmer">
            <img src="/img/logos/arc-network.png" alt="ARC Network" className="h-5 w-5 rounded-full" onError={(e) => console.error('Failed to load network logo:', e)} />
            <span className="text-xs md:text-sm font-medium">ARC Testnet</span>
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
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