import { config } from 'dotenv';
config({ path: '.env.local' });
import { analyzeMarket } from '../lib/ai/claude';

async function test() {
  console.log('🔍 Testing Claude AI analysis...\n');

  // Mock data
  const mockMarket = {
    condition_id: 'test-123',
    question: 'Will Bitcoin reach $100,000 by end of 2025?',
    description: 'Resolves YES if BTC hits $100K on any major exchange',
    volume: 250000,
    liquidity: 50000,
    active: true
  };

  const mockWhaleTrades = [
    {
      id: 'whale1',
      market: 'test-123',
      asset_id: 'btc-yes',
      side: 'BUY' as const,
      size: '20000',
      price: '0.65',
      timestamp: Date.now(),
      size_usd: 13000
    }
  ];

  const mockNews = [
    {
      title: 'Bitcoin ETF sees record inflows of $1B',
      source: 'Bloomberg',
      url: 'https://example.com/news1'
    },
    {
      title: 'Major institutions increasing BTC holdings',
      source: 'Reuters',
      url: 'https://example.com/news2'
    }
  ];

  const mockReddit = [
    {
      title: 'Bitcoin momentum building - technical analysis',
      upvoteRatio: 0.95,
      numComments: 45,
      url: 'https://reddit.com/r/test'
    }
  ];

  console.log('Analyzing market with Claude...\n');
  
  const analysis = await analyzeMarket(
    mockMarket,
    mockWhaleTrades,
    mockNews,
    mockReddit
  );

  console.log('✅ Analysis complete!\n');
  console.log('SIGNAL SCORE:', analysis.signalScore, '/100\n');
  
  console.log('REASONING:');
  console.log('- Whale Activity:', analysis.reasoning.whaleActivity.score, '/20');
  console.log('  ', analysis.reasoning.whaleActivity.notes);
  console.log('- News Catalysts:', analysis.reasoning.newsCatalysts.score, '/25');
  console.log('  ', analysis.reasoning.newsCatalysts.notes);
  console.log('- Reddit Sentiment:', analysis.reasoning.redditSentiment.score, '/20');
  console.log('  ', analysis.reasoning.redditSentiment.notes);
  console.log('- Technical Factors:', analysis.reasoning.technicalFactors.score, '/15');
  console.log('  ', analysis.reasoning.technicalFactors.notes);
  console.log('- Market Mispricing:', analysis.reasoning.marketMispricing.score, '/20');
  console.log('  ', analysis.reasoning.marketMispricing.notes);
  
  console.log('\nRECOMMENDATION:');
  console.log('- Action:', analysis.recommendation.action);
  console.log('- Entry Price:', analysis.recommendation.entryPrice || 'N/A');

  console.log('\n🎉 Claude AI working!');
}

test().catch(console.error);
