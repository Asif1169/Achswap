import { formatUnits, parseUnits } from "ethers";

/**
 * Format a numeric value to a fixed decimal display string
 * Handles very large and very small numbers gracefully
 */
export function formatAmount(value: string | number | bigint, decimals: number): string {
  try {
    if (value === undefined || value === null) {
      return "0";
    }

    if (typeof value === "bigint") {
      if (value === 0n) return "0";
      const formatted = formatUnits(value, decimals);
      const num = parseFloat(formatted);
      if (!isNaN(num) && isFinite(num)) {
        // For very small numbers, use scientific notation
        if (num > 0 && num < 0.000001) {
          return num.toExponential(2);
        }
        // For display, show up to 6 decimal places but remove trailing zeros
        return parseFloat(num.toFixed(6)).toString();
      }
      return "0";
    }
    
    const num = parseFloat(String(value));
    if (!isNaN(num) && isFinite(num)) {
      if (num === 0) return "0";
      // For very small numbers, use scientific notation
      if (num > 0 && num < 0.000001) {
        return num.toExponential(2);
      }
      return parseFloat(num.toFixed(6)).toString();
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
    if (!value || value === "" || value === "0" || value === ".") {
      return 0n;
    }

    const str = String(value).trim();
    
    // Validate input format
    if (!/^[0-9]*\.?[0-9]*$/.test(str)) {
      console.warn("Invalid amount format:", str);
      return 0n;
    }

    // Handle edge case of just a decimal point
    if (str === ".") {
      return 0n;
    }

    // Ensure decimals is valid
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 77) {
      console.error("Invalid decimals value:", decimals);
      return 0n;
    }

    // parseUnits handles the conversion properly
    const result = parseUnits(str, decimals);
    return result;
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
