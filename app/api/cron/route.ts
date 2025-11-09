import { NextRequest, NextResponse } from 'next/server';
import { generateSignals } from '@/lib/engine/signal-generator';

/**
 * Cron job endpoint for automated signal generation
 * Triggered every 5 minutes by Vercel Cron
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Cron job started at', new Date().toISOString());

    // Generate signals (analyze top 10 markets with volume > $50K)
    const result = await generateSignals(10, 50000);

    const executionTime = Date.now() - startTime;

    console.log(`✅ Cron job completed in ${executionTime}ms`);

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      execution_time_ms: executionTime,
      signals_generated: result.signalsGenerated,
      errors: result.errors,
      signals: result.signals.map(s => ({
        id: s.id,
        market_id: s.market_id,
        score: s.score,
        action: s.action,
        confidence: s.confidence
      }))
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Cron job failed:', error.message);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        execution_time_ms: executionTime,
        error: error.message,
        signals_generated: 0
      },
      { status: 500 }
    );
  }
}

/**
 * Allow POST requests for manual testing
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
