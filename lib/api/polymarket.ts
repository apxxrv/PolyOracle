import axios from 'axios';

// Types
export interface Market {
  condition_id: string;
  question: string;
  description?: string;
  end_date_iso?: string;
  volume?: number;
  liquidity?: number;
  active?: boolean;
}

export interface Trade {
  id: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  timestamp: number;
  trader_address?: string;
}

export interface WhaleTrade extends Trade {
  size_usd: number;
}

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';

/**
 * Fetch active markets from Polymarket
 */
export async function getActiveMarkets(): Promise<Market[]> {
  const response = await axios.get(`${GAMMA_API}/markets`, {
    params: { limit: 50, active: true }
  });
  return response.data;
}

/**
 * Fetch recent trades for a specific market
 */
export async function getMarketTrades(marketId: string): Promise<Trade[]> {
  const response = await axios.get(`${GAMMA_API}/events`, {
    params: { 
      id: marketId,
      _limit: 100
    }
  });
  
  // Gamma API returns events, extract trades if available
  const events = response.data;
  if (!events || events.length === 0) return [];
  
  // For now, return empty array as Gamma API doesn't expose raw trades publicly
  // In production, you'd use authenticated CLOB API or websocket
  return [];
}

/**
 * Detect whale trades (>$10K) in a market
 * For hackathon: Uses volume as proxy for whale activity
 */
export async function detectWhaleTrades(marketId: string): Promise<WhaleTrade[]> {
  // For hackathon, we'll use volume as a proxy
  // In production, you'd use authenticated CLOB API or websocket
  const markets = await getActiveMarkets();
  const market = markets.find(m => m.condition_id === marketId);
  
  if (!market || !market.volume) return [];
  
  // If volume > $100K, simulate whale activity
  const volume = parseFloat(market.volume.toString());
  if (volume < 100000) return [];
  
  // Simulate a whale trade
  const simulatedTrade: WhaleTrade = {
    id: `whale_${Date.now()}`,
    market: marketId,
    asset_id: 'simulated',
    side: 'BUY',
    size: '15000',
    price: '0.65',
    timestamp: Date.now(),
    size_usd: 9750
  };
  
  return [simulatedTrade];
}
