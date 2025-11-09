import { Market, WhaleTrade } from '../api/polymarket';
import { NewsArticle } from '../api/news';
import { RedditPost } from '../api/reddit';

export function buildAnalysisPrompt(
  market: Market,
  whaleTrades: WhaleTrade[],
  news: NewsArticle[],
  redditPosts: RedditPost[]
): string {
  return `You are an expert prediction market analyst. Analyze this Polymarket opportunity and provide a signal score.

MARKET DETAILS:
Question: ${market.question}
Description: ${market.description || 'N/A'}
Current Volume: $${market.volume?.toLocaleString() || 'N/A'}
Liquidity: $${market.liquidity?.toLocaleString() || 'N/A'}

WHALE TRADES (>$10K):
${whaleTrades.length > 0 ? whaleTrades.map(t => 
  `- ${t.side} $${t.size_usd.toFixed(2)} at ${t.price}`
).join('\n') : 'No whale trades detected'}

RELATED NEWS:
${news.length > 0 ? news.map(n => 
  `- ${n.title} (${n.source})`
).join('\n') : 'No recent news'}

REDDIT SENTIMENT:
${redditPosts.length > 0 ? redditPosts.map(p => 
  `- ${p.title} (${p.upvoteRatio * 100}% upvoted, ${p.numComments} comments)`
).join('\n') : 'No Reddit discussion'}

INSTRUCTIONS:
Think step by step and analyze this market across 5 factors:

1. Whale Activity (0-20 points): Are smart money traders entering? What size and direction?
2. News Catalysts (0-25 points): Are there major news events that could move this market?
3. Reddit Sentiment (0-20 points): What is the community saying? Is there momentum?
4. Technical Factors (0-15 points): Volume spikes, liquidity changes, price action?
5. Market Mispricing (0-20 points): Is the current price inefficient based on available data?

For each factor, provide:
- Score (out of max points)
- Brief reasoning (1-2 sentences)

Then calculate a final Signal Score (0-100) by summing all factors.

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no code blocks):
{
  "signalScore": <number 0-100>,
  "reasoning": {
    "whaleActivity": { "score": <0-20>, "notes": "<reasoning>" },
    "newsCatalysts": { "score": <0-25>, "notes": "<reasoning>" },
    "redditSentiment": { "score": <0-20>, "notes": "<reasoning>" },
    "technicalFactors": { "score": <0-15>, "notes": "<reasoning>" },
    "marketMispricing": { "score": <0-20>, "notes": "<reasoning>" }
  },
  "recommendation": {
    "action": "<BUY|SELL|HOLD>",
    "entryPrice": "<suggested price range or null>"
  }
}`;
}
