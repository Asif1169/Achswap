import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAccount, useChainId } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { Contract, BrowserProvider } from "ethers";
import { getContractsForChain } from "@/lib/contracts";
import { NONFUNGIBLE_POSITION_MANAGER_ABI, V3_POOL_ABI, FEE_TIER_LABELS } from "@/lib/abis/v3";
import { formatAmount } from "@/lib/decimal-utils";
import { ExternalLink, Trash2 } from "lucide-react";

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

interface V3Position {
  tokenId: bigint;
  token0Symbol: string;
  token1Symbol: string;
  fee: number;
  liquidity: bigint;
  tickLower: number;
  tickUpper: number;
}

export function RemoveLiquidityV3() {
  const [positions, setPositions] = useState<V3Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<V3Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();

  const contracts = chainId ? getContractsForChain(chainId) : null;

  // Load user's V3 positions
  const loadPositions = async () => {
    if (!address || !contracts || !window.ethereum) return;

    setIsLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const positionManager = new Contract(
        contracts.v3.nonfungiblePositionManager,
        NONFUNGIBLE_POSITION_MANAGER_ABI,
        provider
      );

      const balance = await positionManager.balanceOf(address);
      const userPositions: V3Position[] = [];

      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await positionManager.tokenOfOwnerByIndex(address, i);
          const position = await positionManager.positions(tokenId);

          // Get token symbols
          const token0Contract = new Contract(position[2], ERC20_ABI, provider);
          const token1Contract = new Contract(position[3], ERC20_ABI, provider);

          const [token0Symbol, token1Symbol] = await Promise.all([
            token0Contract.symbol(),
            token1Contract.symbol(),
          ]);

          userPositions.push({
            tokenId,
            token0Symbol,
            token1Symbol,
            fee: Number(position[4]),
            liquidity: position[7],
            tickLower: Number(position[5]),
            tickUpper: Number(position[6]),
          });
        } catch (error) {
          console.error(`Error loading position ${i}:`, error);
          continue;
        }
      }

      setPositions(userPositions);

      if (userPositions.length === 0) {
        toast({
          title: "No V3 positions found",
          description: "You don't have any V3 liquidity positions",
        });
      }
    } catch (error) {
      console.error("Error loading V3 positions:", error);
      toast({
        title: "Failed to load positions",
        description: "Could not fetch your V3 liquidity positions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadPositions();
    }
  }, [isConnected, address, chainId]);

  const handleRemove = async () => {
    if (!selectedPosition || !address || !contracts || !window.ethereum) return;

    setIsRemoving(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const positionManager = new Contract(
        contracts.v3.nonfungiblePositionManager,
        NONFUNGIBLE_POSITION_MANAGER_ABI,
        signer
      );

      toast({
        title: "Removing liquidity...",
        description: "Step 1: Decreasing liquidity",
      });

      // Step 1: Decrease liquidity
      const decreaseParams = {
        tokenId: selectedPosition.tokenId,
        liquidity: selectedPosition.liquidity,
        amount0Min: 0n,
        amount1Min: 0n,
        deadline: Math.floor(Date.now() / 1000) + 1200,
      };

      const decreaseTx = await positionManager.decreaseLiquidity(decreaseParams);
      await decreaseTx.wait();

      toast({
        title: "Collecting tokens...",
        description: "Step 2: Collecting your tokens",
      });

      // Step 2: Collect tokens
      const collectParams = {
        tokenId: selectedPosition.tokenId,
        recipient: address,
        amount0Max: 2n ** 128n - 1n,
        amount1Max: 2n ** 128n - 1n,
      };

      const collectTx = await positionManager.collect(collectParams);
      const receipt = await collectTx.wait();

      toast({
        title: "Burning position...",
        description: "Step 3: Burning NFT position",
      });

      // Step 3: Burn NFT
      const burnTx = await positionManager.burn(selectedPosition.tokenId);
      await burnTx.wait();

      setSelectedPosition(null);
      await loadPositions();

      toast({
        title: "Liquidity removed!",
        description: (
          <div className="flex items-center gap-2">
            <span>Successfully removed V3 liquidity</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2"
              onClick={() => window.open(`${contracts.explorer}${receipt.hash}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ),
      });
    } catch (error: any) {
      console.error("Remove liquidity error:", error);
      toast({
        title: "Failed to remove liquidity",
        description: error.reason || error.message || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">Connect your wallet to view V3 positions</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6 text-center text-slate-400">
          Loading your V3 positions...
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6 text-center space-y-3">
          <Trash2 className="h-12 w-12 text-slate-600 mx-auto" />
          <p className="text-slate-400">No V3 liquidity positions found</p>
          <Button variant="outline" size="sm" onClick={loadPositions}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Positions List */}
      <div className="space-y-3">
        {positions.map((position, index) => (
          <Card
            key={index}
            className={`bg-slate-900 border-slate-700 cursor-pointer transition-all ${
              selectedPosition?.tokenId === position.tokenId
                ? "ring-2 ring-purple-500"
                : "hover:border-slate-600"
            }`}
            onClick={() => setSelectedPosition(position)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">
                    {position.token0Symbol} / {position.token1Symbol}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Fee: {FEE_TIER_LABELS[position.fee as keyof typeof FEE_TIER_LABELS]} | 
                    Token ID: #{position.tokenId.toString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-purple-400">
                    V3 Position
                  </div>
                  <div className="text-xs text-slate-500">
                    Liquidity: {position.liquidity.toString().slice(0, 10)}...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Remove Button */}
      {selectedPosition && (
        <Button
          onClick={handleRemove}
          disabled={isRemoving}
          variant="destructive"
          className="w-full h-12 text-base font-semibold"
        >
          {isRemoving ? "Removing..." : "Remove V3 Liquidity"}
        </Button>
      )}
    </div>
  );
}
