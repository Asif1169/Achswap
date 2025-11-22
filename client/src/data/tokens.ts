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
    address: "0xE484A40C1C7D56012cFa700Ec2E93e5cf0dd29AC",
    name: "Wrapped USDC",
    symbol: "wUSDC",
    decimals: 6,
    logoURI: "/img/logos/wusdc.png",
    verified: true,
  },
  {
    address: "0x5e4B41F57364177820458F26c96D732585573f89",
    name: "Achswap Token",
    symbol: "ACHS",
    decimals: 18,
    logoURI: "/img/achs.png",
    verified: true
  }
];