import Anthropic from '@anthropic-ai/sdk';
import { Market, WhaleTrade } from '../api/polymarket';
import { NewsArticle } from '../api/news';
import { RedditPost } from '../api/reddit';
import { buildAnalysisPrompt } from './prompts';

export interface SignalAnalysis {
  signalScore: number;
  reasoning: {
    whaleActivity: { score: number; notes: string };
    newsCatalysts: { score: number; notes: string };
    redditSentiment: { score: number; notes: string };
    technicalFactors: { score: number; notes: string };
    marketMispricing: { score: number; notes: string };
  };
  recommendation: {
    action: 'BUY' | 'SELL' | 'HOLD';
    entryPrice: string | null;
  };
}

export async function analyzeMarket(
  market: Market,
  whaleTrades: WhaleTrade[],
  news: NewsArticle[],
  redditPosts: RedditPost[]
): Promise<SignalAnalysis> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const prompt = buildAnalysisPrompt(market, whaleTrades, news, redditPosts);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const text = response.content[0].text;
  
  // Extract JSON from response (handle markdown code blocks if present)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}
