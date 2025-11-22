import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, Settings, AlertTriangle, ExternalLink, HelpCircle } from "lucide-react";
import { TokenSelector } from "@/components/TokenSelector";
import { SwapSettings } from "@/components/SwapSettings";
import { useAccount, useBalance } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import type { Token } from "@shared/schema";
import { Contract, BrowserProvider, formatUnits, parseUnits } from "ethers";
import { defaultTokens } from "@/data/tokens";
import { formatAmount, parseAmount } from "@/lib/decimal-utils";

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
  const [showSettings, setShowSettings] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [quoteRefreshInterval, setQuoteRefreshInterval] = useState(30);

  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  // Function to open transaction in explorer
  const openExplorer = (txHash: string) => {
    window.open(`https://testnet.arcscan.app/tx/${txHash}`, '_blank');
  };

  // Load tokens from JSON and localStorage
  useEffect(() => {
    loadTokens();
  }, []);

  // Parse URL parameters for default token pair and amount
  useEffect(() => {
    if (tokens.length === 0) return;

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Parse path like /usdc+achs or /usdc+0x000000
    const pathMatch = path.match(/\/([^/+]+)\+([^/+]+)/);
    
    if (pathMatch) {
      const [, fromTokenStr, toTokenStr] = pathMatch;
      
      // Find tokens by symbol or address
      const findToken = (str: string) => {
        const normalized = str.toLowerCase();
        return tokens.find(t => 
          t.symbol.toLowerCase() === normalized || 
          t.address.toLowerCase() === normalized
        );
      };
      
      const foundFromToken = findToken(fromTokenStr);
      const foundToToken = findToken(toTokenStr);
      
      if (foundFromToken) setFromToken(foundFromToken);
      if (foundToToken) setToToken(foundToToken);
    }
    
    // Parse amount parameter
    const amountParam = params.get('amount');
    if (amountParam && !isNaN(parseFloat(amountParam))) {
      setFromAmount(amountParam);
    }
  }, [tokens]);

  // Fetch quote when fromAmount, fromToken, or toToken changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        setToAmount("");
        setPriceImpact(null);
        return;
      }

      // Handle wrap/unwrap - 1:1 ratio
      const isWrap = fromToken.symbol === 'USDC' && toToken.symbol === 'wUSDC';
      const isUnwrap = fromToken.symbol === 'wUSDC' && toToken.symbol === 'USDC';

      if (isWrap || isUnwrap) {
        setToAmount(fromAmount);
        setPriceImpact(0);
        return;
      }

      if (!window.ethereum) return;

      setIsLoadingQuote(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const ROUTER_ADDRESS = "0x173A08F94C13a4A64a598361165e84Df871aEa9E";
        const ROUTER_ABI = [
          "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
        ];

        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
        const amountIn = parseAmount(fromAmount, fromToken.decimals);

        // Build path - use wUSDC for liquidity pool routing
        let path: string[] = [];
        const isFromNative = fromToken.address === "0x0000000000000000000000000000000000000000";
        const isToNative = toToken.address === "0x0000000000000000000000000000000000000000";

        // Get wUSDC address for routing
        const wusdcTokenData = tokens.find(t => t.symbol === 'wUSDC');
        const wusdcAddress = wusdcTokenData?.address;

        if (!wusdcAddress) {
          throw new Error("wUSDC token not found");
        }

        // Convert native USDC addresses to wUSDC for pool routing
        const fromTokenAddress = isFromNative ? wusdcAddress : fromToken.address;
        const toTokenAddress = isToNative ? wusdcAddress : toToken.address;

        // Build path based on converted addresses
        if (fromTokenAddress === toTokenAddress) {
          // Same token (shouldn't happen in UI, but handle it)
          path = [fromTokenAddress, toTokenAddress];
        } else if (fromTokenAddress === wusdcAddress || toTokenAddress === wusdcAddress) {
          // Direct path if one token is wUSDC
          path = [fromTokenAddress, toTokenAddress];
        } else {
          // Multi-hop through wUSDC
          path = [fromTokenAddress, wusdcAddress, toTokenAddress];
        }

        let amounts;
        try {
          amounts = await router.getAmountsOut(amountIn, path);
        } catch (error) {
          // If multi-hop fails, try direct path
          if (path.length > 2) {
            path = [fromToken.address, toToken.address];
            try {
              amounts = await router.getAmountsOut(amountIn, path);
            } catch {
              throw error;
            }
          } else {
            throw error;
          }
        }

        const outputAmount = formatAmount(amounts[amounts.length - 1], toToken.decimals);
        setToAmount(outputAmount);

        // Calculate price impact properly for any decimal combination
        const fromAmountBigInt = parseAmount(fromAmount, fromToken.decimals);
        const outputAmountBigInt = amounts[amounts.length - 1];
        
        // Calculate expected 1:1 value ratio at same precision
        // Price impact = |1 - (actualOutput / expectedOutput)| * 100
        // For tokens with different decimals, normalize to compare actual values
        
        // Get the ratio: how much of toToken we get per 1 fromToken
        const ONE_TOKEN = 10n ** BigInt(fromToken.decimals);
        
        try {
          // Get quote for 1 unit of fromToken
          const oneTokenAmounts = await router.getAmountsOut(ONE_TOKEN, path);
          const oneTokenOutput = oneTokenAmounts[oneTokenAmounts.length - 1];
          
          // Calculate expected output based on linear scaling
          const expectedOutput = (fromAmountBigInt * oneTokenOutput) / ONE_TOKEN;
          
          // Calculate price impact as deviation from linear expectation
          if (expectedOutput > 0n && outputAmountBigInt > 0n) {
            const impactBasisPoints = expectedOutput > outputAmountBigInt
              ? ((expectedOutput - outputAmountBigInt) * 10000n) / expectedOutput
              : ((outputAmountBigInt - expectedOutput) * 10000n) / expectedOutput;
            
            const impact = Number(impactBasisPoints) / 100;
            setPriceImpact(Math.abs(impact));
          } else {
            setPriceImpact(0);
          }
        } catch {
          // Fallback: simple comparison if quote fails
          setPriceImpact(0);
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        setToAmount("");
        setPriceImpact(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
    
    // Set up auto-refresh interval
    const intervalId = setInterval(fetchQuote, quoteRefreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [fromAmount, fromToken, toToken, tokens, quoteRefreshInterval])

  const loadTokens = async () => {
    try {
      // Load imported tokens from localStorage
      const imported = localStorage.getItem('importedTokens');
      const importedTokens: Token[] = imported ? JSON.parse(imported) : [];

      // Add a default logoURI for missing logos, fallback to '?' if not available
      const processedTokens = defaultTokens.map(token => ({
        ...token,
        logoURI: token.logoURI || `/img/logos/unknown-token.png` // Fallback logo
      }));

      const processedImportedTokens = importedTokens.map(token => ({
        ...token,
        logoURI: token.logoURI || `/img/logos/unknown-token.png` // Fallback logo
      }));

      setTokens([...processedTokens, ...processedImportedTokens]);
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
        logoURI: `/img/logos/unknown-token.png`, // Fallback logo
        verified: false,
      };

      // Check if token already exists
      const exists = tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
      if (exists) {
        throw new Error("Token already in list");
      }

      // Save to localStorage
      const imported = localStorage.getItem('importedTokens');
      const importedTokens: Token[] = imported ? JSON.parse(imported) : [];

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

    setIsSwapping(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const amountBigInt = parseAmount(amount, wusdcToken.decimals);

      // For native USDC, we send it to wUSDC contract's deposit function
      // The wUSDC contract receives native tokens and mints wrapped tokens
      const wusdcContract = new Contract(wusdcToken.address, WUSDC_ABI, signer);

      toast({
        title: "Wrapping...",
        description: `Wrapping ${amount} USDC to wUSDC`,
      });

      // Call deposit with the amount as value (native token transfer)
      const tx = await wusdcContract.deposit({ value: amountBigInt });
      const receipt = await tx.wait();

      // Refetch balances
      await Promise.all([refetchFromBalance(), refetchToBalance()]);

      setFromAmount("");
      setToAmount("");

      toast({
        title: "Wrap successful!",
        description: (
          <div className="flex items-center gap-2">
            <span>Successfully wrapped {amount} USDC to wUSDC</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2"
              onClick={() => openExplorer(receipt.hash)}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ),
      });
    } catch (error: any) {
      console.error('Wrap error:', error);
      toast({
        title: "Wrap failed",
        description: error.reason || error.message || "Failed to wrap tokens",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleUnwrap = async (amount: string) => {
    if (!address || !window.ethereum || !wusdcToken) return;

    setIsSwapping(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const amountBigInt = parseAmount(amount, wusdcToken.decimals);
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
      const receipt = await tx.wait();

      // Refetch balances
      await Promise.all([refetchFromBalance(), refetchToBalance()]);

      setFromAmount("");
      setToAmount("");

      toast({
        title: "Unwrap successful!",
        description: (
          <div className="flex items-center gap-2">
            <span>Successfully unwrapped {amount} wUSDC to USDC</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2"
              onClick={() => openExplorer(receipt.hash)}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ),
      });
    } catch (error: any) {
      console.error('Unwrap error:', error);
      toast({
        title: "Unwrap failed",
        description: error.reason || error.message || "Failed to unwrap tokens",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;

    // Check if this is a wrap/unwrap operation
    const isWrap = fromToken.symbol === 'USDC' && toToken.symbol === 'wUSDC';
    const isUnwrap = fromToken.symbol === 'wUSDC' && toToken.symbol === 'USDC';

    if (isWrap) {
      await handleWrap(fromAmount);
      return;
    }

    if (isUnwrap) {
      await handleUnwrap(fromAmount);
      return;
    }

    setIsSwapping(true);
    try {

      if (!address || !window.ethereum) {
        throw new Error("Please connect your wallet");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const ROUTER_ADDRESS = "0x173A08F94C13a4A64a598361165e84Df871aEa9E";
      const ROUTER_ABI = [
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
      ];

      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const amountIn = parseAmount(fromAmount, fromToken.decimals);

      // Build path - use wUSDC for liquidity pool routing
      let path: string[] = [];
      const isFromNative = fromToken.address === "0x0000000000000000000000000000000000000000";
      const isToNative = toToken.address === "0x0000000000000000000000000000000000000000";

      // Get wUSDC address for routing
      const wusdcAddress = wusdcToken?.address;

      if (!wusdcAddress) {
        throw new Error("wUSDC token not found");
      }

      // Convert native USDC addresses to wUSDC for pool routing
      const fromTokenAddress = isFromNative ? wusdcAddress : fromToken.address;
      const toTokenAddress = isToNative ? wusdcAddress : toToken.address;

      // Build path based on converted addresses
      if (fromTokenAddress === toTokenAddress) {
        // Same token (shouldn't happen in UI, but handle it)
        path = [fromTokenAddress, toTokenAddress];
      } else if (fromTokenAddress === wusdcAddress || toTokenAddress === wusdcAddress) {
        // Direct path if one token is wUSDC
        path = [fromTokenAddress, toTokenAddress];
      } else {
        // Multi-hop through wUSDC
        path = [fromTokenAddress, wusdcAddress, toTokenAddress];
      }

      // Get expected output
      let amounts;
      try {
        amounts = await router.getAmountsOut(amountIn, path);
      } catch (error) {
        // If multi-hop fails, try direct path
        if (path.length > 2) {
          path = [fromToken.address, toToken.address];
          try {
            amounts = await router.getAmountsOut(amountIn, path);
          } catch {
            throw new Error("No liquidity pool exists for this token pair. Try using wUSDC instead of USDC.");
          }
        } else {
          throw new Error("No liquidity pool exists for this token pair. Try using wUSDC instead of USDC.");
        }
      }

      const amountOutMin = amounts[amounts.length - 1] * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

      // Deadline from settings
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + 60 * deadline;

      // Use recipient address if provided, otherwise use connected wallet
      const recipient = recipientAddress && recipientAddress.startsWith('0x') && recipientAddress.length === 42 
        ? recipientAddress 
        : address;

      toast({
        title: "Swap initiated",
        description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      });

      let tx;

      if (isFromNative) {
        // Swap native USDC for tokens
        tx = await router.swapExactETHForTokens(
          amountOutMin,
          path,
          recipient,
          deadlineTimestamp,
          { value: amountIn }
        );
      } else if (isToNative) {
        // Swap tokens for native USDC
        // First approve router to spend tokens
        const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, ROUTER_ADDRESS);

        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn);
          const approveReceipt = await approveTx.wait();

          // Refetch balances after approval
          await Promise.all([refetchFromBalance(), refetchToBalance()]);

          toast({
            title: "Approval successful",
            description: (
              <div className="flex items-center gap-2">
                <span>Token approval confirmed</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2"
                  onClick={() => openExplorer(approveReceipt.hash)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ),
          });
        }

        tx = await router.swapExactTokensForETH(
          amountIn,
          amountOutMin,
          path,
          recipient,
          deadlineTimestamp
        );
      } else {
        // Swap tokens for tokens
        // First approve router to spend tokens
        const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, ROUTER_ADDRESS);

        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountIn);
          const approveReceipt = await approveTx.wait();

          // Refetch balances after approval
          await Promise.all([refetchFromBalance(), refetchToBalance()]);

          toast({
            title: "Approval successful",
            description: (
              <div className="flex items-center gap-2">
                <span>Token approval confirmed</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2"
                  onClick={() => openExplorer(approveReceipt.hash)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ),
          });
        }

        tx = await router.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          recipient,
          deadlineTimestamp
        );
      }

      const receipt = await tx.wait();

      // Refetch balances after swap
      await Promise.all([refetchFromBalance(), refetchToBalance()]);

      setFromAmount("");
      setToAmount("");

      toast({
        title: "Swap successful!",
        description: (
          <div className="flex items-center gap-2">
            <span>Successfully swapped {fromAmount} {fromToken.symbol} for {toToken.symbol}</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2"
              onClick={() => openExplorer(receipt.hash)}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ),
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

  // Fetch balances for selected tokens with auto-refresh
  const isFromTokenNative = fromToken?.address === "0x0000000000000000000000000000000000000000";
  const isToTokenNative = toToken?.address === "0x0000000000000000000000000000000000000000";

  const { data: fromBalance, refetch: refetchFromBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    ...(fromToken && !isFromTokenNative ? { token: fromToken.address as `0x${string}` } : {}),
  });

  const { data: toBalance, refetch: refetchToBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    ...(toToken && !isToTokenNative ? { token: toToken.address as `0x${string}` } : {}),
  });

  // Auto-refresh balances every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const intervalId = setInterval(() => {
      refetchFromBalance();
      refetchToBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isConnected, refetchFromBalance, refetchToBalance]);

  let fromBalanceFormatted = "0.00";
  let toBalanceFormatted = "0.00";

  try {
    if (fromBalance) {
      const formatted = formatAmount(fromBalance.value, fromBalance.decimals);
      fromBalanceFormatted = formatted;
    }
  } catch (error) {
    console.error('Error formatting fromBalance', error);
  }

  try {
    if (toBalance) {
      const formatted = formatAmount(toBalance.value, toBalance.decimals);
      toBalanceFormatted = formatted;
    }
  } catch (error) {
    console.error('Error formatting toBalance', error);
  }

  const usdcToken = tokens.find(t => t.symbol === 'USDC');
  const wusdcToken = tokens.find(t => t.symbol === 'wUSDC');

  return (
    <div className="container max-w-md mx-auto px-4 py-4 md:py-8 fade-in">
      <Card className="border-border/40 shadow-2xl backdrop-blur-xl bg-card/95 card-hover overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none"></div>
        <CardHeader className="space-y-1 pb-4 md:pb-6 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Swap Tokens
            </CardTitle>
            <Button 
              data-testid="button-settings"
              size="icon" 
              variant="ghost"
              onClick={() => setShowSettings(true)}
              className="h-9 w-9 hover:bg-accent/50 hover:rotate-90 transition-all duration-300"
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

            <div className="relative bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border/40 hover:border-primary/40 transition-all duration-300 glass group">
              <Input
                data-testid="input-from-amount"
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-xl md:text-2xl font-semibold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
              />

              <div className="flex items-center justify-between mt-3">
                <Button
                  data-testid="button-select-from-token"
                  onClick={() => setShowFromSelector(true)}
                  variant="secondary"
                  className="h-10 px-3 md:px-4 hover:bg-secondary/80 hover:scale-105 transition-all duration-300 group"
                >
                  {fromToken ? (
                    <div className="flex items-center gap-2">
                      {fromToken.logoURI ? (
                        <img 
                          src={fromToken.logoURI} 
                          alt={fromToken.symbol} 
                          className="w-6 h-6 rounded-full group-hover:scale-110 transition-transform duration-300" 
                          onError={(e) => {
                            console.error('Failed to load token logo:', fromToken.logoURI);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-500"></div>
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

          <div className="flex justify-center -my-2 relative z-10">
            <Button
              data-testid="button-swap-direction"
              size="icon"
              variant="ghost"
              onClick={handleSwapTokens}
              disabled={!fromToken || !toToken}
              className="rounded-full h-10 w-10 bg-card border-4 border-background hover:bg-primary hover:text-primary-foreground hover:rotate-180 transition-all duration-500 shadow-lg hover:shadow-primary/50 disabled:opacity-50 pulse-glow"
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

            <div className="relative bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border/40 hover:border-primary/40 transition-all duration-300 glass">
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
                        <div className="w-6 h-6 rounded-full bg-red-500"></div>
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

          {fromToken && toToken && fromAmount && toAmount && (
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 space-y-2 border border-border/40 glass fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-medium">
                  1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              {priceImpact !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    priceImpact > 5 ? 'text-red-500' : 
                    priceImpact > 2 ? 'text-orange-500' : 
                    'text-green-500'
                  }`}>
                    {priceImpact > 5 && <AlertTriangle className="h-3 w-3" />}
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Minimum Received</span>
                <span className="font-medium">
                  {(parseFloat(toAmount) * (100 - slippage) / 100).toFixed(6)} {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          {isConnected ? (
            <Button
              data-testid="button-swap"
              onClick={handleSwap}
              disabled={!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
              className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-primary via-blue-500 to-blue-600 hover:from-primary/90 hover:via-blue-500/90 hover:to-blue-600/90 shadow-xl hover:shadow-2xl hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
            >
              <span className="relative z-10">{isSwapping ? "Swapping..." : "Swap"}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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

      <SwapSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
        deadline={deadline}
        onDeadlineChange={setDeadline}
        recipientAddress={recipientAddress}
        onRecipientAddressChange={setRecipientAddress}
        quoteRefreshInterval={quoteRefreshInterval}
        onQuoteRefreshIntervalChange={setQuoteRefreshInterval}
      />
    </div>
  );
}
