import { supabase, supabaseAdmin } from './client';
import type {
  Market,
  Signal,
  WhaleTrade,
  RedditPost,
  MarketInsert,
  SignalInsert,
  WhaleTradeInsert,
  RedditPostInsert,
  SignalDetail
} from '@/types/database';

// ============================================
// MARKETS
// ============================================

export async function getMarket(marketId: string): Promise<Market | null> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertMarket(market: MarketInsert): Promise<Market> {
  const { data, error } = await supabaseAdmin
    .from('markets')
    .upsert(market)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// SIGNALS
// ============================================

export async function getSignals(limit: number = 20): Promise<SignalDetail[]> {
  const { data, error } = await supabase
    .from('signal_details')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getSignal(signalId: string): Promise<SignalDetail | null> {
  const { data, error } = await supabase
    .from('signal_details')
    .select('*')
    .eq('id', signalId)
    .single();

  if (error) throw error;
  return data;
}

export async function createSignal(signal: SignalInsert): Promise<Signal> {
  const { data, error } = await supabaseAdmin
    .from('signals')
    .insert(signal)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getHighScoreSignals(minScore: number = 70): Promise<SignalDetail[]> {
  const { data, error } = await supabase
    .from('signal_details')
    .select('*')
    .gte('score', minScore)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

// ============================================
// WHALE TRADES
// ============================================

export async function getWhaleTrades(marketId: string): Promise<WhaleTrade[]> {
  const { data, error } = await supabase
    .from('whale_trades')
    .select('*')
    .eq('market_id', marketId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWhaleTrade(trade: WhaleTradeInsert): Promise<WhaleTrade> {
  const { data, error } = await supabaseAdmin
    .from('whale_trades')
    .insert(trade)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bulkCreateWhaleTrades(trades: WhaleTradeInsert[]): Promise<WhaleTrade[]> {
  const { data, error } = await supabaseAdmin
    .from('whale_trades')
    .insert(trades)
    .select();

  if (error) throw error;
  return data || [];
}

// ============================================
// REDDIT POSTS
// ============================================

export async function getRedditPosts(signalId: string): Promise<RedditPost[]> {
  const { data, error } = await supabase
    .from('reddit_posts')
    .select('*')
    .eq('signal_id', signalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createRedditPost(post: RedditPostInsert): Promise<RedditPost> {
  const { data, error } = await supabaseAdmin
    .from('reddit_posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bulkCreateRedditPosts(posts: RedditPostInsert[]): Promise<RedditPost[]> {
  const { data, error } = await supabaseAdmin
    .from('reddit_posts')
    .insert(posts)
    .select();

  if (error) throw error;
  return data || [];
}

// ============================================
// ANALYTICS
// ============================================

export async function getSignalStats() {
  const { data, error } = await supabase
    .from('signals')
    .select('score, action, confidence, created_at');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    highScore: data?.filter(s => s.score >= 70).length || 0,
    avgScore: data?.length ? data.reduce((sum, s) => sum + s.score, 0) / data.length : 0,
    byAction: {
      BUY: data?.filter(s => s.action === 'BUY').length || 0,
      SELL: data?.filter(s => s.action === 'SELL').length || 0,
      HOLD: data?.filter(s => s.action === 'HOLD').length || 0,
      WATCH: data?.filter(s => s.action === 'WATCH').length || 0,
    },
    byConfidence: {
      LOW: data?.filter(s => s.confidence === 'LOW').length || 0,
      MEDIUM: data?.filter(s => s.confidence === 'MEDIUM').length || 0,
      HIGH: data?.filter(s => s.confidence === 'HIGH').length || 0,
    }
  };

  return stats;
}
