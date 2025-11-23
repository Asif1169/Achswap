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

// Stable Testnet tokens (Chain ID: 2201)
const stableTestnetTokens: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    name: "gUSDT",
    symbol: "gUSDT",
    decimals: 18,
    logoURI: "/img/logos/gusdt.png",
    verified: true,
    chainId: 2201
  },
  {
    address: "0x1ddEaa3Ead136a70D6D52c99cFd9e336babcCaC1",
    name: "Wrapped USDT",
    symbol: "wUSDT",
    decimals: 18,
    logoURI: "/img/logos/wusdt.png",
    verified: true,
    chainId: 2201
  },
  {
    address: "0x8e9FCc09060286583c39D7b1fA42b3EA04E83BaC",
    name: "Achswap Token",
    symbol: "ACHS",
    decimals: 18,
    logoURI: "/img/logos/achs-token.png",
    verified: true,
    chainId: 2201
  }
];

export const defaultTokens: Token[] = [...arcTestnetTokens, ...stableTestnetTokens];

export function getTokensByChainId(chainId: number): Token[] {
  return defaultTokens.filter(token => token.chainId === chainId);
}
