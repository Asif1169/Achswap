import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { TokenSelector } from "@/components/TokenSelector";
import { useAccount, useBalance } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import type { Token } from "@shared/schema";
import { Contract, BrowserProvider, formatUnits } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

export default function AddLiquidity() {
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [showTokenASelector, setShowTokenASelector] = useState(false);
  const [showTokenBSelector, setShowTokenBSelector] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      const defaultTokens = await response.json();
      
      const imported = localStorage.getItem('importedTokens');
      const importedTokens = imported ? JSON.parse(imported) : [];
      
      setTokens([...defaultTokens, ...importedTokens]);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const handleImportToken = async (address: string): Promise<Token | null> => {
    try {
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        throw new Error("Invalid token address format");
      }

      if (!window.ethereum) {
        throw new Error("Please connect your wallet to import tokens");
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(address, ERC20_ABI, provider);
      
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

      const exists = tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      if (exists) {
        throw new Error("Token already in list");
      }

      const imported = localStorage.getItem('importedTokens');
      const importedTokens = imported ? JSON.parse(imported) : [];
      
      const alreadyImported = importedTokens.find((t: Token) => t.address.toLowerCase() === address.toLowerCase());
      if (!alreadyImported) {
        importedTokens.push(newToken);
        localStorage.setItem('importedTokens', JSON.stringify(importedTokens));
      }
      
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

  // Fetch balances for selected tokens
  const isTokenANative = tokenA?.address === "0x0000000000000000000000000000000000000000";
  const isTokenBNative = tokenB?.address === "0x0000000000000000000000000000000000000000";

  const { data: balanceA } = useBalance({
    address: address as `0x${string}` | undefined,
    ...(tokenA && !isTokenANative ? { token: tokenA.address as `0x${string}` } : {}),
  });

  const { data: balanceB } = useBalance({
    address: address as `0x${string}` | undefined,
    ...(tokenB && !isTokenBNative ? { token: tokenB.address as `0x${string}` } : {}),
  });

  const balanceAFormatted = balanceA ? parseFloat(formatUnits(balanceA.value, balanceA.decimals)).toFixed(6) : "0.00";
  const balanceBFormatted = balanceB ? parseFloat(formatUnits(balanceB.value, balanceB.decimals)).toFixed(6) : "0.00";

  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) return;
    
    setIsAdding(true);
    try {
      // TODO: Implement actual liquidity provision with smart contract
      toast({
        title: "Adding liquidity",
        description: `Adding ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol}`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAmountA("");
      setAmountB("");
      
      toast({
        title: "Liquidity added",
        description: `Successfully added liquidity to ${tokenA.symbol}/${tokenB.symbol} pool`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add liquidity",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border-card-border">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold">Add Liquidity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add liquidity to earn fees on swaps
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Token A</label>
              {isConnected && tokenA && (
                <span className="text-xs text-muted-foreground">
                  Balance: {balanceAFormatted}
                </span>
              )}
            </div>
            
            <div className="relative bg-muted rounded-lg p-4">
              <Input
                data-testid="input-token-a-amount"
                type="number"
                placeholder="0.00"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="border-0 bg-transparent text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              <Button
                data-testid="button-select-token-a"
                onClick={() => setShowTokenASelector(true)}
                variant="secondary"
                className="mt-3 w-full sm:w-auto"
              >
                {tokenA ? (
                  <div className="flex items-center gap-2">
                    {tokenA.logoURI ? (
                      <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-background" />
                    )}
                    <span className="font-semibold">{tokenA.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <div className="rounded-full h-10 w-10 bg-background border-4 border-background flex items-center justify-center">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Token B</label>
              {isConnected && tokenB && (
                <span className="text-xs text-muted-foreground">
                  Balance: {balanceBFormatted}
                </span>
              )}
            </div>
            
            <div className="relative bg-muted rounded-lg p-4">
              <Input
                data-testid="input-token-b-amount"
                type="number"
                placeholder="0.00"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="border-0 bg-transparent text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              <Button
                data-testid="button-select-token-b"
                onClick={() => setShowTokenBSelector(true)}
                variant="secondary"
                className="mt-3 w-full sm:w-auto"
              >
                {tokenB ? (
                  <div className="flex items-center gap-2">
                    {tokenB.logoURI ? (
                      <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-background" />
                    )}
                    <span className="font-semibold">{tokenB.symbol}</span>
                  </div>
                ) : (
                  "Select token"
                )}
              </Button>
            </div>
          </div>

          {tokenA && tokenB && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pool share</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">1 {tokenA.symbol} = 1 {tokenB.symbol}</span>
              </div>
            </div>
          )}

          {isConnected ? (
            <Button
              data-testid="button-add-liquidity"
              onClick={handleAddLiquidity}
              disabled={!tokenA || !tokenB || !amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0 || isAdding}
              className="w-full h-14 text-base font-semibold"
            >
              {isAdding ? "Adding Liquidity..." : "Add Liquidity"}
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
        open={showTokenASelector}
        onClose={() => setShowTokenASelector(false)}
        onSelect={(token) => {
          setTokenA(token);
          setShowTokenASelector(false);
        }}
        tokens={tokens}
        onImport={handleImportToken}
      />

      <TokenSelector
        open={showTokenBSelector}
        onClose={() => setShowTokenBSelector(false)}
        onSelect={(token) => {
          setTokenB(token);
          setShowTokenBSelector(false);
        }}
        tokens={tokens}
        onImport={handleImportToken}
      />
    </div>
  );
}
