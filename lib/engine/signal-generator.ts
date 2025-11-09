import { getActiveMarkets, detectWhaleTrades } from '../api/polymarket';
import { getRelatedNews } from '../api/news';
import { getMarketDiscussions } from '../api/reddit';
import { analyzeMarket } from '../ai/claude';
import { upsertMarket, createSignal, createWhaleTrade, bulkCreateRedditPosts } from '../db/queries';
import type { Signal } from '@/types/database';

export interface SignalGenerationResult {
  success: boolean;
  signalsGenerated: number;
  errors: string[];
  signals: Signal[];
}

/**
 * Main signal generation engine
 * Fetches markets, analyzes them, and generates signals
 */
export async function generateSignals(
  marketLimit: number = 10,
  minVolume: number = 50000
): Promise<SignalGenerationResult> {
  const result: SignalGenerationResult = {
    success: true,
    signalsGenerated: 0,
    errors: [],
    signals: []
  };

  try {
    console.log('🔍 Fetching active markets from Polymarket...');
    const markets = await getActiveMarkets(marketLimit);

    if (markets.length === 0) {
      console.log('⚠️  No active markets found');
      return result;
    }

    console.log(`✅ Found ${markets.length} markets`);

    // Filter for high-volume markets only
    const highVolumeMarkets = markets.filter(m => {
      const volume = parseFloat(m.volume || '0');
      return volume >= minVolume;
    });

    console.log(`📊 ${highVolumeMarkets.length} markets meet volume threshold ($${minVolume.toLocaleString()}+)`);

    // Process each market
    for (const market of highVolumeMarkets) {
      try {
        console.log(`\n🎯 Analyzing: "${market.question}"`);

        // Get market ID
        const marketId = (market as any).condition_id || (market as any).id || market.market_slug;

        // Store/update market in database
        // Parse volume and liquidity safely
        const volumeStr = typeof market.volume === 'string' ? market.volume : String(market.volume || '0');
        const liquidityStr = typeof (market as any).liquidity === 'string' ? (market as any).liquidity : String((market as any).liquidity || '0');
        
        await upsertMarket({
          id: marketId,
          question: market.question,
          description: market.description || '',
          end_date: market.end_date_iso || null,
          volume: parseFloat(volumeStr.replace(/[^0-9.]/g, '') || '0'),
          liquidity: parseFloat(liquidityStr.replace(/[^0-9.]/g, '') || '0'),
          current_price: market.outcomePrices?.[0] ? parseFloat(market.outcomePrices[0]) : null,
          active: market.active ?? true
        });

        // Gather data from all sources
        console.log('  📈 Detecting whale trades...');
        const whaleTrades = await detectWhaleTrades(marketId);

        console.log('  📰 Fetching related news...');
        const news = await getRelatedNews(market.question, 48);

        console.log('  💬 Analyzing Reddit discussions...');
        const redditPosts = await getMarketDiscussions(market.question);

        console.log(`  ✅ Data: ${whaleTrades.length} whale trades, ${news.length} news, ${redditPosts.length} Reddit posts`);

        // Analyze with Claude AI
        console.log('  🤖 Generating signal with Claude...');
        const analysis = await analyzeMarket(market, whaleTrades, news, redditPosts);

        console.log(`  ✅ Signal: ${analysis.score}/100 (${analysis.action})`);

        // Only store signals with score >= 70 (strong bullish)
        if (analysis.score >= 70) {
          // Store whale trades
          for (const trade of whaleTrades) {
            await createWhaleTrade({
              market_id: marketId,
              asset_id: trade.asset_id,
              side: trade.side,
              size: parseFloat(trade.size),
              price: parseFloat(trade.price),
              timestamp: new Date(trade.timestamp).toISOString(),
              size_usd: trade.size_usd || 0
            });
          }

          // Store Reddit posts
          if (redditPosts.length > 0) {
            await bulkCreateRedditPosts(redditPosts.map(post => ({
              post_id: post.id,
              market_id: marketId,
              title: post.title,
              content: post.selftext || '',
              author: post.author,
              subreddit: post.subreddit,
              score: post.score,
              upvote_ratio: post.upvote_ratio,
              num_comments: post.num_comments,
              created_at: new Date(post.created_utc * 1000).toISOString(),
              url: post.url
            })));
          }

          // Store signal
          const signal = await createSignal({
            market_id: marketId,
            score: analysis.score,
            action: analysis.action,
            entry_price: analysis.entry_price,
            target_price: analysis.target_price,
            reasoning: analysis.reasoning,
            confidence: analysis.confidence,
            urgency: analysis.urgency,
            whale_count: whaleTrades.length,
            news_count: news.length,
            reddit_count: redditPosts.length
          });

          result.signals.push(signal);
          result.signalsGenerated++;

          console.log(`  💾 Signal stored in database (ID: ${signal.id})`);
        } else {
          console.log(`  ⏭️  Signal score too low (${analysis.score}/100) - skipping storage`);
        }

      } catch (error: any) {
        const errorMsg = `Error analyzing market "${market.question}": ${error.message}`;
        console.error(`  ❌ ${errorMsg}`);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    console.log(`\n✅ Signal generation complete: ${result.signalsGenerated} signals stored`);

    return result;

  } catch (error: any) {
    console.error('❌ Fatal error in signal generation:', error.message);
    result.success = false;
    result.errors.push(error.message);
    return result;
  }
}
