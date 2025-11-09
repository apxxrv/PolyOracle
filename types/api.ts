// API response types for external services

// Polymarket API types
export interface PolymarketMarket {
  condition_id: string;
  question: string;
  market_slug: string;
  end_date_iso: string;
  game_start_time: string;
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  // Add more fields as needed
}

export interface PolymarketTrade {
  id: string;
  market: string;
  asset_id: string;
  maker_address: string;
  taker_address: string;
  size: string;
  price: string;
  side: 'BUY' | 'SELL';
  timestamp: string;
}

// NewsAPI types
export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

// Reddit API types
export interface RedditPostData {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  created_utc: number;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  permalink: string;
  url: string;
}

export interface RedditPost {
  kind: string;
  data: RedditPostData;
}

export interface RedditResponse {
  kind: string;
  data: {
    children: RedditPost[];
    after: string | null;
    before: string | null;
  };
}

// Claude AI types
export interface ClaudeAnalysisRequest {
  marketData: PolymarketMarket;
  whaleTrades: PolymarketTrade[];
  newsArticles: NewsArticle[];
  redditPosts: RedditPostData[];
}

export interface ClaudeAnalysisResponse {
  score: number;
  action: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasoning: {
    summary: string;
    whale_analysis?: string;
    news_analysis?: string;
    reddit_analysis?: string;
    risk_factors?: string[];
    key_insights?: string[];
    expected_return?: string;
    time_horizon?: string;
  };
  entry_price?: number;
  target_price?: number;
}
