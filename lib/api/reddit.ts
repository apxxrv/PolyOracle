import axios from 'axios';

export interface RedditPost {
  title: string;
  upvoteRatio: number;
  numComments: number;
  url: string;
}

/**
 * Get Reddit posts from prediction market subreddits
 */
export async function getRedditPosts(query: string): Promise<RedditPost[]> {
  // Get access token
  const authResponse = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.REDDIT_CLIENT_ID!,
        password: process.env.REDDIT_CLIENT_SECRET!
      },
      headers: {
        'User-Agent': process.env.REDDIT_USER_AGENT || 'PolymarketSignal/1.0'
      }
    }
  );

  const accessToken = authResponse.data.access_token;

  // Search posts
  const searchResponse = await axios.get(
    'https://oauth.reddit.com/r/Polymarket+PredictionMarkets/search',
    {
      params: {
        q: query,
        sort: 'hot',
        limit: 3,
        restrict_sr: true
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'PolymarketSignal/1.0'
      }
    }
  );

  const posts = searchResponse.data.data.children;

  return posts.map((item: any) => ({
    title: item.data.title,
    upvoteRatio: item.data.upvote_ratio,
    numComments: item.data.num_comments,
    url: `https://reddit.com${item.data.permalink}`
  }));
}
