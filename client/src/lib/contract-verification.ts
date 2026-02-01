import { BrowserProvider } from "ethers";

/**
 * Check if contract exists at address
 */
export async function contractExists(provider: BrowserProvider, address: string): Promise<boolean> {
  try {
    const code = await provider.getCode(address);
    return code !== "0x";
  } catch (error) {
    return false;
  }
}

/**
 * Verify all V3 contracts exist
 */
export async function verifyV3Contracts(
  provider: BrowserProvider,
  contracts: {
    factory: string;
    swapRouter: string;
    nonfungiblePositionManager: string;
    quoter02: string;
    migrator: string;
  }
): Promise<{ exists: boolean; missing: string[] }> {
  const checks = await Promise.all([
    contractExists(provider, contracts.factory),
    contractExists(provider, contracts.swapRouter),
    contractExists(provider, contracts.nonfungiblePositionManager),
    contractExists(provider, contracts.quoter02),
    contractExists(provider, contracts.migrator),
  ]);

  const contractNames = ["factory", "swapRouter", "nonfungiblePositionManager", "quoter02", "migrator"];
  const missing = contractNames.filter((_, index) => !checks[index]);

  return {
    exists: missing.length === 0,
    missing,
  };
}
