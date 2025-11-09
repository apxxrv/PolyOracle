import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getActiveMarkets, detectWhaleTrades } from '../lib/api/polymarket';
import { getRelatedNews } from '../lib/api/news';
import { getMarketDiscussions, calculateSentiment } from '../lib/api/reddit';
import { analyzeMarket } from '../lib/ai/claude';

async function testIntegration() {
  console.log('🧪 PolyOracle Full Integration Test\n');
  console.log('Testing complete pipeline including Claude AI\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Get a market from Polymarket
    console.log('\n1️⃣  Fetching active markets from Polymarket...');
    const markets = await getActiveMarkets(5);

    if (markets.length === 0) {
      console.log('❌ No markets found');
      return;
    }

    const market = markets[0];
    console.log(`✅ Selected market: "${market.question}"`);
    console.log(`   Volume: $${parseFloat(market.volume).toLocaleString()}\n`);

    // Step 2: Detect whale trades
    console.log('2️⃣  Detecting whale trades...');
    const marketId = (market as any).condition_id || (market as any).id || market.market_slug;
    const whaleTrades = await detectWhaleTrades(marketId);
    console.log(`✅ Whale trades: ${whaleTrades.length} detected (>$10K)`);

    if (whaleTrades.length > 0) {
      const totalVolume = whaleTrades.reduce((sum, t) => {
        return sum + (parseFloat(t.size) * parseFloat(t.price));
      }, 0);
      console.log(`   Total whale volume: $${totalVolume.toLocaleString()}\n`);
    } else {
      console.log(`   (No whale trades in this market - using volume as proxy)\n`);
    }

    // Step 3: Get Reddit discussions
    console.log('3️⃣  Fetching Reddit discussions...');
    const redditPosts = await getMarketDiscussions(market.question);
    console.log(`✅ Reddit posts: ${redditPosts.length} found`);

    if (redditPosts.length > 0) {
      const sentiment = await calculateSentiment(redditPosts);
      console.log(`   Sentiment: ${sentiment}/100 ${getSentimentEmoji(sentiment)}\n`);
    } else {
      console.log(`   (No Reddit discussions found)\n`);
    }

    // Step 4: Get news articles
    console.log('4️⃣  Fetching related news...');
    const newsArticles = await getRelatedNews(market.question, 48);
    console.log(`✅ News articles: ${newsArticles.length} found (last 48 hours)\n`);

    // Step 5: Analyze with Claude
    console.log('5️⃣  Analyzing with Claude AI...');
    console.log('   (This may take 10-15 seconds...)\n');

    const signal = await analyzeMarket(market, whaleTrades, newsArticles, redditPosts);

    // Summary
    console.log('='.repeat(60));
    console.log('\n📊 SIGNAL GENERATED\n');
    console.log(`Market: "${market.question}"`);
    console.log(`\nSignal Score: ${signal.score}/100`);
    console.log(`Action: ${signal.action}`);
    console.log(`Confidence: ${signal.confidence}`);
    console.log(`Urgency: ${signal.urgency}`);

    if (signal.entry_price) {
      console.log(`Entry Price: $${signal.entry_price}`);
    }
    if (signal.target_price) {
      console.log(`Target Price: $${signal.target_price}`);
    }

    console.log(`\nSummary: ${signal.reasoning.summary}`);

    if (signal.reasoning.key_insights && signal.reasoning.key_insights.length > 0) {
      console.log(`\nKey Insights:`);
      signal.reasoning.key_insights.forEach((insight, i) => {
        console.log(`  ${i + 1}. ${insight}`);
      });
    }

    console.log(`\nData Sources:`);
    console.log(`  Whale Trades: ${whaleTrades.length}`);
    console.log(`  News Articles: ${newsArticles.length}`);
    console.log(`  Reddit Posts: ${redditPosts.length}`);

    console.log('\n✅ Full integration test complete!');
    console.log('🚀 Ready for Phase 6: Cron Job & Database Integration\n');

  } catch (error: any) {
    console.error('\n❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

function getSentimentEmoji(score: number): string {
  if (score > 70) return '📈 Bullish';
  if (score < 30) return '📉 Bearish';
  return '➡️  Neutral';
}

function getSentimentLabel(score: number): string {
  if (score > 70) return '(Bullish)';
  if (score < 30) return '(Bearish)';
  return '(Neutral)';
}

testIntegration();
