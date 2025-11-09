// API Verification Script
// Run this BEFORE starting the project to ensure all APIs work
// Usage: node api-verification.js

require('dotenv').config();
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

// Test results tracker
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// ============================================
// 1. POLYMARKET API TEST
// ============================================
async function testPolymarket() {
  log(colors.blue, '🔍', 'Testing Polymarket API...');
  
  try {
    // Test 1: Get markets
    const marketsResponse = await axios.get('https://gamma-api.polymarket.com/markets', {
      params: { limit: 5 }
    });
    
    if (marketsResponse.data && marketsResponse.data.length > 0) {
      log(colors.green, '✅', `Polymarket Markets API working! Found ${marketsResponse.data.length} markets`);
      log(colors.blue, '   ', `Sample market: "${marketsResponse.data[0].question}"`);
      
      // Test 2: Get specific market details
      const marketId = marketsResponse.data[0].condition_id;
      const marketDetail = await axios.get(`https://gamma-api.polymarket.com/markets/${marketId}`);
      
      log(colors.green, '✅', 'Polymarket Market Detail API working!');
      
      // Test 3: Get trades (CLOB API)
      const tradesResponse = await axios.get('https://clob.polymarket.com/trades', {
        params: { 
          market: marketsResponse.data[0].condition_id,
          limit: 10 
        }
      });
      
      if (tradesResponse.data && tradesResponse.data.length > 0) {
        log(colors.green, '✅', `Polymarket Trades API working! Found ${tradesResponse.data.length} recent trades`);
        
        // Check for whale trades
        const whaleTrades = tradesResponse.data.filter(trade => {
          const usdValue = parseFloat(trade.size) * parseFloat(trade.price);
          return usdValue >= 10000;
        });
        
        if (whaleTrades.length > 0) {
          log(colors.green, '🐋', `Found ${whaleTrades.length} whale trades (>$10K) in this market!`);
        } else {
          log(colors.yellow, '⚠️ ', 'No whale trades found in sample (this is OK, they\'re rare)');
        }
      } else {
        log(colors.yellow, '⚠️ ', 'No trades found (market might be inactive)');
      }
      
      results.passed.push('Polymarket API');
      return true;
    }
  } catch (error) {
    log(colors.red, '❌', `Polymarket API failed: ${error.message}`);
    if (error.response) {
      log(colors.red, '   ', `Status: ${error.response.status}`);
      log(colors.red, '   ', `Error: ${JSON.stringify(error.response.data)}`);
    }
    results.failed.push('Polymarket API');
    return false;
  }
}

// ============================================
// 2. CLAUDE API TEST
// ============================================
async function testClaude() {
  log(colors.blue, '🔍', 'Testing Claude API...');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    log(colors.red, '❌', 'ANTHROPIC_API_KEY not found in environment variables');
    results.failed.push('Claude API');
    return false;
  }
  
  try {
    const client = new Anthropic.Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: 'Respond with valid JSON only: {"status": "working", "message": "Claude API is operational"}'
        }
      ]
    });
    
    const text = response.content[0].text;
    log(colors.green, '✅', 'Claude API working!');
    log(colors.blue, '   ', `Response: ${text.substring(0, 100)}...`);
    
    // Test JSON parsing
    try {
      const json = JSON.parse(text);
      log(colors.green, '✅', 'Claude can return valid JSON!');
    } catch (e) {
      log(colors.yellow, '⚠️ ', 'Claude response was not pure JSON (this is OK, we can handle it)');
    }
    
    results.passed.push('Claude API');
    return true;
  } catch (error) {
    log(colors.red, '❌', `Claude API failed: ${error.message}`);
    results.failed.push('Claude API');
    return false;
  }
}

// ============================================
// 3. NEWS API TEST
// ============================================
async function testNewsAPI() {
  log(colors.blue, '🔍', 'Testing NewsAPI...');
  
  if (!process.env.NEWS_API_KEY) {
    log(colors.yellow, '⚠️ ', 'NEWS_API_KEY not found - this is optional but recommended');
    results.warnings.push('NewsAPI (optional)');
    return false;
  }
  
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Bitcoin OR Trump OR Election',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 5,
        apiKey: process.env.NEWS_API_KEY
      }
    });
    
    if (response.data && response.data.articles && response.data.articles.length > 0) {
      log(colors.green, '✅', `NewsAPI working! Found ${response.data.articles.length} articles`);
      log(colors.blue, '   ', `Sample: "${response.data.articles[0].title}"`);
      results.passed.push('NewsAPI');
      return true;
    }
  } catch (error) {
    log(colors.red, '❌', `NewsAPI failed: ${error.message}`);
    if (error.response && error.response.status === 401) {
      log(colors.red, '   ', 'Invalid API key. Get one at: https://newsapi.org/');
    }
    results.failed.push('NewsAPI');
    return false;
  }
}

