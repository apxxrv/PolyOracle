# 🚀 POLYMARKET SIGNAL - EXECUTION GUIDE

## ⚡ Quick Start (First 30 Minutes)

### Step 1: Verify APIs (EVERYONE - 15 mins)

```bash
# 1. Create test folder
mkdir polymarket-api-test
cd polymarket-api-test

# 2. Initialize
npm init -y
npm install axios dotenv @anthropic-ai/sdk

# 3. Copy the verification script
# (Copy api-verification.js from the artifacts)

# 4. Create .env file
# Copy .env.example and fill in:
ANTHROPIC_API_KEY=sk-ant-...    # REQUIRED
NEWS_API_KEY=...                # RECOMMENDED
# Skip Twitter and Twilio for now

# 5. Run verification
node api-verification.js
```

**Expected output:**
```
✅ Polymarket Markets API working!
✅ Polymarket Trades API working!
✅ Claude API working!
✅ NewsAPI working!
⚠️  Twitter API (optional, expensive)
⚠️  Twilio WhatsApp (optional)

🎉 ALL CRITICAL APIS WORKING!
```

### Step 2: Project Setup (PERSON 2 - 15 mins)

```bash
# 1. Run the setup script
chmod +x setup-project.sh
./setup-project.sh

# 2. Navigate to project
cd polymarket-signal

# 3. Copy environment variables
cp .env.example .env.local
# Fill in the same keys you tested earlier

# 4. Create GitHub repo
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 5. Share repo with team
# All: git clone YOUR_GITHUB_REPO_URL
# All: cd polymarket-signal
# All: npm install
```

---

## 🏗️ BUILD PHASES

### PHASE 1: Foundation (Hours 0-4)

#### 🎯 Milestone: "First Signal Detected"

**Success Criteria:**
- ✅ Supabase database created with tables
- ✅ Polymarket API returns markets
- ✅ Claude analyzes ONE market successfully
- ✅ Result saved to database

#### 👤 Person 1: Data Pipes (2 hours)

**Goal:** Get Polymarket data flowing

**File:** `lib/api/polymarket.ts`

```typescript
// Start simple - just get it working
export async function getActiveMarkets(limit = 10) {
  const response = await axios.get('https://gamma-api.polymarket.com/markets', {
    params: { limit, active: true }
  });
  return response.data;
}

export async function getMarketTrades(marketId: string) {
  const response = await axios.get('https://clob.polymarket.com/trades', {
    params: { market: marketId, limit: 100 }
  });
  return response.data;
}

// Test immediately:
// node --loader ts-node/esm lib/api/polymarket.ts
```

**Then:** `lib/api/news.ts` (simple version)

```typescript
export async function getRelatedNews(marketTitle: string) {
  const keywords = marketTitle.split(' ').slice(0, 3).join(' OR ');
  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: { q: keywords, pageSize: 5, apiKey: process.env.NEWS_API_KEY }
  });
  return response.data.articles || [];
}
```

#### 👤 Person 2: Database (2 hours)

**Goal:** Database ready to receive signals

**1. Create Supabase Project**
- Go to https://supabase.com
- Click "New Project"
- Name: `polymarket-signal`
- Choose region close to you
- Wait 2 minutes for setup

**2. Run SQL Schema**

Create file `supabase/schema.sql`:

```sql
-- Markets table
CREATE TABLE markets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  current_price DECIMAL(5,2),
  volume_24h DECIMAL(15,2),
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Signals table
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT REFERENCES markets(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  
  -- Recommendation
  action TEXT CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  entry_price DECIMAL(5,2),
  target_price DECIMAL(5,2),
  
  -- Analysis
  reasoning JSONB NOT NULL,
  confidence TEXT CHECK (confidence IN ('LOW', 'MEDIUM', 'HIGH')),
  urgency TEXT CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH')),
  
  -- Metadata
  whale_count INTEGER DEFAULT 0,
  news_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Whale trades table
CREATE TABLE whale_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT REFERENCES markets(id),
  wallet_address TEXT NOT NULL,
  size_usd DECIMAL(15,2),
  price DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_signals_score ON signals(score DESC);
CREATE INDEX idx_signals_created ON signals(created_at DESC);
CREATE INDEX idx_signals_market ON signals(market_id);

-- Enable Row Level Security (but allow all for now)
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON markets FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON signals FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON whale_trades FOR SELECT USING (true);
```

