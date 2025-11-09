import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getRelatedNews, extractKeywords } from '../lib/api/news';

async function test() {
  console.log('🧪 Testing NewsAPI Client\n');

  const marketTitle = 'Will Bitcoin hit $150K by December 2025?';

  console.log(`Market: "${marketTitle}"`);

  // Test keyword extraction
  console.log('\n1️⃣  Extracting keywords...');
  const keywords = extractKeywords(marketTitle);
  console.log(`✅ Keywords: ${keywords.join(', ')}\n`);

  // Test news fetching
  console.log('2️⃣  Fetching related news (last 24 hours)...');
  const articles = await getRelatedNews(marketTitle, 24);

  if (articles.length === 0) {
    console.log('⚠️  No articles found (this is normal if no recent news)\n');
  } else {
    console.log(`✅ Found ${articles.length} articles:\n`);

    articles.slice(0, 3).forEach((article, i) => {
      console.log(`   ${i + 1}. ${article.title}`);
      console.log(`      Source: ${article.source.name}`);
      console.log(`      Published: ${new Date(article.publishedAt).toLocaleString()}\n`);
    });
  }

  console.log('🎉 NewsAPI client test complete!');
}

test();
