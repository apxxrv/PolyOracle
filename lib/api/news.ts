import axios from 'axios';
import type { NewsArticle, NewsAPIResponse } from '@/types/api';

const NEWS_API_BASE = 'https://newsapi.org/v2';

function getNewsApiKey(): string | undefined {
  return process.env.NEWS_API_KEY;
}

/**
 * Extract keywords from market title for news search
 */
export function extractKeywords(marketTitle: string, limit: number = 3): string[] {
  // Remove common words and extract meaningful keywords
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'will', 'be', 'by', 'before', 'after', 'in', 'by']);

  const words = marketTitle
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !commonWords.has(word));

  return words.slice(0, limit);
}

/**
 * Fetch related news articles from NewsAPI
 */
export async function getRelatedNews(
  marketTitle: string,
  hours: number = 24
): Promise<NewsArticle[]> {
  const NEWS_API_KEY = getNewsApiKey();
  if (!NEWS_API_KEY) {
    console.error('NEWS_API_KEY not found in environment');
    return [];
  }

  try {
    // Extract keywords from market title
    const keywords = extractKeywords(marketTitle, 3);
    const query = keywords.join(' OR ');

    // Calculate date range
    const fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - hours);

    const response = await axios.get<NewsAPIResponse>(`${NEWS_API_BASE}/everything`, {
      params: {
        q: query,
        from: fromDate.toISOString(),
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      },
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    if (response.data.status !== 'ok') {
      console.error('NewsAPI returned error status:', response.data);
      return [];
    }

    return response.data.articles.map(article => ({
      source: article.source,
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content
    }));
  } catch (error: any) {
    console.error('Error fetching news:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Get news count for a market
 */
export async function getNewsCount(marketTitle: string, hours: number = 24): Promise<number> {
  const articles = await getRelatedNews(marketTitle, hours);
  return articles.length;
}
