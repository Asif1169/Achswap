import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, Settings } from "lucide-react";
import { TokenSelector } from "@/components/TokenSelector";
import { WrapUnwrapModal } from "@/components/WrapUnwrapModal";
import { useAccount, useBalance } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import type { Token } from "@shared/schema";
import { Contract, BrowserProvider, formatUnits, parseUnits } from "ethers";

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

export default function Swap() {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showWrapModal, setShowWrapModal] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  // Load tokens from JSON and localStorage
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      const defaultTokens = await response.json();
      
      // Load imported tokens from localStorage
      const imported = localStorage.getItem('importedTokens');
      const importedTokens = imported ? JSON.parse(imported) : [];
      
      setTokens([...defaultTokens, ...importedTokens]);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const handleImportToken = async (address: string): Promise<Token | null> => {
    try {
      // Validate address format
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        throw new Error("Invalid token address format");
      }

      // Use Wagmi/ethers for blockchain interaction
      if (!window.ethereum) {
        throw new Error("Please connect your wallet to import tokens");
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(address, ERC20_ABI, provider);
      
      // Fetch token metadata with timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 10000)
      );

      const [name, symbol, decimals] = await Promise.race([
        Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
        ]),
        timeout
      ]) as [string, string, bigint];

      const newToken: Token = {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        logoURI: "",
        verified: false,
      };

      // Check if token already exists
      const exists = tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      if (exists) {
        throw new Error("Token already in list");
      }

      // Save to localStorage
      const imported = localStorage.getItem('importedTokens');
      const importedTokens = imported ? JSON.parse(imported) : [];
      
      // Check if already imported
      const alreadyImported = importedTokens.find((t: Token) => t.address.toLowerCase() === address.toLowerCase());
      if (!alreadyImported) {
        importedTokens.push(newToken);
        localStorage.setItem('importedTokens', JSON.stringify(importedTokens));
      }
      
      // Update state
      setTokens(prev => [...prev, newToken]);
      
      toast({
        title: "Token imported",
        description: `${symbol} has been added to your token list`,
      });

      return newToken;
    } catch (error: any) {
      console.error('Token import error:', error);
      let errorMessage = "Failed to import token";
      
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please check the address and try again.";
      } else if (error.message.includes("Invalid")) {
        errorMessage = error.message;
      } else if (error.message.includes("wallet")) {
        errorMessage = error.message;
      } else if (error.message.includes("already")) {
        errorMessage = error.message;
      } else {
        errorMessage = "Unable to fetch token data. Please verify the address is correct.";
      }
      
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleWrap = async (amount: string) => {
    toast({
      title: "Wrapping",
      description: `Wrapping ${amount} USDC to wUSDC`,
    });
    setShowWrapModal(false);
    setFromAmount("");
    setToAmount("");
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Wrap successful (UI only)",
      description: `Note: Smart contract integration required for actual wrapping`,
    });
  };

  const handleUnwrap = async (amount: string) => {
    toast({
      title: "Unwrapping",
      description: `Unwrapping ${amount} wUSDC to USDC`,
    });
    setShowWrapModal(false);
    setFromAmount("");
    setToAmount("");
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Unwrap successful (UI only)",
      description: `Note: Smart contract integration required for actual unwrapping`,
    });
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;
    
    setIsSwapping(true);
    try {
      // Check if this is a wrap/unwrap operation
      const isWrap = fromToken.symbol === 'USDC' && toToken.symbol === 'wUSDC';
      const isUnwrap = fromToken.symbol === 'wUSDC' && toToken.symbol === 'USDC';
      
      if (isWrap || isUnwrap) {
        setShowWrapModal(true);
        setIsSwapping(false);
        return;
      }

      // ========== UI ONLY - SMART CONTRACT INTEGRATION REQUIRED ==========
      // TODO: Replace this stub with actual DEX router contract interaction:
      // 1. Get router contract instance
      // 2. Calculate output amount with getAmountsOut
      // 3. Check user allowance, approve if needed
      // 4. Execute swapExactTokensForTokens or swapTokensForExactTokens
      // 5. Wait for transaction confirmation
      // 6. Invalidate React Query cache to refresh balances
      // Example:
      // const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      // const amountsOut = await router.getAmountsOut(amountIn, [fromToken.address, toToken.address]);
      // const tx = await router.swapExactTokensForTokens(...);
      // await tx.wait();
      // queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      // ====================================================================
      
      toast({
        title: "Swap initiated",
        description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      });
      
      // Simulate swap for UI demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFromAmount("");
      setToAmount("");
      
      toast({
        title: "Swap successful (UI only)",
        description: `Demo: Swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}. Note: No actual blockchain transaction occurred.`,
      });
    } catch (error: any) {
      toast({
        title: "Swap failed",
        description: error.message || "Failed to execute swap",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  // Fetch balances for selected tokens
  const isFromTokenNative = fromToken?.address === "0x0000000000000000000000000000000000000000";
  const isToTokenNative = toToken?.address === "0x0000000000000000000000000000000000000000";

  const { data: fromBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    ...(fromToken && !isFromTokenNative ? { token: fromToken.address as `0x${string}` } : {}),
  });

  const { data: toBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    ...(toToken && !isToTokenNative ? { token: toToken.address as `0x${string}` } : {}),
  });

  const fromBalanceFormatted = fromBalance ? parseFloat(formatUnits(fromBalance.value, fromBalance.decimals)).toFixed(6) : "0.00";
  const toBalanceFormatted = toBalance ? parseFloat(formatUnits(toBalance.value, toBalance.decimals)).toFixed(6) : "0.00";

  const usdcToken = tokens.find(t => t.symbol === 'USDC');
  const wusdcToken = tokens.find(t => t.symbol === 'wUSDC');

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border-card-border">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Swap</CardTitle>
            <Button 
              data-testid="button-settings"
              size="icon" 
              variant="ghost"
              className="h-9 w-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              {isConnected && fromToken && (
                <span className="text-xs text-muted-foreground">
                  Balance: {fromBalanceFormatted}
                </span>
              )}
            </div>
            
            <div className="relative bg-muted rounded-lg p-4">
              <Input
                data-testid="input-from-amount"
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              <Button
                data-testid="button-select-from-token"
                onClick={() => setShowFromSelector(true)}
                variant="secondary"
                className="mt-3 w-full sm:w-auto"
              >
                {fromToken ? (
                  <div className="flex items-center gap-2">
                    {fromToken.logoURI ? (
                      <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-background" />
                    )}
                    <span className="font-semibold">{fromToken.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <Button
              data-testid="button-swap-direction"
              size="icon"
              variant="ghost"
              onClick={handleSwapTokens}
              disabled={!fromToken || !toToken}
              className="rounded-full h-10 w-10 bg-background border-4 border-background hover:bg-muted"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              {isConnected && toToken && (
                <span className="text-xs text-muted-foreground">
                  Balance: {toBalanceFormatted}
                </span>
              )}
            </div>
            
            <div className="relative bg-muted rounded-lg p-4">
              <Input
                data-testid="input-to-amount"
                type="number"
                placeholder="0.00"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="border-0 bg-transparent text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled
              />
              
              <Button
                data-testid="button-select-to-token"
                onClick={() => setShowToSelector(true)}
                variant="secondary"
                className="mt-3 w-full sm:w-auto"
              >
                {toToken ? (
                  <div className="flex items-center gap-2">
                    {toToken.logoURI ? (
                      <img src={toToken.logoURI} alt={toToken.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-background" />
                    )}
                    <span className="font-semibold">{toToken.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
              </Button>
            </div>
          </div>

          {isConnected ? (
            <Button
              data-testid="button-swap"
              onClick={handleSwap}
              disabled={!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
              className="w-full h-14 text-base font-semibold"
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </Button>
          ) : (
            <Button
              data-testid="button-connect-wallet"
              disabled
              className="w-full h-14 text-base font-semibold"
            >
              Connect Wallet
            </Button>
          )}
        </CardContent>
      </Card>

      <TokenSelector
        open={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onSelect={(token) => {
          setFromToken(token);
          setShowFromSelector(false);
        }}
        tokens={tokens}
        onImport={handleImportToken}
      />

      <TokenSelector
        open={showToSelector}
        onClose={() => setShowToSelector(false)}
        onSelect={(token) => {
          setToToken(token);
          setShowToSelector(false);
        }}
        tokens={tokens}
        onImport={handleImportToken}
      />

      {usdcToken && wusdcToken && (
        <WrapUnwrapModal
          open={showWrapModal}
          onClose={() => setShowWrapModal(false)}
          usdcToken={usdcToken}
          wusdcToken={wusdcToken}
          onWrap={handleWrap}
          onUnwrap={handleUnwrap}
        />
      )}
    </div>
  );
}