Copy this SQL → Supabase SQL Editor → Run

**3. Create Database Client**

File: `lib/db/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Server-side only
);

export async function saveSignal(signal: any) {
  const { data, error } = await supabase
    .from('signals')
    .insert(signal)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getRecentSignals(limit = 50) {
  const { data, error } = await supabase
    .from('signals')
    .select('*, markets(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
}
```

**4. Copy Credentials to .env.local**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

#### 👤 Person 3: Claude Brain (2 hours)

**Goal:** Claude can analyze ONE market

**File:** `lib/ai/claude.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function analyzeMarket(
  market: any,
  whaleTrades: any[],
  news: any[]
) {
  const prompt = `You are an expert Polymarket trader.

MARKET: ${market.question}
Current Price: ${market.outcomePrices[0]}¢
Volume: $${market.volume}

WHALE TRADES: ${whaleTrades.length} large trades detected
${whaleTrades.slice(0, 3).map(t => `- $${parseFloat(t.size) * parseFloat(t.price)} at ${t.price}¢`).join('\n')}

NEWS: ${news.length} related articles
${news.slice(0, 3).map(n => `- ${n.title}`).join('\n')}

Analyze this opportunity. Respond with JSON only:
{
  "signalScore": 0-100,
  "reasoning": {
    "whaleActivity": "analysis...",
    "newsAnalysis": "analysis...",
    "marketMispricing": "analysis..."
  },
  "recommendation": {
    "action": "BUY|SELL|HOLD",
    "entryPrice": 42,
    "targetPrice": 68
  },
  "confidence": "LOW|MEDIUM|HIGH",
  "urgency": "LOW|MEDIUM|HIGH"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch![0]);
}
```

**Test with mock data:**

```typescript
// Test file: scripts/test-claude.ts
const mockMarket = {
  question: "Will Bitcoin hit $150K by Dec 2025?",
  outcomePrices: ["42"],
  volume: "50000"
};

const mockTrades = [
  { size: "30000", price: "0.39" }
];

const mockNews = [
  { title: "BlackRock ETF sees $2B inflows" }
];

analyzeMarket(mockMarket, mockTrades, mockNews)
  .then(result => console.log(JSON.stringify(result, null, 2)));
```

#### 🤝 Integration (Hour 4)

**TOGETHER: Wire everything up**

File: `scripts/test-integration.ts`

```typescript
// 1. P1 gets market data
const markets = await getActiveMarkets(1);
const market = markets[0];
const trades = await getMarketTrades(market.condition_id);
const news = await getRelatedNews(market.question);

// 2. Filter whale trades
const whaleTrades = trades.filter(t => 
  parseFloat(t.size) * parseFloat(t.price) >= 10000
);

// 3. P3 analyzes
const analysis = await analyzeMarket(market, whaleTrades, news);
console.log('Signal Score:', analysis.signalScore);

// 4. P2 saves
if (analysis.signalScore >= 70) {
  await saveSignal({
    market_id: market.condition_id,
    score: analysis.signalScore,
    action: analysis.recommendation.action,
    entry_price: analysis.recommendation.entryPrice,
    target_price: analysis.recommendation.targetPrice,
    reasoning: analysis.reasoning,
    confidence: analysis.confidence,
    urgency: analysis.urgency,
    whale_count: whaleTrades.length,
    news_count: news.length
  });
  console.log('✅ Signal saved!');
}
```

Run: `npx tsx scripts/test-integration.ts`

**Expected:** One signal appears in Supabase dashboard!

✅ **PHASE 1 COMPLETE** - You have the core pipeline working!

---

### PHASE 2: Automation (Hours 4-8)

#### 🎯 Milestone: "Cron Job Running"

**Success Criteria:**
- ✅ Cron job scans markets every 5 minutes
- ✅ New signals automatically appear in database
- ✅ Dashboard shows signals

#### 👤 Person 1: Build Detector (2 hours)

**File:** `lib/engine/detector.ts`

```typescript
import { getActiveMarkets, getMarketTrades } from '../api/polymarket';
import { getRelatedNews } from '../api/news';
import { analyzeMarket } from '../ai/claude';
import { saveSignal, saveMarket } from '../db/client';

