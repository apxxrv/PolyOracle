#!/bin/bash

# ============================================
# POLYMARKET SIGNAL - PROJECT SETUP SCRIPT
# ============================================
# This script creates the complete Next.js project structure
# Run this AFTER verifying APIs work

set -e  # Exit on any error

echo "🚀 Setting up Polymarket Signal project..."
echo ""

# Check if we're in the right place
if [ -d "polymarket-signal" ]; then
  echo "❌ Directory 'polymarket-signal' already exists!"
  echo "   Delete it first or choose a different location."
  exit 1
fi

# ============================================
# 1. CREATE NEXT.JS PROJECT
# ============================================
echo "📦 Creating Next.js project..."
npx create-next-app@latest polymarket-signal \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm

cd polymarket-signal

# ============================================
# 2. INSTALL DEPENDENCIES
# ============================================
echo ""
echo "📦 Installing dependencies..."

npm install \
  @anthropic-ai/sdk \
  @supabase/supabase-js \
  axios \
  date-fns \
  zod \
  recharts \
  lucide-react

npm install -D @types/node

# ============================================
# 3. CREATE FOLDER STRUCTURE
# ============================================
echo ""
echo "📁 Creating folder structure..."

# Core lib folders
mkdir -p lib/api
mkdir -p lib/ai
mkdir -p lib/engine
mkdir -p lib/db
mkdir -p lib/utils
mkdir -p lib/types

# Component folders
mkdir -p components/ui
mkdir -p components/signal
mkdir -p components/dashboard

# App folders
mkdir -p app/api/cron
mkdir -p app/api/signals
mkdir -p app/dashboard
mkdir -p app/signal/\[id\]

# Config folders
mkdir -p config
mkdir -p scripts

echo "✅ Folder structure created!"

# ============================================
# 4. CREATE KEY FILES
# ============================================
echo ""
echo "📝 Creating configuration files..."

# Create .env.local template
cat > .env.local << 'EOF'
# Copy from .env.example and fill in your values
ANTHROPIC_API_KEY=
NEWS_API_KEY=
TWITTER_BEARER_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
CRON_SECRET=
EOF

# Create vercel.json for cron jobs
cat > vercel.json << 'EOF'
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
EOF

# Create tsconfig paths
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create README
cat > README.md << 'EOF'
# 🎯 Polymarket Signal

AI-powered real-time intelligence platform for Polymarket prediction markets.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your API keys
2. Run `npm install`
3. Set up Supabase (see below)
4. Run `npm run dev`

## Environment Variables

See `.env.example` for all required variables.

**Minimum required:**
- `ANTHROPIC_API_KEY` - Claude API key
- Supabase credentials (create project at supabase.com)

**Recommended:**
- `NEWS_API_KEY` - For news catalysts

**Optional:**
- `TWITTER_BEARER_TOKEN` - For social sentiment (expensive)
- Twilio credentials - For WhatsApp alerts

## Supabase Setup

1. Create a new project at https://supabase.com
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Copy the Project URL and anon key to `.env.local`

## Team Roles

