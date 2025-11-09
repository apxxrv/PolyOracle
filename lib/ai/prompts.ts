import type { PolymarketMarket, PolymarketTrade } from '@/types/api';
import type { NewsArticle } from '@/types/api';
import type { RedditPostData } from '@/types/api';

/**
 * System prompt for Claude AI signal generation
 */
export const SYSTEM_PROMPT = `You are PolyOracle, an expert AI analyst for Polymarket prediction markets. Generate trading signals by analyzing whale trades, news, and social sentiment.

Signal Score Guide (0-100):
- 0-30: Strong bearish (market overpriced)
- 31-55: Neutral/Hold
- 56-70: Moderate bullish
- 71-100: Strong bullish (market underpriced)

Always respond with valid JSON only. No markdown, no explanations outside JSON.`;

/**
 * Build analysis prompt for Claude
 */
export function buildAnalysisPrompt(
  market: PolymarketMarket | any,
  whaleTrades: PolymarketTrade[],
  news: NewsArticle[],
  redditPosts: RedditPostData[]
): string {
  const whaleVolume = whaleTrades.reduce((sum, t) => {
    return sum + (parseFloat(t.size) * parseFloat(t.price));
  }, 0);

  return `Analyze this Polymarket prediction market:

## MARKET
Question: ${market.question}
Current Price: $${market.outcomePrices?.[0] || 'N/A'}
Volume: $${parseFloat(market.volume || 0).toLocaleString()}
End Date: ${market.end_date_iso || 'Unknown'}

## WHALE ACTIVITY (Volume-Based Estimate)
⚠️ Estimated ${whaleTrades.length} whale-sized positions based on market volume
Total Estimated Volume: $${whaleVolume.toLocaleString()}
${whaleTrades.length > 0 ? whaleTrades.slice(0, 3).map((t, i) => {
  const size = parseFloat(t.size) * parseFloat(t.price);
  return `${i + 1}. ${t.side} ~$${size.toLocaleString()} @ $${t.price}`;
}).join('\n') : 'No significant whale activity detected'}
Note: Estimates based on volume patterns. Real data requires CLOB API access.

## NEWS (Last 48h)
Count: ${news.length}
${news.length > 0 ? news.slice(0, 3).map((n, i) =>
  `${i + 1}. ${n.title} - ${n.source.name}`
).join('\n') : 'No recent news'}

## REDDIT SENTIMENT
Posts: ${redditPosts.length}
${redditPosts.length > 0 ? `Top: "${redditPosts[0].title}"
Score: ${redditPosts.reduce((sum, p) => sum + p.score, 0)}
Avg Upvote: ${(redditPosts.reduce((sum, p) => sum + p.upvote_ratio, 0) / redditPosts.length * 100).toFixed(0)}%` : 'No Reddit activity'}

Generate trading signal. Respond with ONLY this JSON structure:
{
  "score": <0-100>,
  "action": "BUY"|"SELL"|"HOLD"|"WATCH",
  "confidence": "LOW"|"MEDIUM"|"HIGH",
  "urgency": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
  "reasoning": {
    "summary": "<2-3 sentences>",
    "whale_analysis": "<analysis of estimated whale positions>",
    "news_analysis": "<analysis of news impact>",
    "reddit_analysis": "<analysis of sentiment>",
    "risk_factors": ["<factor1>", "<factor2>"],
    "key_insights": ["<insight1>", "<insight2>"]
  },
  "entry_price": <number or null>,
  "target_price": <number or null>
}`;
}