export async function detectSignals() {
  console.log('🔍 Scanning markets...');
  
  const markets = await getActiveMarkets(50);
  console.log(`Found ${markets.length} markets`);
  
  for (const market of markets) {
    // Skip low volume markets
    if (parseFloat(market.volume) < 10000) continue;
    
    // Get trades
    const trades = await getMarketTrades(market.condition_id);
    
    // Find whales
    const whaleTrades = trades.filter(t => 
      parseFloat(t.size) * parseFloat(t.price) >= 10000
    );
    
    // Skip if no whales
    if (whaleTrades.length === 0) continue;
    
    console.log(`🐋 Found ${whaleTrades.length} whales in: ${market.question}`);
    
    // Get news
    const news = await getRelatedNews(market.question);
    
    // Analyze
    const analysis = await analyzeMarket(market, whaleTrades, news);
    console.log(`📊 Score: ${analysis.signalScore}`);
    
    // Save if strong
    if (analysis.signalScore >= 70) {
      await saveMarket({
        id: market.condition_id,
        title: market.question,
        current_price: parseFloat(market.outcomePrices[0]),
        volume_24h: parseFloat(market.volume)
      });
      
      await saveSignal({
        market_id: market.condition_id,
        score: analysis.signalScore,
        action: analysis.recommendation.action,
        entry_price: analysis.recommendation.entryPrice,
        target_price: analysis.recommendation.targetPrice,
        reasoning: analysis.reasoning,
        confidence: analysis.confidence,
        urgency: analysis.urgency,
        whale_count: whaleTrades.length,
        news_count: news.length
      });
      
      console.log('✅ Signal saved!');
    }
  }
  
  console.log('✅ Scan complete');
}
```

**Then:** Create cron endpoint

File: `app/api/cron/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { detectSignals } from '@/lib/engine/detector';

