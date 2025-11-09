import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

async function testPolymarket() {
  try {
    console.log('\n🧪 Testing Polymarket API...');
    const response = await axios.get('https://gamma-api.polymarket.com/markets', {
      params: { limit: 3, archived: false }
    });

    if (response.data && response.data.length > 0) {
      console.log('✅ Polymarket API works!');
      console.log(`   Found ${response.data.length} active markets`);
      console.log(`   Sample: "${response.data[0].question}"`);
      return true;
    }
    throw new Error('No markets returned');
  } catch (error: any) {
    console.log('❌ Polymarket API failed:', error.message);
    return false;
  }
}

async function testReddit() {
  try {
    console.log('\n🧪 Testing Reddit API...');

    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
      throw new Error('Reddit credentials not found in .env.local');
    }

    // Get Reddit access token
    const authResponse = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        auth: {
          username: REDDIT_CLIENT_ID,
          password: REDDIT_CLIENT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PolymarketSignal/1.0'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Get recent posts from r/Polymarket (or r/wallstreetbets if Polymarket is quiet)
    const searchResponse = await axios.get(
      'https://oauth.reddit.com/r/wallstreetbets/hot',
      {
        params: {
          limit: 5
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'PolymarketSignal/1.0'
        }
      }
    );

    if (searchResponse.data?.data?.children?.length > 0) {
      console.log('✅ Reddit API works!');
      console.log(`   Found ${searchResponse.data.data.children.length} posts`);
      const firstPost = searchResponse.data.data.children[0].data;
      console.log(`   Sample: "${firstPost.title.substring(0, 60)}..."`);
      console.log('   💡 Using r/wallstreetbets for testing (you can use r/Polymarket in production)');
      return true;
    }
    throw new Error('No posts returned');
  } catch (error: any) {
    console.log('❌ Reddit API failed:', error.response?.data?.message || error.message);
    console.log('   💡 Note: Reddit API is optional for MVP. You can continue without it.');
    return false;
  }
}

async function testNewsAPI() {
  try {
    console.log('\n🧪 Testing NewsAPI...');

    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not found in .env.local');
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'bitcoin',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 3
      },
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    if (response.data?.articles?.length > 0) {
      console.log('✅ NewsAPI works!');
      console.log(`   Found ${response.data.articles.length} articles`);
      console.log(`   Sample: "${response.data.articles[0].title}"`);
      return true;
    }
    throw new Error('No articles returned');
  } catch (error: any) {
    console.log('❌ NewsAPI failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testClaude() {
  try {
    console.log('\n🧪 Testing Claude API...');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in .env.local');
    }

    const client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY
    });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Hello from PolyOracle!" in exactly 5 words.'
      }]
    });

    if (message.content[0].type === 'text') {
      console.log('✅ Claude API works!');
      console.log(`   Response: "${message.content[0].text}"`);
      return true;
    }
    throw new Error('Invalid response format');
  } catch (error: any) {
    console.log('❌ Claude API failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 PolyOracle API Verification');
  console.log('================================\n');

  const results = {
    polymarket: await testPolymarket(),
    reddit: await testReddit(),
    newsapi: await testNewsAPI(),
    claude: await testClaude()
  };

  console.log('\n================================');
  console.log('📊 Results Summary:');
  console.log('================================');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([api, status]) => {
    console.log(`${status ? '✅' : '❌'} ${api.toUpperCase()}`);
  });

  console.log(`\n${passed}/${total} APIs working\n`);

  // Check if critical APIs (Polymarket, Claude, NewsAPI) are working
  const criticalApis = results.polymarket && results.claude && results.newsapi;

  if (criticalApis) {
    console.log('🎉 ALL CRITICAL APIS WORKING! Ready to build!');
    if (!results.reddit) {
      console.log('ℹ️  Reddit API failed but it\'s optional - you can build without it.');
    }
    console.log('\n✅ Next step: Start building the core pipeline!');
    process.exit(0);
  } else {
    console.log('⚠️  Critical APIs failed. Fix the issues above before continuing.');
    console.log('   Required: Polymarket, Claude, NewsAPI');
    process.exit(1);
  }
}

runAllTests();
