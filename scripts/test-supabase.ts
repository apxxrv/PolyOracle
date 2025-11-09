import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection\n');

  try {
    // Test with anon key
    console.log('Testing with anon key...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('markets')
      .select('count')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('⚠️  Tables not created yet - that\'s expected!');
      console.log('   You need to run the schema.sql in Supabase SQL Editor first.\n');
      console.log('📋 Steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/mvftgorbwdvmbsjcbcqe/sql');
      console.log('2. Copy contents of: supabase/schema.sql');
      console.log('3. Paste and click "Run"');
      console.log('4. Run this test again\n');
      process.exit(0);
    } else if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Supabase connection works!');
      console.log('✅ Database tables exist!');
      console.log(`   Found markets table (${data?.length || 0} records)\n`);

      // Test service role
      console.log('Testing service role key...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { error: adminError } = await supabaseAdmin
        .from('markets')
        .select('count')
        .limit(1);

      if (adminError) {
        console.log('❌ Service role key failed:', adminError.message);
        process.exit(1);
      }

      console.log('✅ Service role key works!\n');
      console.log('🎉 Supabase is fully configured and ready!');
      console.log('\n✅ Next: Start building API integrations!');
      process.exit(0);
    }
  } catch (error: any) {
    console.log('❌ Connection test failed:', error.message);
    console.log('\nCheck your .env.local file has:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('- SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
}

testSupabaseConnection();