- **Person 1**: Data Engineer (APIs + Cron)
- **Person 2**: Full-Stack (Database + Frontend)
- **Person 3**: AI Engineer (Claude + Alerts)

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```

The cron job will automatically run every 5 minutes.
EOF

echo "✅ Configuration files created!"

# ============================================
# 5. CREATE FILE STRUCTURE DOCUMENT
# ============================================
echo ""
echo "📋 Creating file structure document..."

cat > FILE_STRUCTURE.md << 'EOF'
# 📁 Polymarket Signal - File Structure

## Core Directories

```
polymarket-signal/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── cron/
│   │   │   └── route.ts         # [P1] Main detection cron job
│   │   └── signals/
│   │       ├── route.ts         # [P2] GET signals list
│   │       └── [id]/
│   │           └── route.ts     # [P2] GET single signal
│   ├── dashboard/
│   │   └── page.tsx             # [P2] Main dashboard UI
│   ├── signal/
│   │   └── [id]/
│   │       └── page.tsx         # [P2/P3] Signal detail page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # React Components
│   ├── ui/                      # [P2] Base UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── dashboard/               # [P2] Dashboard components
│   │   ├── SignalFeed.tsx      # Real-time signal feed
│   │   ├── TopSignals.tsx
│   │   └── MarketGrid.tsx
│   └── signal/                  # [P2/P3] Signal components
│       ├── SignalCard.tsx
│       ├── SignalDetail.tsx
│       ├── AnalysisBreakdown.tsx
│       └── TradeRecommendation.tsx
│
├── lib/                         # Core Logic
│   ├── api/                     # [P1] External API Clients
│   │   ├── polymarket.ts       # Polymarket API functions
│   │   ├── twitter.ts          # Twitter API (optional)
│   │   └── news.ts             # NewsAPI integration
│   ├── ai/                      # [P3] AI Logic
│   │   ├── claude.ts           # Claude API + prompts
│   │   └── prompts.ts          # Prompt templates
│   ├── engine/                  # [P1] Detection Engine
│   │   ├── detector.ts         # Main signal detection
│   │   └── scorer.ts           # Scoring logic
│   ├── db/                      # [P2] Database Layer
│   │   ├── client.ts           # Supabase client
│   │   ├── queries.ts          # Database queries
│   │   └── types.ts            # Database types
│   ├── alerts/                  # [P3] Alerting (optional)
│   │   └── whatsapp.ts         # Twilio WhatsApp
│   └── utils/                   # Shared utilities
│       ├── format.ts           # Formatting helpers
│       └── constants.ts        # App constants
│
├── supabase/                    # [P2] Database
│   └── schema.sql              # Database schema
│
├── config/                      # Configuration
│   └── apis.ts                 # API configs
│
├── scripts/                     # Utility scripts
│   └── seed-demo.ts            # Seed demo data
│
├── .env.local                   # Environment variables
├── .env.example                 # Template
├── vercel.json                  # Vercel cron config
├── package.json
├── tsconfig.json
└── README.md
```

## Work Assignment

### 👤 Person 1: Data Engineer
**Focus:** Get data flowing

Files:
- `lib/api/polymarket.ts` ⭐ CRITICAL
- `lib/api/news.ts`
- `lib/api/twitter.ts` (optional)
- `lib/engine/detector.ts` ⭐ CRITICAL
- `app/api/cron/route.ts` ⭐ CRITICAL

### 👤 Person 2: Full-Stack Engineer
**Focus:** Database + UI

Files:
- `supabase/schema.sql` ⭐ CRITICAL
- `lib/db/*.ts` ⭐ CRITICAL
- `app/dashboard/page.tsx` ⭐ CRITICAL
- `components/signal/SignalCard.tsx`
- `components/dashboard/SignalFeed.tsx`
- `app/signal/[id]/page.tsx`

### 👤 Person 3: AI Engineer
**Focus:** Claude brain + polish

Files:
- `lib/ai/claude.ts` ⭐ CRITICAL
- `lib/ai/prompts.ts` ⭐ CRITICAL
- `lib/alerts/whatsapp.ts` (optional)
- `components/signal/AnalysisBreakdown.tsx`
- `app/page.tsx` (landing page)

## Critical Path (Must Have)

Hour 0-4: Foundation
- ✅ P2: Create Supabase project + schema
- ✅ P1: Get Polymarket API working
- ✅ P3: Get Claude API working

Hour 4-8: Core Flow
- ✅ P1: Build detector.ts (finds opportunities)
- ✅ P3: Build claude.ts (analyzes them)
- ✅ P2: Build db queries (saves them)
- ✅ P1: Wire up cron job

Hour 8-12: UI
- ✅ P2: Build dashboard that shows signals
- ✅ P2: Build SignalCard component
- ✅ P3: Build signal detail page

Hour 12-18: Polish
- ✅ P2: Add real-time updates (Supabase Realtime)
- ✅ P3: Refine Claude prompt
- ✅ P1: Add news integration
- ✅ ALL: UI polish

Hour 18-24: Demo
- ✅ P3: Landing page
- ✅ P3: WhatsApp alerts (optional)
- ✅ ALL: Demo video
- ✅ ALL: Devpost submission

## Key Integration Points

1. **P1 → P3**: Detector calls Claude analysis
2. **P3 → P2**: Claude results saved to DB
3. **P2 → UI**: DB queries power dashboard
4. **Supabase → UI**: Real-time updates
EOF

echo "✅ File structure document created!"

# ============================================
# 6. INITIALIZE GIT
# ============================================
echo ""
echo "🔧 Initializing Git..."

# Add to .gitignore
cat >> .gitignore << 'EOF'

# Environment
.env.local
.env

# Testing
api-verification.js
EOF

git init
git add .
git commit -m "Initial project setup"

echo "✅ Git initialized!"

# ============================================
# 7. FINAL INSTRUCTIONS
# ============================================
echo ""
echo "=========================================="
echo "✅ PROJECT SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Navigate to project:"
echo "   cd polymarket-signal"
echo ""
echo "2. Copy and fill environment variables:"
echo "   cp .env.example .env.local"
echo "   # Edit .env.local with your API keys"
echo ""
echo "3. Read the file structure:"
echo "   cat FILE_STRUCTURE.md"
echo ""
echo "4. Set up Supabase:"
echo "   - Create project at https://supabase.com"
echo "   - Run SQL from supabase/schema.sql"
echo "   - Copy credentials to .env.local"
echo ""
echo "5. Start development:"
echo "   npm run dev"
echo ""
echo "=========================================="
echo "📚 RESOURCES:"
echo "=========================================="
echo ""
echo "• File Structure: FILE_STRUCTURE.md"
echo "• Team Roles: README.md"
echo "• API Docs:"
echo "  - Polymarket: https://docs.polymarket.com"
echo "  - Claude: https://docs.anthropic.com"
echo "  - NewsAPI: https://newsapi.org/docs"
echo ""
echo "Good luck! 🚀"
echo ""
EOF

chmod +x setup-project.sh