export async function GET(request: NextRequest) {
  // Security: verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await detectSignals();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// For local testing
export async function POST() {
  await detectSignals();
  return NextResponse.json({ success: true });
}
```

**Test locally:**
```bash
curl -X POST http://localhost:3000/api/cron
```

#### 👤 Person 2: Dashboard UI (2 hours)

**File:** `app/dashboard/page.tsx`

```typescript
import { getRecentSignals } from '@/lib/db/client';
import { SignalCard } from '@/components/signal/SignalCard';

export const revalidate = 60; // Refresh every 60s

export default async function Dashboard() {
  const signals = await getRecentSignals(50);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">🎯 Polymarket Signal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}
```

**File:** `components/signal/SignalCard.tsx`

```typescript
interface SignalCardProps {
  signal: any;
}

export function SignalCard({ signal }: SignalCardProps) {
  const upside = (
    ((signal.target_price - signal.entry_price) / signal.entry_price) * 100
  ).toFixed(0);
  
  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
      {/* Score badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          signal.score >= 90 ? 'bg-purple-100 text-purple-700' :
          signal.score >= 80 ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {signal.score}/100
        </span>
        
        {signal.urgency === 'HIGH' && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            ⚡ URGENT
          </span>
        )}
      </div>
      
      {/* Market title */}
      <h3 className="font-semibold text-lg mb-3 line-clamp-2">
        {signal.markets.title}
      </h3>
      
      {/* Metrics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Current:</span>
          <span className="font-mono">{signal.entry_price}¢</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Target:</span>
          <span className="font-mono">{signal.target_price}¢</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Upside:</span>
          <span className="text-green-600 font-semibold">+{upside}%</span>
        </div>
      </div>
      
      {/* Whale indicator */}
      <div className="mt-4 text-sm text-gray-600">
        🐋 {signal.whale_count} whale trade{signal.whale_count !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
```

#### 👤 Person 3: Refine Prompt (2 hours)

**Improve the Claude prompt with better structure**

File: `lib/ai/prompts.ts`

```typescript
export function buildAnalysisPrompt(
  market: any,
  whaleTrades: any[],
  news: any[]
): string {
  return `You are an elite Polymarket trader with 85% win rate.

# MARKET DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${market.question}
Current Price: ${market.outcomePrices[0]}¢ (${market.outcomePrices[0]}% implied probability)
24h Volume: $${parseFloat(market.volume).toLocaleString()}
End Date: ${market.endDate}

# WHALE ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${whaleTrades.length > 0 ? formatWhaleTrades(whaleTrades) : 'No whale trades detected'}

# RECENT NEWS (Last 24h)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${news.length > 0 ? formatNews(news) : 'No recent news'}

# YOUR TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyze this trading opportunity. Score 0-100 based on:

1. Whale Activity (0-25 points): Are informed traders entering?
2. News Catalysts (0-30 points): Recent developments?
3. Technical Factors (0-20 points): Volume, liquidity, trends
4. Market Mispricing (0-25 points): Is price wrong vs fundamentals?

CRITICAL RULES:
- Be honest. Score <60 if it's not a good opportunity.
- Score 70+ ONLY if you'd risk real money.
- Flag manipulation (new wallets, coordinated timing).

Respond with ONLY valid JSON:
\`\`\`json
{
  "signalScore": 0-100,
  "reasoning": {
    "whaleActivity": "Detailed analysis...",
    "newsAnalysis": "How news impacts this...",
    "technicalFactors": "Volume trends, liquidity...",
    "marketMispricing": "Is price accurate? Your estimate vs market..."
  },
  "recommendation": {
    "action": "BUY|SELL|HOLD",
    "entryPrice": 42,
    "targetPrice": 68,
    "stopLoss": 35,
    "positionSizePct": 5,
    "timeHorizon": "2-4 weeks"
  },
  "confidence": "LOW|MEDIUM|HIGH",
  "urgency": "LOW|MEDIUM|HIGH"
}
\`\`\``;
}

function formatWhaleTrades(trades: any[]): string {
  return trades.slice(0, 5).map((trade, i) => {
    const usdValue = parseFloat(trade.size) * parseFloat(trade.price);
    return `${i + 1}. $${usdValue.toLocaleString()} at ${trade.price}¢`;
  }).join('\n');
}

function formatNews(articles: any[]): string {
  return articles.slice(0, 5).map((article, i) => {
    return `${i + 1}. ${article.title} (${article.source.name})`;
  }).join('\n');
}
```

✅ **PHASE 2 COMPLETE** - Automated signal detection working!

---

### PHASE 3: Polish (Hours 8-12)

Won't detail this fully but key tasks:

**Person 1:**
- Add error handling
- Add rate limiting
- Log all API calls

**Person 2:**
- Signal detail page (`/signal/[id]`)
- Real-time updates (Supabase Realtime)
- Mobile responsive

**Person 3:**
- Landing page
- WhatsApp alerts (optional)
- Demo prep

---

## 🚢 DEPLOYMENT

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Add environment variables in Vercel dashboard
# Go to Project Settings → Environment Variables
# Add all variables from .env.local

# 5. Add cron secret
openssl rand -base64 32
# Add as CRON_SECRET in Vercel

# 6. Redeploy
vercel --prod
```

The cron job will now run automatically every 5 minutes!

---

## 📊 SUCCESS METRICS

By end of 24 hours:

✅ **Core Functionality:**
- [ ] Cron scans 50+ markets every 5 min
- [ ] Detects 3-5 new signals per hour
- [ ] Dashboard shows signals in real-time
- [ ] Signal detail page shows full analysis

✅ **Demo Quality:**
- [ ] Clean UI (looks professional)
- [ ] Live signals appearing during demo
- [ ] At least 10 saved signals to show
- [ ] 5-minute video recorded

✅ **Technical:**
- [ ] Deployed to Vercel
- [ ] Database has 20+ signals
- [ ] No crashes for 1 hour straight
- [ ] Response time <2s

Good luck! 🚀
