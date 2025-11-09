# Database Schema Migration Instructions

## What Happened

While building Phase 6 (Cron Job), we discovered that the database schema needed to be updated to match what our code requires.

## What You Need To Do

### Run the Migration in Supabase

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file: `supabase/migration-update-schema.sql`
4. Copy all the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the migration

This migration will:
- Rename `markets.title` → `markets.question`
- Rename `markets.volume_24h` → `markets.volume`
- Add new columns: `description`, `liquidity`, `active`, `updated_at` to markets table
- Update `whale_trades` table to include `asset_id`, `side`, `size` columns
- Update `reddit_posts` table to include `market_id`, `content`, `author`, `score`, `num_comments`, `url` columns
- Recreate the `signal_details` view with updated column names

### After Running Migration

Once the migration is complete, run:

```bash
npm run test:cron
```

This will test the full cron job pipeline:
1. Fetch active markets from Polymarket
2. Analyze whale trades, news, and Reddit sentiment
3. Generate signals using Claude AI
4. Store signals in database (only scores >= 70)

## Files Updated

- ✅ `supabase/schema.sql` - Complete schema with all columns
- ✅ `supabase/migration-update-schema.sql` - Migration script (RUN THIS!)
- ✅ `types/database.ts` - TypeScript types updated
- ✅ `lib/db/client.ts` - Fixed lazy loading of environment variables
- ✅ `lib/engine/signal-generator.ts` - Signal generation engine
- ✅ `app/api/cron/route.ts` - Cron API endpoint
- ✅ `scripts/test-cron.ts` - Test script for cron job

## What Happens After Migration

The cron job will:
- Run every 5 minutes (configured in `vercel.json`)
- Fetch top 10 markets with volume > $50K
- Generate signals and store only strong signals (score >= 70)
- Each signal includes whale trades, news articles, and Reddit sentiment

## Next Phase

After successful migration and testing, we proceed to:
**Phase 7: Dashboard UI** - Build the frontend to display signals in real-time
