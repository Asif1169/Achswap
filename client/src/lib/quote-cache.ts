import type { SmartRoutingResult } from "./smart-routing";

interface CachedQuote {
  result: SmartRoutingResult;
  timestamp: number;
}

const quoteCache = new Map<string, CachedQuote>();
const CACHE_DURATION = 10000; // 10 seconds

/**
 * Generate cache key from swap parameters
 */
function getCacheKey(
  fromTokenAddress: string,
  toTokenAddress: string,
  amountIn: string,
  v2Enabled: boolean,
  v3Enabled: boolean
): string {
  return `${fromTokenAddress}-${toTokenAddress}-${amountIn}-${v2Enabled}-${v3Enabled}`;
}

/**
 * Get cached quote if available and fresh
 */
export function getCachedQuote(
  fromTokenAddress: string,
  toTokenAddress: string,
  amountIn: string,
  v2Enabled: boolean,
  v3Enabled: boolean
): SmartRoutingResult | null {
  const key = getCacheKey(fromTokenAddress, toTokenAddress, amountIn, v2Enabled, v3Enabled);
  const cached = quoteCache.get(key);
  
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    quoteCache.delete(key);
    return null;
  }
  
  return cached.result;
}

/**
 * Store quote in cache
 */
export function setCachedQuote(
  fromTokenAddress: string,
  toTokenAddress: string,
  amountIn: string,
  v2Enabled: boolean,
  v3Enabled: boolean,
  result: SmartRoutingResult
): void {
  const key = getCacheKey(fromTokenAddress, toTokenAddress, amountIn, v2Enabled, v3Enabled);
  quoteCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cached quotes
 */
export function clearQuoteCache(): void {
  quoteCache.clear();
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, cached] of quoteCache.entries()) {
    if (now - cached.timestamp > CACHE_DURATION) {
      quoteCache.delete(key);
    }
  }
}

// Run cleanup every 30 seconds
setInterval(cleanupExpiredCache, 30000);
