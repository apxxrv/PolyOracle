import axios from 'axios';

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
}

/**
 * Fetch related news articles from NewsAPI
 */
export async function getRelatedNews(query: string): Promise<NewsArticle[]> {
  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: query,
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: 5,
      apiKey: process.env.NEWS_API_KEY
    }
  });

  return response.data.articles.map((article: any) => ({
    title: article.title,
    source: article.source.name,
    url: article.url
  }));
}
