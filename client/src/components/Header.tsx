import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import logoUrl from "@assets/678fb5b3-9132-41b1-bef2-44ee49299427_1763770476603.png";
import networkLogoUrl from "@assets/images (2) (20)_1763770748954.jpeg";

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-1.5 rounded-md -ml-3">
            <img src={logoUrl} alt="Achswap" className="h-8 w-8" />
            <span className="text-xl font-bold">Achswap</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" data-testid="link-swap" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md">
              Swap
            </Link>
            <Link href="/add-liquidity" data-testid="link-add-liquidity" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md">
              Add Liquidity
            </Link>
            <Link href="/remove-liquidity" data-testid="link-remove-liquidity" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md">
              Remove Liquidity
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
            <img src={networkLogoUrl} alt="ARC Network" className="h-5 w-5 rounded-full" />
            <span className="text-sm font-medium">ARC Testnet</span>
          </div>

          <div data-testid="connect-wallet-button">
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
            />
          </div>
        </div>
      </div>

      <nav className="md:hidden border-t bg-background">
        <div className="container px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <Link href="/" data-testid="link-swap-mobile" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md whitespace-nowrap">
            Swap
          </Link>
          <Link href="/add-liquidity" data-testid="link-add-liquidity-mobile" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md whitespace-nowrap">
            Add Liquidity
          </Link>
          <Link href="/remove-liquidity" data-testid="link-remove-liquidity-mobile" className="px-4 py-2 text-sm font-medium hover-elevate active-elevate-2 rounded-md whitespace-nowrap">
            Remove Liquidity
          </Link>
        </div>
      </nav>
    </header>
  );
}
