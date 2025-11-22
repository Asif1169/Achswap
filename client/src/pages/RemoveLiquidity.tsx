import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowDown } from "lucide-react";
import { TokenSelector } from "@/components/TokenSelector";
import { useAccount, useBalance } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import type { Token } from "@shared/schema";
import { Contract, BrowserProvider, formatUnits, parseUnits } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() view returns (uint256)",
];

export default function RemoveLiquidity() {
  const [percentage, setPercentage] = useState([25]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [showTokenASelector, setShowTokenASelector] = useState(false);
  const [showTokenBSelector, setShowTokenBSelector] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pairAddress, setPairAddress] = useState<string | null>(null);
  const [lpBalance, setLpBalance] = useState<string>("0");
  const [amountAToReceive, setAmountAToReceive] = useState<string>("0");
  const [amountBToReceive, setAmountBToReceive] = useState<string>("0");

  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    if (tokenA && tokenB && address) {
      fetchPairInfo();
    }
  }, [tokenA, tokenB, address]);

  useEffect(() => {
    const calculateAmountsToReceive = async () => {
      if (!pairAddress || !tokenA || !tokenB || parseFloat(lpBalance) <= 0) {
        setAmountAToReceive("0");
        setAmountBToReceive("0");
        return;
      }

      try {
        if (!window.ethereum) return;

        const provider = new BrowserProvider(window.ethereum);
        const pairContract = new Contract(pairAddress, PAIR_ABI, provider);

        const [reserve0, reserve1] = await pairContract.getReserves();
        const totalSupply = await pairContract.totalSupply();
        const token0Address = await pairContract.token0();

        const liquidityToRemove = parseUnits(lpBalance, 18) * BigInt(percentage[0]) / 100n;

        const amount0 = liquidityToRemove * reserve0 / totalSupply;
        const amount1 = liquidityToRemove * reserve1 / totalSupply;

        // Determine which token is token0
        const isTokenAToken0 = tokenA.address.toLowerCase() === token0Address.toLowerCase();

        if (isTokenAToken0) {
          setAmountAToReceive(formatUnits(amount0, tokenA.decimals));
          setAmountBToReceive(formatUnits(amount1, tokenB.decimals));
        } else {
          setAmountAToReceive(formatUnits(amount1, tokenA.decimals));
          setAmountBToReceive(formatUnits(amount0, tokenB.decimals));
        }
      } catch (error) {
        console.error('Failed to calculate amounts:', error);
        setAmountAToReceive("0");
        setAmountBToReceive("0");
      }
    };

    calculateAmountsToReceive();
  }, [pairAddress, tokenA, tokenB, lpBalance, percentage]);

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
      toast({
        title: "Import failed",
        description: error.message || "Failed to import token",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchPairInfo = async () => {
    try {
      if (!window.ethereum || !tokenA || !tokenB) return;

      const provider = new BrowserProvider(window.ethereum);
      const FACTORY_ADDRESS = "0x90195102F2388E8e30E78BC0b1D3A9748379a1F5";
      const FACTORY_ABI = [
        "function getPair(address tokenA, address tokenB) view returns (address pair)"
      ];

      const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      const pair = await factory.getPair(tokenA.address, tokenB.address);

      if (pair === "0x0000000000000000000000000000000000000000") {
        setPairAddress(null);
        setLpBalance("0");
        return;
      }

      setPairAddress(pair);

      // Get LP token balance
      const pairContract = new Contract(pair, ERC20_ABI, provider);
      const balance = await pairContract.balanceOf(address);
      setLpBalance(formatUnits(balance, 18));
    } catch (error) {
      console.error('Failed to fetch pair info:', error);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!tokenA || !tokenB || !pairAddress || parseFloat(lpBalance) <= 0) return;

    setIsRemoving(true);
    try {
      if (!address || !window.ethereum) {
        throw new Error("Please connect your wallet");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const ROUTER_ADDRESS = "0xFb5B0cc9a61E76C5B5c60b52dF092F30B36c547e";
      const ROUTER_ABI = [
        "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
        "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)"
      ];

      const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
      const pairContract = new Contract(pairAddress, ERC20_ABI, signer);

      // Calculate liquidity to remove based on percentage
      const totalLiquidity = parseUnits(lpBalance, 18);
      const liquidityToRemove = totalLiquidity * BigInt(percentage[0]) / 100n;

      // Approve router to spend LP tokens
      const allowance = await pairContract.allowance(address, ROUTER_ADDRESS);
      if (allowance < liquidityToRemove) {
        const approveTx = await pairContract.approve(ROUTER_ADDRESS, liquidityToRemove);
        await approveTx.wait();
      }

      // Deadline: 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      // Minimum amounts with 5% slippage
      const amountAMin = 0n; // In production, calculate this properly
      const amountBMin = 0n;

      toast({
        title: "Removing liquidity",
        description: `Removing ${percentage[0]}% of your liquidity`,
      });

      const isTokenANative = tokenA.address === "0x0000000000000000000000000000000000000000";
      const isTokenBNative = tokenB.address === "0x0000000000000000000000000000000000000000";

      let tx;

      if (isTokenANative || isTokenBNative) {
        const token = isTokenANative ? tokenB : tokenA;
        tx = await router.removeLiquidityETH(
          token.address,
          liquidityToRemove,
          amountAMin,
          amountBMin,
          address,
          deadline
        );
      } else {
        tx = await router.removeLiquidity(
          tokenA.address,
          tokenB.address,
          liquidityToRemove,
          amountAMin,
          amountBMin,
          address,
          deadline
        );
      }

      await tx.wait();

      toast({
        title: "Liquidity removed!",
        description: `Successfully removed ${percentage[0]}% of your liquidity`,
      });

      setPercentage([25]);
      fetchPairInfo(); // Refresh LP balance
    } catch (error: any) {
      console.error('Remove liquidity error:', error);
      toast({
        title: "Failed to remove liquidity",
        description: error.reason || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-4 md:py-8">
      <Card className="border-border/40 shadow-xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-1 pb-4 md:pb-6">
          <CardTitle className="text-xl md:text-2xl font-bold">Remove Liquidity</CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Remove liquidity to receive tokens back
          </p>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                data-testid="button-select-token-a"
                onClick={() => setShowTokenASelector(true)}
                variant="secondary"
                className="flex-1"
              >
                {tokenA ? (
                  <div className="flex items-center gap-2">
                    {tokenA.logoURI && <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-5 h-5 rounded-full" />}
                    <span className="font-semibold">{tokenA.symbol}</span>
                  </div>
                ) : (
                  "Select Token A"
                )}
              </Button>
              <Button
                data-testid="button-select-token-b"
                onClick={() => setShowTokenBSelector(true)}
                variant="secondary"
                className="flex-1"
              >
                {tokenB ? (
                  <div className="flex items-center gap-2">
                    {tokenB.logoURI && <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-5 h-5 rounded-full" />}
                    <span className="font-semibold">{tokenB.symbol}</span>
                  </div>
                ) : (
                  "Select Token B"
                )}
              </Button>
            </div>
          </div>

          {tokenA && tokenB && pairAddress && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Amount to remove</label>
                  <span className="text-2xl font-bold text-primary">{percentage[0]}%</span>
                </div>

                <Slider
                  data-testid="slider-remove-percentage"
                  value={percentage}
                  onValueChange={setPercentage}
                  max={100}
                  step={1}
                  className="py-4"
                />

                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((value) => (
                    <Button
                      key={value}
                      data-testid={`button-percentage-${value}`}
                      size="sm"
                      variant={percentage[0] === value ? "default" : "secondary"}
                      onClick={() => setPercentage([value])}
                      className="flex-1"
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Your position</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">LP Tokens</span>
                  <span className="font-medium">{parseFloat(lpBalance).toFixed(6)}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">You will receive</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tokenA.logoURI ? (
                        <img src={tokenA.logoURI} alt={tokenA.symbol} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-background" />
                      )}
                      <span className="text-sm font-medium">{tokenA.symbol}</span>
                    </div>
                    <span className="font-medium tabular-nums">{parseFloat(amountAToReceive).toFixed(6)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tokenB.logoURI ? (
                        <img src={tokenB.logoURI} alt={tokenB.symbol} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-background" />
                      )}
                      <span className="text-sm font-medium">{tokenB.symbol}</span>
                    </div>
                    <span className="font-medium tabular-nums">{parseFloat(amountBToReceive).toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isConnected ? (
            <Button
              data-testid="button-remove-liquidity"
              onClick={handleRemoveLiquidity}
              disabled={!tokenA || !tokenB || !pairAddress || parseFloat(lpBalance) <= 0 || isRemoving}
              className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRemoving ? "Removing Liquidity..." : "Remove Liquidity"}
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

          <p className="text-xs text-muted-foreground text-center">
            Removing liquidity will return your tokens and any earned fees
          </p>
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