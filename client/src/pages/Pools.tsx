
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Search, TrendingUp, Droplets } from "lucide-react";
import { useChainId } from "wagmi";
import { fetchAllPools, calculateTotalTVL, type PoolData } from "@/lib/pool-utils";
import { getContractsForChain } from "@/lib/contracts";
import { getTokensByChainId } from "@/data/tokens";

export default function Pools() {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalTVL, setTotalTVL] = useState(0);
  
  const chainId = useChainId();
  const contracts = chainId ? getContractsForChain(chainId) : null;
  const tokens = chainId ? getTokensByChainId(chainId) : [];

  useEffect(() => {
    if (chainId && contracts) {
      loadPools();
    }
  }, [chainId]);

  const loadPools = async () => {
    if (!contracts || !chainId) return;

    setIsLoading(true);
    try {
      const poolData = await fetchAllPools(contracts.factory, chainId, tokens);
      setPools(poolData);
      setTotalTVL(calculateTotalTVL(poolData));
    } catch (error) {
      console.error("Failed to load pools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPools = pools.filter(pool => {
    const query = searchQuery.toLowerCase();
    return (
      pool.token0.symbol.toLowerCase().includes(query) ||
      pool.token1.symbol.toLowerCase().includes(query) ||
      pool.token0.name.toLowerCase().includes(query) ||
      pool.token1.name.toLowerCase().includes(query)
    );
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-4 md:py-8">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Liquidity Pools
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore all available trading pairs
            </p>
          </div>
          <Button
            onClick={loadPools}
            disabled={isLoading}
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pools</p>
                  <p className="text-2xl font-bold">{pools.length}</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total TVL</p>
                  <p className="text-2xl font-bold">{formatNumber(totalTVL)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Pairs</p>
                  <p className="text-2xl font-bold">
                    {pools.filter(p => p.tvlUSD > 0).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pools by token name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pools List */}
      <Card className="border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle>All Pools</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredPools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No pools found matching your search" : "No pools available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPools.map((pool) => (
                <div
                  key={pool.pairAddress}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:border-primary/40 transition-all duration-300 hover:bg-accent/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center font-semibold text-sm">
                        {pool.token0.symbol[0]}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border-2 border-background flex items-center justify-center font-semibold text-sm">
                        {pool.token1.symbol[0]}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pool.token0.name} / {pool.token1.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-semibold text-lg">
                      {formatNumber(pool.tvlUSD)}
                    </p>
                    <p className="text-xs text-muted-foreground">TVL</p>
                  </div>

                  <div className="text-right space-y-1 hidden md:block">
                    <p className="font-mono text-sm">
                      {parseFloat(pool.reserve0Formatted).toFixed(4)} {pool.token0.symbol}
                    </p>
                    <p className="font-mono text-sm">
                      {parseFloat(pool.reserve1Formatted).toFixed(4)} {pool.token1.symbol}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
