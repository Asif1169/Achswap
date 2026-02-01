import { Token } from "@shared/schema";

// ARC Testnet tokens (Chain ID: 5042002)
const arcTestnetTokens: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
    logoURI: "/img/usdc.webp",
    verified: true,
    chainId: 5042002
  },
  {
    address: "0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA",
    name: "Wrapped USDC",
    symbol: "wUSDC",
    decimals: 18,
    logoURI: "/img/logos/wusdc.png",
    verified: true,
    chainId: 5042002
  },
  {
    address: "0x45Bb5425f293bdd209c894364C462421FF5FfA48",
    name: "Achswap Token",
    symbol: "ACHS",
    decimals: 18,
    logoURI: "/img/logos/achs-token.png",
    verified: true,
    chainId: 5042002
  }
];

// To add more chains: create token arrays for each chain and add them to tokensByChainId
const tokensByChainId: Record<number, Token[]> = {
  5042002: arcTestnetTokens,
  // Add more chains here, e.g.:
  // 1: mainnetTokens,
  // 137: polygonTokens,
};

export const defaultTokens: Token[] = Object.values(tokensByChainId).flat();

export function getTokensByChainId(chainId: number): Token[] {
  return tokensByChainId[chainId] || [];
}
