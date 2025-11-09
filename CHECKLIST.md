# ✅ POLYMARKET SIGNAL - HACKATHON CHECKLIST

Print this out and check off as you go!

---

## 🏁 PRE-HACKATHON (Do Before Day 1)

### API Keys
- [ ] Get Claude API key (https://console.anthropic.com/)
- [ ] Get NewsAPI key (https://newsapi.org/register)
- [ ] (Optional) Get Twitter API key
- [ ] (Optional) Get Twilio account

### Setup
- [ ] Run `node api-verification.js` - all critical APIs pass
- [ ] Create GitHub repo
- [ ] Run `./setup-project.sh` successfully
- [ ] All team members can run `npm run dev`

---

## ⏰ HOUR 0-1: Initial Setup

### Everyone
- [ ] Clone repo
- [ ] `npm install` works
- [ ] `.env.local` has API keys
- [ ] `npm run dev` works on localhost:3000

### Person 2 Only
- [ ] Supabase project created
- [ ] Database schema SQL executed
- [ ] Tables visible in Supabase dashboard
- [ ] Connection tested from Next.js

---

## ⏰ HOUR 1-2: API Clients

### Person 1
- [ ] `lib/api/polymarket.ts` created
- [ ] `getActiveMarkets()` returns data
- [ ] `getMarketTrades()` returns trades
- [ ] Can detect whale trades (>$10K)

### Person 2
- [ ] `lib/db/client.ts` created
- [ ] `saveSignal()` function works
- [ ] `getRecentSignals()` returns data
- [ ] Can query Supabase from Next.js

### Person 3
- [ ] `lib/ai/claude.ts` created
- [ ] Claude API returns response
- [ ] Can parse JSON from Claude
- [ ] Mock analysis works

---

## ⏰ HOUR 2-4: First Integration

### Team Integration
- [ ] Created `scripts/test-integration.ts`
- [ ] Can fetch ONE market from Polymarket
- [ ] Can get trades for that market
- [ ] Can get news for that market
- [ ] Claude analyzes the market
- [ ] Signal saved to Supabase
- [ ] Can see signal in Supabase dashboard

✅ **CHECKPOINT 1:** ONE signal end-to-end working!

---

## ⏰ HOUR 4-6: Detection Engine

### Person 1
- [ ] `lib/engine/detector.ts` created
- [ ] `detectSignals()` loops through markets
- [ ] Filters for high volume (>$10K)
- [ ] Detects whale trades
- [ ] Fetches news for each market
- [ ] Calls Claude for analysis
- [ ] Saves signals with score ≥ 70
- [ ] Logs progress to console

### Person 2
- [ ] Basic dashboard UI created (`app/dashboard/page.tsx`)
- [ ] Can fetch signals from database
- [ ] Displays signals in grid
- [ ] Shows score, title, price

### Person 3
- [ ] Improved Claude prompt with better structure
- [ ] Added news integration to prompt
- [ ] Returns consistent JSON format
- [ ] Handles parsing errors gracefully

---

## ⏰ HOUR 6-8: Automation

### Person 1
- [ ] `app/api/cron/route.ts` created
- [ ] GET endpoint has auth check
- [ ] POST endpoint for testing
- [ ] Calls `detectSignals()` successfully
- [ ] Can test with `curl -X POST http://localhost:3000/api/cron`
- [ ] `vercel.json` cron config added

### Person 2
- [ ] `components/signal/SignalCard.tsx` created
- [ ] Shows score badge
- [ ] Shows upside calculation
- [ ] Shows whale count
- [ ] Hover effects work
- [ ] Mobile responsive

### Person 3
- [ ] `lib/api/news.ts` completed
- [ ] News fetching works
- [ ] Keywords extracted from market title
- [ ] Returns relevant articles

✅ **CHECKPOINT 2:** Automated detection working!

---

## ⏰ HOUR 8-10: Dashboard Features

### Person 2
- [ ] Top signals section (score ≥ 80)
- [ ] All signals section
- [ ] Filter by score (70+, 80+, 90+)
- [ ] Search markets functionality
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

### Person 1
- [ ] Error handling in detector
- [ ] Rate limiting added
- [ ] Retry logic for failed APIs
- [ ] Logging improved

### Person 3
- [ ] Signal detail page started (`app/signal/[id]/page.tsx`)
- [ ] Shows full Claude analysis
- [ ] Whale trades listed
- [ ] News articles displayed

---

## ⏰ HOUR 10-12: Signal Detail Page

### Person 3
- [ ] Full analysis breakdown component
- [ ] Score visualization
- [ ] Reasoning for each factor displayed
- [ ] Trade recommendation card
- [ ] Entry/target/stop prices shown
- [ ] Position sizing recommendation
- [ ] Time horizon displayed

### Person 2
- [ ] Real-time updates (Supabase Realtime)
- [ ] New signals appear without refresh
- [ ] "Live" indicator when scanning
- [ ] Smooth animations

### Person 1
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Handle API failures gracefully

✅ **CHECKPOINT 3:** Full MVP complete!

---

## ⏰ HOUR 12-16: Polish & Extras

### UI/UX (All)
- [ ] Clean, consistent design
- [ ] Mobile responsive
- [ ] Fast loading (<2s)
- [ ] No layout shifts
- [ ] Proper error messages
- [ ] Loading spinners
- [ ] Hover states
- [ ] Transitions smooth

### Landing Page (Person 3)
- [ ] Hero section with value prop
- [ ] Live signal preview
- [ ] How it works (3 steps)
- [ ] CTA button to dashboard
- [ ] Footer with links

### Optional Features
- [ ] WhatsApp alerts (Person 3)
- [ ] Historical accuracy tracking
- [ ] Whale wallet profiles
- [ ] Market categories filter
- [ ] Signal notifications

---

## ⏰ HOUR 16-20: Deployment & Testing

### Deployment
- [ ] Deployed to Vercel
- [ ] All environment variables set in Vercel
- [ ] `CRON_SECRET` generated and added
- [ ] Cron job running (check logs)
- [ ] Custom domain (optional)

### Testing
- [ ] Tested on desktop (Chrome, Safari, Firefox)
- [ ] Tested on mobile (iOS, Android)
- [ ] All links work
- [ ] No console errors
- [ ] Forms submit properly
- [ ] Real-time updates work

### Data
- [ ] At least 20 signals in database
- [ ] Mix of scores (70-100)
- [ ] Different categories
- [ ] Real whale trades
- [ ] Actual news articles

---

## ⏰ HOUR 20-22: Demo Preparation

### Demo Video (5 minutes)
- [ ] Script written
- [ ] Screen recorded
- [ ] Voice-over recorded
- [ ] Edited and polished
- [ ] Uploaded to YouTube (unlisted)

### Demo Script
- [ ] [0:00-0:30] Problem statement
- [ ] [0:30-1:30] Solution + live demo
- [ ] [1:30-3:00] Show Signal Score feature
- [ ] [3:00-4:00] Show it works (live signals)
- [ ] [4:00-4:30] Call to action

### Pitch Deck (Optional)
- [ ] Slide 1: Problem
- [ ] Slide 2: Solution
- [ ] Slide 3: Demo screenshot
- [ ] Slide 4: Signal Score explained
- [ ] Slide 5: Technical architecture
- [ ] Slide 6: Team

---

## ⏰ HOUR 22-24: Submission

### Devpost Submission
- [ ] Project title: "Polymarket Signal"
- [ ] Tagline: "AI-powered real-time intelligence for prediction markets"
- [ ] Description written (problem, solution, how it works)
- [ ] Demo video link added
- [ ] Live demo link added (Vercel URL)
- [ ] GitHub repo link added
- [ ] Screenshots uploaded (3-5 images)
- [ ] Technologies listed
- [ ] Team members added

### README.md (GitHub)
- [ ] Project description
- [ ] Features list
- [ ] Tech stack
- [ ] Setup instructions
- [ ] Screenshots
- [ ] Demo link
- [ ] Team credits

### Final Checks
- [ ] Live site works
- [ ] Demo video plays
- [ ] All links work
- [ ] No broken images
- [ ] Mobile works
- [ ] Cron job running

---

## 🏆 SUBMISSION CHECKLIST

Before you submit, verify:

### Must Have (Will be judged on)
- [ ] Live demo URL works
- [ ] Demo video is clear and engaging
- [ ] Core functionality works (signal detection)
- [ ] UI is professional and polished
- [ ] Project solves stated problem
- [ ] Uses Claude API effectively

### Nice to Have (Bonus points)
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] Clean code structure
- [ ] Good documentation
- [ ] Deployed with custom domain
- [ ] Extra features (WhatsApp, etc.)

### Red Flags (Avoid)
- [ ] No broken links
- [ ] No console errors
- [ ] No "Lorem ipsum" text
- [ ] No obvious bugs
- [ ] Not slow to load (>5s)
- [ ] Demo video < 5 minutes

---

## 📊 FINAL METRICS

Track these for your pitch:

- [ ] Number of markets scanned: _______
- [ ] Number of signals detected: _______
- [ ] Highest signal score: _______
- [ ] Average signal score: _______
- [ ] Total whale trades tracked: _______
- [ ] News articles analyzed: _______
- [ ] Claude API calls made: _______

---

## 🎉 POST-SUBMISSION

After submitting:
- [ ] Celebrate! 🎉
- [ ] Take screenshots of final product
- [ ] Share on social media
- [ ] Thank teammates
- [ ] Get some sleep!

---

**Tips:**
- Check off items as you complete them
- Don't skip checkpoints - they ensure you stay on track
- If falling behind, cut optional features
- Focus on core functionality first
- Polish last 4 hours

**Good luck! 🚀**