// ============================================
// 4. TWITTER API TEST (Optional)
// ============================================
async function testTwitter() {
  log(colors.blue, '🔍', 'Testing Twitter API...');
  
  if (!process.env.TWITTER_BEARER_TOKEN) {
    log(colors.yellow, '⚠️ ', 'TWITTER_BEARER_TOKEN not found - skipping (Twitter is optional)');
    log(colors.yellow, '   ', 'Note: Twitter API costs $200/month. We can skip this for hackathon.');
    results.warnings.push('Twitter API (optional, expensive)');
    return false;
  }
  
  try {
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: 'Bitcoin -is:retweet',
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics'
      },
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    });
    
    if (response.data && response.data.data) {
      log(colors.green, '✅', `Twitter API working! Found ${response.data.data.length} tweets`);
      results.passed.push('Twitter API');
      return true;
    }
  } catch (error) {
    log(colors.red, '❌', `Twitter API failed: ${error.message}`);
    if (error.response && error.response.status === 401) {
      log(colors.red, '   ', 'Invalid bearer token');
    } else if (error.response && error.response.status === 429) {
      log(colors.red, '   ', 'Rate limited');
    }
    results.failed.push('Twitter API');
    return false;
  }
}

// ============================================
// 5. TWILIO WHATSAPP TEST (Optional)
// ============================================
async function testTwilio() {
  log(colors.blue, '🔍', 'Testing Twilio WhatsApp...');
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    log(colors.yellow, '⚠️ ', 'Twilio credentials not found - skipping (optional feature)');
    log(colors.yellow, '   ', 'WhatsApp alerts are a "wow factor" but not required for MVP');
    results.warnings.push('Twilio WhatsApp (optional)');
    return false;
  }
  
  try {
    // Just verify credentials by fetching account info
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}.json`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    log(colors.green, '✅', 'Twilio credentials valid!');
    log(colors.blue, '   ', 'Account status: ' + response.data.status);
    results.passed.push('Twilio');
    return true;
  } catch (error) {
    log(colors.red, '❌', `Twilio failed: ${error.message}`);
    results.failed.push('Twilio');
    return false;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function main() {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🚀', 'POLYMARKET SIGNAL - API VERIFICATION');
  console.log('='.repeat(60) + '\n');
  
  // Check .env file exists
  if (!require('fs').existsSync('.env')) {
    log(colors.red, '❌', '.env file not found!');
    log(colors.yellow, '   ', 'Create a .env file with your API keys. Example:');
    console.log('\n--- Copy this to .env ---\n');
    console.log('ANTHROPIC_API_KEY=sk-ant-...');
    console.log('NEWS_API_KEY=...');
    console.log('TWITTER_BEARER_TOKEN=...  # Optional');
    console.log('TWILIO_ACCOUNT_SID=...    # Optional');
    console.log('TWILIO_AUTH_TOKEN=...     # Optional');
    console.log('\n--- End of .env template ---\n');
    process.exit(1);
  }
  
  // Run all tests
  await testPolymarket();
  console.log('');
  
  await testClaude();
  console.log('');
  
  await testNewsAPI();
  console.log('');
  
  await testTwitter();
  console.log('');
  
  await testTwilio();
  console.log('');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '📊', 'VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  if (results.passed.length > 0) {
    log(colors.green, '✅', `Passed (${results.passed.length}):`);
    results.passed.forEach(api => console.log(`   - ${api}`));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    log(colors.red, '❌', `Failed (${results.failed.length}):`);
    results.failed.forEach(api => console.log(`   - ${api}`));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    log(colors.yellow, '⚠️ ', `Warnings (${results.warnings.length}):`);
    results.warnings.forEach(api => console.log(`   - ${api}`));
    console.log('');
  }
  
  // Final verdict
  const criticalApis = ['Polymarket API', 'Claude API'];
  const criticalPassed = criticalApis.every(api => results.passed.includes(api));
  
  if (criticalPassed) {
    log(colors.green, '🎉', 'ALL CRITICAL APIS WORKING!');
    log(colors.green, '   ', 'You can proceed with building the project.');
    
    if (results.failed.length > 0 || results.warnings.length > 0) {
      log(colors.yellow, '   ', 'Optional features may be limited, but core functionality will work.');
    }
  } else {
    log(colors.red, '💥', 'CRITICAL APIS FAILED!');
    log(colors.red, '   ', 'Fix these before starting the project:');
    criticalApis.forEach(api => {
      if (!results.passed.includes(api)) {
        log(colors.red, '   ', `- ${api}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the tests
main().catch(console.error);
