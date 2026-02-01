export interface V2Contracts {
  factory: string;
  router: string;
}

export interface V3Contracts {
  factory: string;
  swapRouter: string;
  nonfungiblePositionManager: string;
  quoter02: string;
  migrator: string;
  positionDescriptor: string;
}

export interface ChainContracts {
  v2: V2Contracts;
  v3: V3Contracts;
  explorer: string;
}

export const contractsByChainId: Record<number, ChainContracts> = {
  5042002: {
    v2: {
      factory: "0x7cC023C7184810B84657D55c1943eBfF8603B72B",
      router: "0xB92428D440c335546b69138F7fAF689F5ba8D436",
    },
    v3: {
      factory: "0x462fa7f99218a8530D0506A63eB3fA9613d9D1b2",
      swapRouter: "0xC88baEb6673d0baEAF7F255316AaDEa717AC7f76",
      nonfungiblePositionManager: "0x8128818F047c33EDfb3c02ceaefcd4637B233a8C",
      quoter02: "0xB61f0fB50Af89e201fA7821Da5fC88C11a471E81",
      migrator: "0xd4fb625A887131d07dea1221338F94F9843ADc7c",
      positionDescriptor: "0xd4eE8C842225845294B66e540E1DAc05D8177ae2",
    },
    explorer: "https://testnet.arcscan.app/tx/"
  },
  // Add more chains here with their V2 and V3 contracts
};

export function getContractsForChain(chainId: number): ChainContracts {
  const contracts = contractsByChainId[chainId];
  if (!contracts) {
    throw new Error(`No contracts configured for chain ID ${chainId}`);
  }
  return contracts;
}
