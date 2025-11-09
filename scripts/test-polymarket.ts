import { getActiveMarkets, detectWhaleTrades } from '../lib/api/polymarket';

async function test() {
  console.log('🔍 Testing Polymarket API client...\n');

  // Test 1: Get active markets
  console.log('1️⃣ Fetching active markets...');
  const markets = await getActiveMarkets();
  console.log(`✅ Found ${markets.length} markets`);
  console.log(`   Sample: "${markets[0].question}"\n`);

  // Test 2: Detect whale trades in first market
  console.log('2️⃣ Detecting whale trades...');
  const marketId = markets[0].condition_id;
  const whales = await detectWhaleTrades(marketId);
  console.log(`✅ Found ${whales.length} whale trades (>$10K)`);
  
  if (whales.length > 0) {
    console.log(`   Largest: $${whales[0].size_usd.toFixed(2)}`);
  } else {
    console.log('   (No whale trades in this market - this is normal)');
  }

  console.log('\n🎉 Polymarket client working!');
}

test().catch(console.error);
