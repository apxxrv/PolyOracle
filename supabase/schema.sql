-- PolyOracle Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS reddit_posts CASCADE;
DROP TABLE IF EXISTS whale_trades CASCADE;
DROP TABLE IF EXISTS signals CASCADE;
DROP TABLE IF EXISTS markets CASCADE;

-- 1. Markets Table
CREATE TABLE markets (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    description TEXT,
    current_price DECIMAL(5,2),
    volume DECIMAL(15,2),
    liquidity DECIMAL(15,2),
    end_date TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Signals Table
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id TEXT REFERENCES markets(id) ON DELETE CASCADE,
    score INTEGER CHECK(score >= 0 AND score <= 100) NOT NULL,
    action TEXT NOT NULL,
    entry_price DECIMAL(5,2),
    target_price DECIMAL(5,2),
    reasoning JSONB,
    confidence TEXT,
    urgency TEXT,
    whale_count INTEGER DEFAULT 0,
    news_count INTEGER DEFAULT 0,
    reddit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Whale Trades Table
CREATE TABLE whale_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id TEXT REFERENCES markets(id) ON DELETE CASCADE,
    asset_id TEXT,
    side TEXT,
    size DECIMAL(15,2),
    price DECIMAL(5,2),
    size_usd DECIMAL(15,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 4. Reddit Posts Table
CREATE TABLE reddit_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id TEXT REFERENCES markets(id) ON DELETE CASCADE,
    post_id TEXT UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT,
    subreddit TEXT,
    score INTEGER DEFAULT 0,
    upvote_ratio DECIMAL(5,2),
    num_comments INTEGER DEFAULT 0,
    url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_signals_score ON signals(score DESC);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX idx_signals_market_id ON signals(market_id);
CREATE INDEX idx_whale_trades_market_id ON whale_trades(market_id);
CREATE INDEX idx_whale_trades_timestamp ON whale_trades(timestamp DESC);
CREATE INDEX idx_reddit_posts_market_id ON reddit_posts(market_id);

-- Enable Row Level Security (RLS)
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access
CREATE POLICY "Allow public read access on markets"
    ON markets FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on signals"
    ON signals FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on whale_trades"
    ON whale_trades FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on reddit_posts"
    ON reddit_posts FOR SELECT
    USING (true);

-- RLS Policies: Allow service role full access
CREATE POLICY "Allow service role full access on markets"
    ON markets FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on signals"
    ON signals FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on whale_trades"
    ON whale_trades FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on reddit_posts"
    ON reddit_posts FOR ALL
    USING (auth.role() = 'service_role');

-- Create a view for dashboard queries (optional, for performance)
CREATE OR REPLACE VIEW signal_details AS
SELECT
    s.*,
    m.question as market_question,
    m.current_price as market_current_price,
    m.end_date as market_end_date,
    COUNT(DISTINCT wt.id) as actual_whale_count,
    COUNT(DISTINCT rp.id) as actual_reddit_count
FROM signals s
LEFT JOIN markets m ON s.market_id = m.id
LEFT JOIN whale_trades wt ON s.market_id = wt.market_id
    AND wt.timestamp >= s.created_at - INTERVAL '24 hours'
LEFT JOIN reddit_posts rp ON rp.market_id = s.market_id
GROUP BY s.id, m.id;

-- Grant access to the view
GRANT SELECT ON signal_details TO anon, authenticated;

COMMENT ON TABLE markets IS 'Polymarket prediction markets';
COMMENT ON TABLE signals IS 'AI-generated trading signals with scores and reasoning';
COMMENT ON TABLE whale_trades IS 'Large trades (>$10K) detected on markets';
COMMENT ON TABLE reddit_posts IS 'Reddit posts related to signals for sentiment analysis';
