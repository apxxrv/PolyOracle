import { getActiveMarkets, detectWhaleTrades, getWhaleVolume } from '../lib/api/polymarket';

async function test() {
  console.log('🧪 Testing Polymarket API Client\n');

  try {
    // Test 1: Get active markets
    console.log('1️⃣  Fetching active markets...');
    const markets = await getActiveMarkets(5);

    if (markets.length === 0) {
      console.log('⚠️  No active markets found\n');
      return;
    }

    console.log(`✅ Found ${markets.length} active markets`);
    markets.forEach((market, index) => {
      console.log(`   ${index + 1}. ${market.question}`);
      console.log(`      Volume: $${parseFloat(market.volume).toLocaleString()}`);
      console.log(`      Condition ID: ${market.condition_id}\n`);
    });

    // Test 2: Detect whale trades for first market
    console.log('2️⃣  Detecting whale trades for first market...');
    const firstMarket = markets[0];
    const whaleTrades = await detectWhaleTrades(firstMarket.condition_id);

    if (whaleTrades.length === 0) {
      console.log('   No whale trades detected (>$10K)');
      console.log('   (This is normal - whale trades are rare)\n');
    } else {
      console.log(`✅ Found ${whaleTrades.length} whale trade(s):`);
      whaleTrades.slice(0, 3).forEach((trade, index) => {
        const tradeSize = parseFloat(trade.size) * parseFloat(trade.price);
        console.log(`   ${index + 1}. ${trade.side} - $${tradeSize.toLocaleString()}`);
        console.log(`      Price: $${trade.price}, Size: ${trade.size}\n`);
      });

      // Test 3: Calculate total whale volume
      const totalWhaleVolume = await getWhaleVolume(firstMarket.condition_id);
      console.log(`💰 Total whale volume: $${totalWhaleVolume.toLocaleString()}\n`);
    }

    console.log('🎉 Polymarket client test complete!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
