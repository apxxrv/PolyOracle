import axios from 'axios';
import type { RedditPostData } from '@/types/api';
import { extractKeywords } from './news';

function getRedditCredentials() {
  return {
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    userAgent: process.env.REDDIT_USER_AGENT || 'PolymarketSignal/1.0'
  };
}

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Reddit OAuth access token (with caching)
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }

  const { clientId, clientSecret, userAgent } = getRedditCredentials();
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit credentials not found in environment');
  }

  const authResponse = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    {
      auth: {
        username: clientId,
        password: clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      }
    }
  );

  cachedAccessToken = authResponse.data.access_token;
  // Token expires in 1 hour, cache for 50 minutes to be safe
  tokenExpiry = Date.now() + (50 * 60 * 1000);

  return cachedAccessToken;
}

/**
 * Search Reddit across multiple subreddits
 */
export async function searchReddit(
  query: string,
  subreddits: string[] = ['Polymarket', 'PredictionMarkets']
): Promise<RedditPostData[]> {
  try {
    const accessToken = await getAccessToken();
    const { userAgent } = getRedditCredentials();
    const subredditString = subreddits.join('+');

    const searchResponse = await axios.get(
      `https://oauth.reddit.com/r/${subredditString}/search`,
      {
        params: {
          q: query,
          sort: 'relevance',
          limit: 20,
          restrict_sr: true,
          t: 'week' // Last week only
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': userAgent
        }
      }
    );

    const posts = searchResponse.data?.data?.children || [];

    return posts.map((item: any) => ({
      id: item.data.id,
      title: item.data.title,
      selftext: item.data.selftext,
      author: item.data.author,
      subreddit: item.data.subreddit,
      created_utc: item.data.created_utc,
      score: item.data.score,
      upvote_ratio: item.data.upvote_ratio,
      num_comments: item.data.num_comments,
      permalink: item.data.permalink,
      url: item.data.url
    }));
  } catch (error: any) {
    console.error('Error searching Reddit:', error.message);
    return [];
  }
}

/**
 * Get Reddit discussions related to a market
 */
export async function getMarketDiscussions(marketTitle: string): Promise<RedditPostData[]> {
  // Extract keywords from market title
  const keywords = extractKeywords(marketTitle, 3);
  const query = keywords.join(' ');

  // Search across relevant subreddits
  return await searchReddit(query, ['Polymarket', 'PredictionMarkets', 'wallstreetbets']);
}

/**
 * Calculate sentiment score from Reddit posts
 * Returns 0-100 where:
 * - 50 = neutral
 * - >70 = bullish
 * - <30 = bearish
 */
export async function calculateSentiment(posts: RedditPostData[]): Promise<number> {
  if (posts.length === 0) return 50; // Neutral if no posts

  // Calculate weighted sentiment based on upvote ratio and score
  const sentimentScores = posts.map(post => {
    const upvoteRatio = post.upvote_ratio || 0.5;
    const score = Math.max(post.score, 1);

    // Weight by engagement: upvote ratio * (1 + log(score))
    const weight = upvoteRatio * (1 + Math.log10(score));

    return weight;
  });

  // Average and normalize to 0-100
  const avgSentiment = sentimentScores.reduce((sum, s) => sum + s, 0) / sentimentScores.length;

  // Normalize: typical range is 0.5-2.0, map to 0-100
  const normalized = Math.min(100, Math.max(0, (avgSentiment - 0.5) / 1.5 * 100));

  return Math.round(normalized);
}

/**
 * Get Reddit posts (legacy function for compatibility)
 */
export async function getRedditPosts(query: string): Promise<RedditPostData[]> {
  return await searchReddit(query);
}
