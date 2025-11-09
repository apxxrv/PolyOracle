# PolyOracle - Setup Guide

AI-powered real-time intelligence platform for Polymarket prediction markets.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Then fill in your API keys in `.env.local`:
- **ANTHROPIC_API_KEY**: Get from https://console.anthropic.com/
- **POLYMARKET_API_KEY**: Get from Polymarket
- **X_BEARER_TOKEN**: Get from https://developer.twitter.com/
- **NEWS_API_KEY**: Get from https://newsapi.org/
- **Supabase keys**: Get from https://supabase.com/dashboard

### 3. Set Up Supabase Database

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
  api/cron/          # Cron job endpoint (runs every 5 mins)
  dashboard/         # Main dashboard page
  signal/[id]/       # Individual signal detail page
components/
  ui/                # Reusable UI components
  dashboard/         # Dashboard-specific components
lib/
  api/               # API clients (Polymarket, X, NewsAPI)
  ai/                # Claude AI integration
  db/                # Supabase client & queries
supabase/            # Database schema
types/               # TypeScript interfaces
```

## 🎯 Phase-by-Phase Build Plan

### Phase 1: Setup ✅
- [x] Next.js project initialization
- [x] Folder structure
- [x] Dependencies installed

### Phase 2: Database & Types (NEXT)
- [ ] Create Supabase schema
- [ ] Define TypeScript interfaces
- [ ] Set up Supabase client

### Phase 3: API Integrations
- [ ] Polymarket API client
- [ ] X (Twitter) API client
- [ ] NewsAPI client
- [ ] Test API connections

### Phase 4: AI Analysis
- [ ] Claude integration
- [ ] Signal scoring logic
- [ ] Data synthesis

### Phase 5: Cron Job
- [ ] Create cron endpoint
- [ ] Implement whale detection
- [ ] Store signals in database

### Phase 6: Dashboard
- [ ] Signal list view
- [ ] Signal detail page
- [ ] Real-time updates

### Phase 7: Deploy
- [ ] Deploy to Vercel
- [ ] Configure cron job
- [ ] Test production

## 🔑 Key Features

- **Whale Detection**: Monitors trades >$10K
- **Sentiment Analysis**: Analyzes X (Twitter) for market sentiment
- **News Integration**: Fetches relevant news articles
- **AI Synthesis**: Claude generates Signal Scores (0-100)
- **Real-time Dashboard**: Live updates via Supabase Realtime
- **Automated Monitoring**: Cron job runs every 5 minutes

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: Claude Sonnet 3.5
- **APIs**: Polymarket, X (Twitter), NewsAPI
- **Deployment**: Vercel

## 📝 Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```
