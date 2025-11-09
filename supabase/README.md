# Supabase Database Setup

## Quick Setup

1. **Go to Supabase SQL Editor**
   - Visit: https://mvftgorbwdvmbsjcbcqe.supabase.co
   - Navigate to SQL Editor

2. **Run the Schema**
   - Copy the contents of `schema.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify Tables Created**
   - Go to Table Editor
   - You should see: `markets`, `signals`, `whale_trades`, `reddit_posts`

## Database Structure

### Tables

**markets**
- Stores Polymarket prediction markets
- Primary key: `id` (text)
- Tracks: title, price, volume, end date

**signals**
- AI-generated trading signals
- Primary key: `id` (UUID)
- Foreign key: `market_id` → markets
- Includes: score (0-100), action, reasoning, confidence

**whale_trades**
- Large trades >$10K
- Primary key: `id` (UUID)
- Foreign key: `market_id` → markets
- Tracks: wallet, size, price, timestamp

**reddit_posts**
- Reddit sentiment data
- Primary key: `id` (UUID)
- Foreign key: `signal_id` → signals
- Tracks: post details, sentiment score, upvotes

### Views

**signal_details**
- Combines signals with market info and counts
- Used for dashboard queries
- Automatically joins markets, whale_trades, reddit_posts

## Security

- **RLS Enabled**: All tables have Row Level Security
- **Public Read**: Anyone can read data
- **Service Role Write**: Only backend can write
- Your `.env.local` has the service role key for write operations

## Next Steps

After running the schema:
1. ✅ Database is ready
2. ✅ TypeScript types match schema
3. ✅ Query functions are set up
4. 🚀 Ready to start building API integrations!
