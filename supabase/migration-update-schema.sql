-- Migration: Update schema to match code requirements
-- Run this in Supabase SQL Editor to update existing tables

-- Update markets table
ALTER TABLE markets
  RENAME COLUMN title TO question;

ALTER TABLE markets
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS liquidity DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE markets
  RENAME COLUMN volume_24h TO volume;

-- Update whale_trades table
ALTER TABLE whale_trades
  DROP COLUMN IF EXISTS wallet_address,
  ADD COLUMN IF NOT EXISTS asset_id TEXT,
  ADD COLUMN IF NOT EXISTS side TEXT,
  ADD COLUMN IF NOT EXISTS size DECIMAL(15,2);

-- Update reddit_posts table
-- First, drop the foreign key constraint to signal_id
ALTER TABLE reddit_posts
  DROP CONSTRAINT IF EXISTS reddit_posts_signal_id_fkey;

-- Remove signal_id and add market_id
ALTER TABLE reddit_posts
  DROP COLUMN IF EXISTS signal_id,
  ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES markets(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS num_comments INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS url TEXT;

-- Rename sentiment_score to upvote_ratio if needed
ALTER TABLE reddit_posts
  DROP COLUMN IF EXISTS sentiment_score;

-- Update the view
DROP VIEW IF EXISTS signal_details;

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
