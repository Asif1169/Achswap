
import { Contract, BrowserProvider } from "ethers";
import { formatUnits } from "ethers";
import type { Token } from "@shared/schema";

const FACTORY_ABI = [
  "function allPairsLength() external view returns (uint)",
  "function allPairs(uint) external view returns (address)",
];

const PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() external view returns (uint256)",
];

const ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)",
];

export interface PoolData {
  pairAddress: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
  };
  reserve0: bigint;
  reserve1: bigint;
  reserve0Formatted: string;
  reserve1Formatted: string;
  tvlUSD: number;
  totalSupply: bigint;
}

export async function fetchAllPools(
  factoryAddress: string,
  chainId: number,
  knownTokens: Token[]
): Promise<PoolData[]> {
  try {
    const rpcUrl = chainId === 2201 
      ? 'https://rpc.testnet.stable.xyz/' 
      : 'https://rpc.testnet.arc.network';

    const provider = new BrowserProvider({
      request: async ({ method, params }: any) => {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
          }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.result;
      },
    });

    const factory = new Contract(factoryAddress, FACTORY_ABI, provider);
    const pairsLength = await factory.allPairsLength();
    const length = Number(pairsLength);

    console.log(`Found ${length} pools on chain ${chainId}`);

    // Fetch all pair addresses
    const pairAddresses: string[] = [];
    for (let i = 0; i < length; i++) {
      const pairAddress = await factory.allPairs(i);
      pairAddresses.push(pairAddress);
    }

    // Fetch pool data for each pair
    const pools: PoolData[] = [];
    
    for (const pairAddress of pairAddresses) {
      try {
        const pairContract = new Contract(pairAddress, PAIR_ABI, provider);
        
        const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
          pairContract.token0(),
          pairContract.token1(),
          pairContract.getReserves(),
          pairContract.totalSupply(),
        ]);

        // Fetch token info
        const token0Contract = new Contract(token0Address, ERC20_ABI, provider);
        const token1Contract = new Contract(token1Address, ERC20_ABI, provider);

        const [token0Symbol, token0Decimals, token0Name, token1Symbol, token1Decimals, token1Name] = await Promise.all([
          token0Contract.symbol(),
          token0Contract.decimals(),
          token0Contract.name(),
          token1Contract.symbol(),
          token1Contract.decimals(),
          token1Contract.name(),
        ]);

        // Skip wrapped token pairs (wUSDC/USDC, wUSDT/gUSDT) - these are wrap tokens, not trading pairs
        if (isWrappedTokenPair(token0Symbol, token1Symbol, chainId)) {
          console.log(`Skipping wrapped token pair: ${token0Symbol}/${token1Symbol}`);
          continue;
        }

        const reserve0 = reserves[0];
        const reserve1 = reserves[1];

        // Format reserves
        const reserve0Formatted = formatUnits(reserve0, Number(token0Decimals));
        const reserve1Formatted = formatUnits(reserve1, Number(token1Decimals));

        // Calculate TVL in USD using chain-specific logic
        const tvlUSD = calculateTVL(
          token0Symbol,
          token1Symbol,
          parseFloat(reserve0Formatted),
          parseFloat(reserve1Formatted),
          chainId
        );

        pools.push({
          pairAddress,
          token0: {
            address: token0Address,
            symbol: token0Symbol,
            decimals: Number(token0Decimals),
            name: token0Name,
          },
          token1: {
            address: token1Address,
            symbol: token1Symbol,
            decimals: Number(token1Decimals),
            name: token1Name,
          },
          reserve0,
          reserve1,
          reserve0Formatted,
          reserve1Formatted,
          tvlUSD,
          totalSupply,
        });
      } catch (error) {
        console.error(`Failed to fetch data for pair ${pairAddress}:`, error);
      }
    }

    return pools;
  } catch (error) {
    console.error('Failed to fetch pools:', error);
    throw error;
  }
}

function calculateTVL(
  token0Symbol: string,
  token1Symbol: string,
  reserve0: number,
  reserve1: number,
  chainId: number
): number {
  // Chain-specific stable tokens
  const stableTokens = chainId === 2201 
    ? ['gUSDT', 'USDT']  // Stable Testnet - only count native and ERC20 USDT
    : ['USDC'];          // ARC Testnet - only count native USDC

  const isToken0Stable = stableTokens.includes(token0Symbol);
  const isToken1Stable = stableTokens.includes(token1Symbol);

  if (isToken0Stable && isToken1Stable) {
    // Both stable - direct sum
    return reserve0 + reserve1;
  } else if (isToken0Stable) {
    // Token0 is stable, so TVL = 2 * reserve0
    return 2 * reserve0;
  } else if (isToken1Stable) {
    // Token1 is stable, so TVL = 2 * reserve1
    return 2 * reserve1;
  } else {
    // Neither is stable - we can't calculate USD value without price data
    // Return 0 or estimate based on other pairs (future enhancement)
    return 0;
  }
}

function isWrappedTokenPair(token0Symbol: string, token1Symbol: string, chainId: number): boolean {
  // Wrapped tokens are not trading pairs, they're 1:1 wrappers
  const wrappedPairs = chainId === 2201
    ? [['gUSDT', 'wUSDT'], ['wUSDT', 'gUSDT']]
    : [['USDC', 'wUSDC'], ['wUSDC', 'USDC']];
  
  return wrappedPairs.some(
    ([t0, t1]) => token0Symbol === t0 && token1Symbol === t1
  );
}

export function calculateTotalTVL(pools: PoolData[]): number {
  return pools.reduce((sum, pool) => sum + pool.tvlUSD, 0);
}
