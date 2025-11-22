import { formatUnits, parseUnits } from "ethers";

/**
 * Format a numeric value to a fixed decimal display string
 * Handles very large and very small numbers gracefully
 */
export function formatAmount(value: string | number | bigint, decimals: number): string {
  try {
    if (typeof value === "bigint") {
      const formatted = formatUnits(value, decimals);
      const num = parseFloat(formatted);
      if (!isNaN(num) && isFinite(num)) {
        // For display, show up to 6 decimal places but remove trailing zeros
        return num === 0 ? "0" : parseFloat(num.toFixed(6)).toString();
      }
      return "0";
    }
    
    const num = parseFloat(String(value));
    if (!isNaN(num) && isFinite(num)) {
      return num === 0 ? "0" : parseFloat(num.toFixed(6)).toString();
    }
    return "0";
  } catch (error) {
    console.error("Error formatting amount:", error);
    return "0";
  }
}

/**
 * Parse a user input amount string to BigInt with proper decimal handling
 */
export function parseAmount(value: string | number, decimals: number): bigint {
  try {
    if (!value || value === "" || value === "0") {
      return 0n;
    }

    const str = String(value).trim();
    if (!/^[0-9]*\.?[0-9]*$/.test(str)) {
      return 0n;
    }

    // parseUnits handles the conversion properly
    return parseUnits(str, decimals);
  } catch (error) {
    console.error("Error parsing amount:", error, { value, decimals });
    return 0n;
  }
}

/**
 * Convert between different decimal places
 * Use when you need to adjust a value from one token's decimals to another's
 */
export function convertDecimals(
  value: bigint,
  fromDecimals: number,
  toDecimals: number
): bigint {
  if (fromDecimals === toDecimals) return value;
  
  if (fromDecimals < toDecimals) {
    const diff = toDecimals - fromDecimals;
    return value * (10n ** BigInt(diff));
  } else {
    const diff = fromDecimals - toDecimals;
    return value / (10n ** BigInt(diff));
  }
}

/**
 * Safe division with proper rounding
 */
export function safeDivide(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) return 0n;
  return numerator / denominator;
}

/**
 * Calculate ratio between two amounts with their decimals
 * Returns the ratio as a formatted string
 */
export function calculateRatio(
  amount1: bigint,
  decimals1: number,
  amount2: bigint,
  decimals2: number
): string {
  try {
    if (amount1 === 0n || amount2 === 0n) return "0";

    // Convert to same decimal places for comparison
    let ratio: number;
    if (decimals1 === decimals2) {
      ratio = Number(amount1) / Number(amount2);
    } else {
      const formatted1 = parseFloat(formatUnits(amount1, decimals1));
      const formatted2 = parseFloat(formatUnits(amount2, decimals2));
      ratio = formatted1 / formatted2;
    }

    if (!isNaN(ratio) && isFinite(ratio)) {
      return parseFloat(ratio.toFixed(6)).toString();
    }
    return "0";
  } catch (error) {
    console.error("Error calculating ratio:", error);
    return "0";
  }
}
