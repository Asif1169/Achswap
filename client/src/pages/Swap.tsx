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
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// wUSDC contract ABI for deposit/withdraw
const WUSDC_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
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
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  // Load tokens from JSON and localStorage
  useEffect(() => {
    loadTokens();
  }, []);

  // Fetch quote when fromAmount, fromToken, or toToken changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        setToAmount("");
        return;
      }

      // Handle wrap/unwrap - 1:1 ratio
      const isWrap = fromToken.symbol === 'USDC' && toToken.symbol === 'wUSDC';
      const isUnwrap = fromToken.symbol === 'wUSDC' && toToken.symbol === 'USDC';
      
      if (isWrap || isUnwrap) {
        setToAmount(fromAmount);
        return;
      }

      if (!window.ethereum) return;

      setIsLoadingQuote(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const ROUTER_ADDRESS = "0xFb5B0cc9a61E76C5B5c60b52dF092F30B36c547e";
        const ROUTER_ABI = [
          "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
        ];

        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
        const amountIn = parseUnits(fromAmount, fromToken.decimals);
        
        // Build path - use wUSDC as intermediate if needed
        let path: string[] = [];
        const isFromNative = fromToken.address === "0x0000000000000000000000000000000000000000";
        const isToNative = toToken.address === "0x0000000000000000000000000000000000000000";
        
        // Get wUSDC address for routing
        const wusdcAddress = tokens.find(t => t.symbol === 'wUSDC')?.address;
        
        if (isFromNative || isToNative) {
          path = [fromToken.address, toToken.address];
        } else if (wusdcAddress && fromToken.address !== wusdcAddress && toToken.address !== wusdcAddress) {
          path = [fromToken.address, wusdcAddress, toToken.address];
        } else {
          path = [fromToken.address, toToken.address];
        }

        let amounts;
        try {
          amounts = await router.getAmountsOut(amountIn, path);
        } catch (error) {
          // If multi-hop fails, try direct path
          if (path.length > 2) {
            path = [fromToken.address, toToken.address];
            amounts = await router.getAmountsOut(amountIn, path);
          } else {
            throw error;
          }
        }
        
        const outputAmount = formatUnits(amounts[amounts.length - 1], toToken.decimals);
        setToAmount(parseFloat(outputAmount).toFixed(6));
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        setToAmount("");
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [fromAmount, fromToken, toToken]);

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
        importedTokens.push( newToken);
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
    if (!address || !window.ethereum || !wusdcToken) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const amountBigInt = parseUnits(amount, 18);

      // For native USDC, we send it to wUSDC contract's deposit function
      // The wUSDC contract receives native tokens and mints wrapped tokens
      const wusdcContract = new Contract(wusdcToken.address, WUSDC_ABI, signer);

      toast({
        title: "Wrapping...",
        description: `Wrapping ${amount} USDC to wUSDC`,
      });

      // Call deposit with the amount as value (native token transfer)
      const tx = await wusdcContract.deposit({ value: amountBigInt });
      await tx.wait();

      setShowWrapModal(false);
      setFromAmount("");
      setToAmount("");

      toast({
        title: "Wrap successful!",
        description: `Successfully wrapped ${amount} USDC to wUSDC`,
      });
    } catch (error: any) {
      console.error('Wrap error:', error);
      toast({
        title: "Wrap failed",
        description: error.reason || error.message || "Failed to wrap tokens",
        variant: "destructive",
      });
    }
  };

  const handleUnwrap = async (amount: string) => {
    if (!address || !window.ethereum || !wusdcToken) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const amountBigInt = parseUnits(amount, 18);
      const wusdcContract = new Contract(wusdcToken.address, WUSDC_ABI, signer);

      toast({
        title: "Unwrapping...",
        description: `Unwrapping ${amount} wUSDC to USDC`,
      });

      // Check allowance first
      const allowance = await wusdcContract.allowance(address, wusdcToken.address);

      // If allowance is insufficient, approve first
      if (allowance < amountBigInt) {
        const approveTx = await wusdcContract.approve(wusdcToken.address, amountBigInt);
        await approveTx.wait();
      }

      // Call withdraw
      const tx = await wusdcContract.withdraw(amountBigInt);
      await tx.wait();

      setShowWrapModal(false);
      setFromAmount("");
      setToAmount("");

      toast({
        title: "Unwrap successful!",
        description: `Successfully unwrapped ${amount} wUSDC to USDC`,
      });
    } catch (error: any) {
      console.error('Unwrap error:', error);
      toast({
        title: "Unwrap failed",
        description: error.reason || error.message || "Failed to unwrap tokens",
        variant: "destructive",
      });
    }
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

      if (!address || !window.ethereum) {
        throw new Error("Please connect your wallet");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const ROUTER_ADDRESS = "0xFb5B0cc9a61E76C5B5c60b52dF092F30B36c547e";
      const ROUTER_ABI = [
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
      ];

      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const amountIn = parseUnits(fromAmount, fromToken.decimals);

      // Build path - use wUSDC as intermediate if tokens don't have direct pair
      let path: string[] = [];
      const isFromNative = fromToken.address === "0x0000000000000000000000000000000000000000";
      const isToNative = toToken.address === "0x0000000000000000000000000000000000000000";
      
      // Get wUSDC address for routing
      const wusdcAddress = wusdcToken?.address;
      
      if (isFromNative || isToNative) {
        // Direct path for native swaps
        path = [fromToken.address, toToken.address];
      } else if (wusdcAddress && fromToken.address !== wusdcAddress && toToken.address !== wusdcAddress) {
        // Use wUSDC as intermediate token for better routing
        path = [fromToken.address, wusdcAddress, toToken.address];
      } else {
        // Direct path
        path = [fromToken.address, toToken.address];
      }

      // Get expected output
      let amounts;
      try {
        amounts = await router.getAmountsOut(amountIn, path);
      } catch (error) {
        // If multi-hop fails, try direct path
        if (path.length > 2) {
          path = [fromToken.address, toToken.address];
          amounts = await router.getAmountsOut(amountIn, path);
        } else {
          throw new Error("No liquidity pool exists for this token pair");
        }
      }
      
      const amountOutMin = amounts[amounts.length - 1] * 95n / 100n; // 5% slippage tolerance

      // Deadline: 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      toast({
        title: "Swap initiated",
        description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      });

      // Handle different swap scenarios
      const isFromNative = fromToken.address === "0x0000000000000000000000000000000000000000";
      const isToNative = toToken.address === "0x0000000000000000000000000000000000000000";

      let tx;

      if (isFromNative) {
        // Swap native USDC for tokens
        tx = await router.swapExactETHForTokens(
          amountOutMin,
          path,
          address,
          deadline,
          { value: amountIn }
        );
      } else if (isToNative) {
        // Swap tokens for native USDC
        // First approve router to spend tokens
        const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, ROUTER_ADDRESS);

        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn);
          await approveTx.wait();
        }

        tx = await router.swapExactTokensForETH(
          amountIn,
          amountOutMin,
          path,
          address,
          deadline
        );
      } else {
        // Swap tokens for tokens
        // First approve router to spend tokens
        const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, ROUTER_ADDRESS);

        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn);
          await approveTx.wait();
        }

        tx = await router.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          address,
          deadline
        );
      }

      await tx.wait();

      setFromAmount("");
      setToAmount("");

      toast({
        title: "Swap successful!",
        description: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      });
    } catch (error: any) {
      console.error('Swap error:', error);
      toast({
        title: "Swap failed",
        description: error.reason || error.message || "Failed to execute swap",
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
    <div className="container max-w-md mx-auto px-4 py-4 md:py-8">
      <Card className="border-border/40 shadow-xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-1 pb-4 md:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-bold">Swap Tokens</CardTitle>
            <Button 
              data-testid="button-settings"
              size="icon" 
              variant="ghost"
              className="h-9 w-9 hover:bg-accent/50"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Trade tokens instantly with the best rates</p>
        </CardHeader>

        <CardContent className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              {isConnected && fromToken && (
                <span className="text-xs text-muted-foreground">
                  Balance: {fromBalanceFormatted}
                </span>
              )}
            </div>

            <div className="relative bg-muted/50 rounded-xl p-4 border border-border/40 hover:border-border/60 transition-colors">
              <Input
                data-testid="input-from-amount"
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-xl md:text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <div className="flex items-center justify-between mt-3">
                <Button
                  data-testid="button-select-from-token"
                  onClick={() => setShowFromSelector(true)}
                  variant="secondary"
                  className="h-10 px-3 md:px-4 hover:bg-secondary/80"
                >
                  {fromToken ? (
                    <div className="flex items-center gap-2">
                      {fromToken.logoURI ? (
                        <img 
                          src={fromToken.logoURI} 
                          alt={fromToken.symbol} 
                          className="w-6 h-6 rounded-full" 
                          onError={(e) => {
                            console.error('Failed to load token logo:', fromToken.logoURI);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-background" />
                      )}
                      <span className="font-semibold text-sm md:text-base">{fromToken.symbol}</span>
                    </div>
                  ) : (
                    "Select token"
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <Button
              data-testid="button-swap-direction"
              size="icon"
              variant="ghost"
              onClick={handleSwapTokens}
              disabled={!fromToken || !toToken}
              className="rounded-full h-10 w-10 bg-card border-4 border-background hover:bg-primary hover:text-primary-foreground transition-all shadow-md disabled:opacity-50"
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

            <div className="relative bg-muted/50 rounded-xl p-4 border border-border/40 hover:border-border/60 transition-colors">
              <Input
                data-testid="input-to-amount"
                type="number"
                placeholder={isLoadingQuote ? "Calculating..." : "0.00"}
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="border-0 bg-transparent text-xl md:text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled
              />

              <div className="flex items-center justify-between mt-3">
                <Button
                  data-testid="button-select-to-token"
                  onClick={() => setShowToSelector(true)}
                  variant="secondary"
                  className="h-10 px-3 md:px-4 hover:bg-secondary/80"
                >
                  {toToken ? (
                    <div className="flex items-center gap-2">
                      {toToken.logoURI ? (
                        <img 
                          src={toToken.logoURI} 
                          alt={toToken.symbol} 
                          className="w-6 h-6 rounded-full" 
                          onError={(e) => {
                            console.error('Failed to load token logo:', toToken.logoURI);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-background" />
                      )}
                      <span className="font-semibold text-sm md:text-base">{toToken.symbol}</span>
                    </div>
                  ) : (
                    "Select token"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {isConnected ? (
            <Button
              data-testid="button-swap"
              onClick={handleSwap}
              disabled={!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
              className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </Button>
          ) : (
            <Button
              data-testid="button-connect-wallet"
              disabled
              className="w-full h-12 md:h-14 text-base md:text-lg font-semibold"
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