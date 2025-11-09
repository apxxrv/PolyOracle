// Database types matching Supabase schema

export interface Market {
  id: string;
  question: string;
  description: string | null;
  current_price: number | null;
  volume: number | null;
  liquidity: number | null;
  end_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Signal {
  id: string;
  market_id: string;
  score: number;
  action: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  entry_price: number | null;
  target_price: number | null;
  reasoning: SignalReasoning;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  whale_count: number;
  news_count: number;
  reddit_count: number;
  created_at: string;
}

export interface SignalReasoning {
  summary: string;
  whale_analysis?: string;
  news_analysis?: string;
  reddit_analysis?: string;
  risk_factors?: string[];
  key_insights?: string[];
  expected_return?: string;
  time_horizon?: string;
}

export interface WhaleTrade {
  id: string;
  market_id: string;
  asset_id: string | null;
  side: string | null;
  size: number | null;
  price: number | null;
  size_usd: number;
  timestamp: string;
}

export interface RedditPost {
  id: string;
  market_id: string;
  post_id: string;
  title: string;
  content: string | null;
  author: string | null;
  subreddit: string | null;
  score: number;
  upvote_ratio: number | null;
  num_comments: number;
  url: string | null;
  created_at: string;
}

export interface SignalDetail extends Signal {
  market_question: string;
  market_current_price: number | null;
  market_end_date: string | null;
  actual_whale_count: number;
  actual_reddit_count: number;
}

// Insert types (for creating new records)
export type MarketInsert = Omit<Market, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type SignalInsert = Omit<Signal, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type WhaleTradeInsert = Omit<WhaleTrade, 'id' | 'timestamp'> & {
  id?: string;
  timestamp?: string;
};

export type RedditPostInsert = Omit<RedditPost, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};
