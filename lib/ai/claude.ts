import Anthropic from '@anthropic-ai/sdk';
import type { PolymarketMarket, PolymarketTrade, NewsArticle, RedditPostData } from '@/types/api';
import type { ClaudeAnalysisResponse } from '@/types/api';
import { buildAnalysisPrompt, SYSTEM_PROMPT } from './prompts';

/**
 * Analyze market using Claude AI and generate trading signal
 */
export async function analyzeMarket(
  market: PolymarketMarket | any,
  whaleTrades: PolymarketTrade[],
  news: NewsArticle[],
  redditPosts: RedditPostData[]
): Promise<ClaudeAnalysisResponse> {
  // Read API key inside function to ensure dotenv has loaded
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in environment');
  }

  try {
    const client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY
    });

    const prompt = buildAnalysisPrompt(market, whaleTrades, news, redditPosts);

    console.log('🤖 Calling Claude AI for market analysis...');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    if (response.content[0].type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const text = response.content[0].text;

    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Claude response:', text);
      throw new Error('Failed to parse JSON from Claude response');
    }

    const analysis: ClaudeAnalysisResponse = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (typeof analysis.score !== 'number' || !analysis.action || !analysis.confidence) {
      throw new Error('Invalid response structure from Claude');
    }

    console.log(`✅ Signal generated: Score ${analysis.score}/100, Action: ${analysis.action}`);

    return analysis;
  } catch (error: any) {
    console.error('Error analyzing market with Claude:', error.message);
    throw error;
  }
}

/**
 * Generate signal from market data (convenience function)
 */
export async function generateSignal(data: {
  market: PolymarketMarket | any;
  whaleTrades: PolymarketTrade[];
  newsArticles: NewsArticle[];
  redditPosts: RedditPostData[];
}): Promise<ClaudeAnalysisResponse> {
  return await analyzeMarket(
    data.market,
    data.whaleTrades,
    data.newsArticles,
    data.redditPosts
  );
}
