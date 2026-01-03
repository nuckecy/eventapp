// Test Supabase Auth setup
// Run with: pnpm tsx scripts/test-supabase-auth.ts

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testAuth() {
  console.log('🧪 Testing Supabase Auth...')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET')

  // Try to sign in with a test account
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'superadmin@rccgnewsongberlin.org',
    password: 'PassWord2021'
  })

  if (error) {
    console.log('❌ Sign in failed:', error.message)
  } else if (data.user) {
    console.log('✅ Sign in successful!')
    console.log('User ID:', data.user.id)
    console.log('Email:', data.user.email)
  }

  // Sign out
  await supabase.auth.signOut()
  console.log('✅ Signed out')
}

testAuth().catch(console.error)