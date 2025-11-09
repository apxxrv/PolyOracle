import axios from 'axios';
import type { PolymarketMarket, PolymarketTrade } from '@/types/api';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

/**
 * Fetch active prediction markets from Polymarket
 */
export async function getActiveMarkets(limit: number = 50): Promise<PolymarketMarket[]> {
  try {
    const response = await axios.get(`${GAMMA_API_BASE}/markets`, {
      params: {
        limit,
        active: true,
        closed: false,
        archived: false
      }
    });

    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching Polymarket markets:', error.message);
    throw new Error(`Failed to fetch markets: ${error.message}`);
  }
}

/**
 * Fetch trades for a specific market
 * Note: CLOB API requires auth, Subgraph deprecated
 * For hackathon: simulate based on market activity
 */
export async function getMarketTrades(
  marketId: string,
  limit: number = 100
): Promise<PolymarketTrade[]> {
  // For hackathon: return empty array
  // In production: use authenticated CLOB API or on-chain data
  return [];
}

/**
 * Detect whale trades using hybrid approach:
 * - Volume-based estimates (no CLOB API needed)
 * - Clearly labeled as estimates
 */
export async function detectWhaleTrades(marketId: string): Promise<PolymarketTrade[]> {
  const mode = process.env.WHALE_DETECTION_MODE || 'hybrid';
  
  if (mode === 'hybrid') {
    return estimateWhaleTradesFromVolume(marketId);
  }
  
  return [];
}

/**
 * Estimate whale trades based on market volume
 * Logic: Higher volume = more whale activity
 */
async function estimateWhaleTradesFromVolume(marketId: string): Promise<PolymarketTrade[]> {
  const market = await getMarket(marketId);
  if (!market) return [];
  
  const volume = parseFloat(market.volume || '0');
  const currentPrice = parseFloat(market.outcomePrices?.[0] || '0.5');
  
  // Volume-based whale estimation
  let whaleCount = 0;
  let avgWhaleSize = 0;
  
  if (volume >= 5000000) {
    whaleCount = 4;
    avgWhaleSize = 50000;
  } else if (volume >= 1000000) {
    whaleCount = 3;
    avgWhaleSize = 30000;
  } else if (volume >= 500000) {
    whaleCount = 2;
    avgWhaleSize = 20000;
  } else if (volume >= 100000) {
    whaleCount = 1;
    avgWhaleSize = 15000;
  }
  
  // Generate estimated whale trades
  const estimatedTrades: PolymarketTrade[] = [];
  for (let i = 0; i < whaleCount; i++) {
    estimatedTrades.push({
      id: `estimated_${marketId}_${i}`,
      market: marketId,
      asset_id: market.tokens?.[0]?.token_id || marketId,
      side: i % 2 === 0 ? 'BUY' : 'SELL',
      size: (avgWhaleSize / currentPrice).toString(),
      price: currentPrice.toString(),
      timestamp: new Date().toISOString(),
      maker_address: 'estimated',
      type: 'estimated'
    });
  }
  
  return estimatedTrades;
}

/**
 * Get market by ID (condition_id or market_slug)
 */
export async function getMarket(marketId: string): Promise<PolymarketMarket | null> {
  try {
    const markets = await getActiveMarkets(100);
    return markets.find(m => 
      m.condition_id === marketId || 
      m.market_slug === marketId ||
      (m as any).id === marketId
    ) || null;
  } catch (error: any) {
    console.error(`Error fetching market ${marketId}:`, error.message);
    return null;
  }
}

/**
 * Calculate total whale volume for a market
 */
export async function getWhaleVolume(marketId: string): Promise<number> {
  const whaleTrades = await detectWhaleTrades(marketId);

  return whaleTrades.reduce((total, trade) => {
    const tradeSize = parseFloat(trade.size);
    const tradePrice = parseFloat(trade.price);
    return total + (tradeSize * tradePrice);
  }, 0);
}
