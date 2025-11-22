import { Token } from "@shared/schema";

export const defaultTokens: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
    logoURI: "/img/usdc.webp",
    verified: true
  },
  {
    address: "0x1ddEaa3Ead136a70D6D52c99cFd9e336babcCaC1",
    name: "Wrapped USDC",
    symbol: "wUSDC",
    decimals: 6,
    logoURI: "/img/logos/wusdc.png",
    verified: true,
  },
  {
    address: "0x45Bb5425f293bdd209c894364C462421FF5FfA48",
    name: "Achswap Token",
    symbol: "ACHS",
    decimals: 18,
    logoURI: "/img/achs.png",
    verified: true
  }
];