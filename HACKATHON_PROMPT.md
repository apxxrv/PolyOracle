# 🤖 CLAUDE ASSISTANT PROMPT FOR HACKATHON

Copy and paste this prompt to Claude when you need help during the hackathon:

---

I'm building Polymarket Signal for a 24-hour hackathon with 2 teammates. This is an AI-powered real-time intelligence platform that monitors Polymarket prediction markets and alerts users to high-probability trading opportunities.

**Tech Stack:**
- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (PostgreSQL)
- Claude Sonnet 4 (for analysis)
- Polymarket API + NewsAPI
- Deployed on Vercel

**My Role:** [Person 1: Data Engineer | Person 2: Full-Stack | Person 3: AI Engineer]

**Current Phase:** [Foundation 0-4hrs | Automation 4-8hrs | Polish 8-12hrs | Demo 12-24hrs]

**What I'm Working On:**
[Describe your current task, e.g., "Building the Claude analysis function in lib/ai/claude.ts"]

**What I Need Help With:**
[Your specific question or problem]

**Context/Error:**
[Paste any relevant code, error messages, or files]

---

## REFERENCE: Project Architecture

### File Structure
```
app/
  api/
    cron/route.ts         # [P1] Main detection cron
  dashboard/page.tsx      # [P2] Dashboard UI
  signal/[id]/page.tsx    # [P2] Signal detail

lib/
  api/
    polymarket.ts         # [P1] Polymarket API client
    news.ts               # [P1] NewsAPI client
  ai/
    claude.ts             # [P3] Claude analysis
    prompts.ts            # [P3] Prompt templates
  engine/
    detector.ts           # [P1] Signal detection logic
  db/
    client.ts             # [P2] Supabase queries

components/
  signal/
    SignalCard.tsx        # [P2] Signal card component
```

### Data Flow
```
1. Cron (every 5 min) → Polymarket API → Get markets & trades
2. Filter whale trades (>$10K)
3. Fetch related news
4. Send to Claude → Analyze → Get Signal Score
5. If score ≥ 70 → Save to Supabase
6. Dashboard fetches & displays signals
```

### Key APIs
- **Polymarket**: `https://gamma-api.polymarket.com/markets`
- **CLOB (trades)**: `https://clob.polymarket.com/trades`
- **NewsAPI**: `https://newsapi.org/v2/everything`
- **Claude**: Sonnet 4 model

---

## QUICK COMMANDS

**Test APIs:**
```bash
node api-verification.js
```

**Test Integration:**
```bash
npx tsx scripts/test-integration.ts
```

**Test Cron Locally:**
```bash
curl -X POST http://localhost:3000/api/cron
```

**Check Database:**
```sql
-- In Supabase SQL Editor
SELECT * FROM signals ORDER BY created_at DESC LIMIT 10;
```

**Deploy:**
```bash
vercel --prod
```

---

## COMMON ISSUES & FIXES

### Issue: "TypeError: fetch is not defined"
**Fix:** Using Node 16? Upgrade to Node 18+
```bash
nvm install 18
nvm use 18
```

### Issue: "Supabase client not authorized"
**Fix:** Make sure you're using `SUPABASE_SERVICE_KEY` (not anon key) in server-side code

### Issue: "Claude returns text instead of JSON"
**Fix:** Parse with regex:
```typescript
const text = response.content[0].text;
const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
```

### Issue: "Polymarket API rate limiting"
**Fix:** Add delay between requests:
```typescript
await new Promise(r => setTimeout(r, 1000)); // 1 second delay
```

### Issue: "Vercel cron not running"
**Fix:** 
1. Check `vercel.json` exists
2. Verify `CRON_SECRET` env var set
3. Check Vercel logs: `vercel logs`

---

## TEAM HANDOFFS

**P1 → P3:** "Here's the market data object, whale trades array, and news array. Can you analyze this with Claude?"

**P3 → P2:** "Here's the analysis object from Claude. Can you save this to Supabase?"

**P2 → ALL:** "Database schema is ready. Here are the query functions you can use..."

---

Please help me with the specific task I mentioned above. Keep responses concise and code-focused since we're in a time crunch!
