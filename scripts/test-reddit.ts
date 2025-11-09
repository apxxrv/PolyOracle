import { config } from 'dotenv';
config({ path: '.env.local' });
import { getRedditPosts } from '../lib/api/reddit';

async function test() {
  console.log('🔍 Testing Reddit API client...\n');

  const query = 'prediction';
  console.log(`Searching Reddit for: "${query}"`);
  
  const posts = await getRedditPosts(query);
  
  console.log(`✅ Found ${posts.length} posts\n`);
  
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    console.log(`   Upvote Ratio: ${(post.upvoteRatio * 100).toFixed(0)}%`);
    console.log(`   Comments: ${post.numComments}`);
    console.log(`   URL: ${post.url}\n`);
  });

  console.log('🎉 Reddit API client working!');
}

test().catch(console.error);
