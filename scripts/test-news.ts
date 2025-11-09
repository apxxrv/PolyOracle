import { config } from 'dotenv';
config({ path: '.env.local' });
import { getRelatedNews } from '../lib/api/news';

async function test() {
  console.log('🔍 Testing NewsAPI client...\n');

  const query = 'Bitcoin';
  console.log(`Fetching news for: "${query}"`);
  
  const articles = await getRelatedNews(query);
  
  console.log(`✅ Found ${articles.length} articles\n`);
  
  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   Source: ${article.source}`);
    console.log(`   URL: ${article.url}\n`);
  });

  console.log('🎉 NewsAPI client working!');
}

test().catch(console.error);
