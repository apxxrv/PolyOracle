import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { generateSignals } from '../lib/engine/signal-generator';

/**
 * Test the signal generation engine locally
 * This simulates what the cron job will do every 5 minutes
 */
async function testCron() {
  console.log('🧪 Testing Cron Job Signal Generation\n');
  console.log('This simulates the automated signal generation process');
  console.log('='.repeat(70));

  const startTime = Date.now();

  try {
    // Run signal generation (same parameters as cron job)
    console.log('\n🚀 Starting signal generation...\n');

    const result = await generateSignals(10, 50000);

    const executionTime = Date.now() - startTime;

    // Display results
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 CRON JOB SIMULATION RESULTS\n');
    console.log(`Success: ${result.success ? '✅' : '❌'}`);
    console.log(`Execution Time: ${executionTime}ms (${(executionTime / 1000).toFixed(1)}s)`);
    console.log(`Signals Generated: ${result.signalsGenerated}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    if (result.signals.length > 0) {
      console.log('\n🎯 Signals Stored:');
      result.signals.forEach((signal, i) => {
        console.log(`\n  ${i + 1}. Signal ID: ${signal.id}`);
        console.log(`     Market: ${signal.market_id}`);
        console.log(`     Score: ${signal.score}/100`);
        console.log(`     Action: ${signal.action}`);
        console.log(`     Confidence: ${signal.confidence}`);
        console.log(`     Urgency: ${signal.urgency}`);
        if (signal.entry_price) {
          console.log(`     Entry: $${signal.entry_price}`);
        }
        if (signal.target_price) {
          console.log(`     Target: $${signal.target_price}`);
        }
        console.log(`     Data: ${signal.whale_count} whale trades, ${signal.news_count} news, ${signal.reddit_count} Reddit`);
      });
    } else {
      console.log('\n⚠️  No signals generated (no markets scored >= 70)');
    }

    console.log('\n' + '='.repeat(70));

    if (result.success && result.signalsGenerated > 0) {
      console.log('\n✅ Cron job test PASSED!');
      console.log('🚀 Ready for Phase 7: Dashboard UI\n');
    } else if (result.success && result.signalsGenerated === 0) {
      console.log('\n⚠️  Cron job working, but no high-score signals found');
      console.log('💡 This is normal - try again or lower the score threshold\n');
    } else {
      console.log('\n❌ Cron job test FAILED - check errors above\n');
      process.exit(1);
    }

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('\n❌ Cron test failed:', error.message);
    console.error(`Execution time: ${executionTime}ms`);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

testCron();
