// Sign up users in Supabase Auth using the normal sign-up flow
// Run with: pnpm tsx scripts/signup-users-supabase.ts

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

// Initialize Supabase client with anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function signupUsers() {
  console.log('🚀 Creating users in Supabase Auth...')

  try {
    // Get all users from database
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users to create in Supabase`)

    for (const user of users) {
      console.log(`\n👤 Creating Supabase Auth user: ${user.email}`)

      try {
        // Try to sign up the user
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: 'PassWord2021', // Default password for all users
          options: {
            data: {
              name: user.name,
              role: user.role,
            }
          }
        })

        if (error) {
          // Check if user already exists
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            console.log(`  ⚠️ User already exists in Supabase Auth`)

            // Try to sign in to get the user ID
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: 'PassWord2021'
            })

            if (signInData?.user) {
              // Update our database with the Supabase ID
              await prisma.user.update({
                where: { id: user.id },
                data: { supabaseId: signInData.user.id }
              })
              console.log(`  ✅ Linked existing Supabase user`)

              // Sign out to continue with other users
              await supabase.auth.signOut()
            } else if (signInError) {
              console.log(`  ⚠️ User exists but couldn't sign in (may have different password)`)
            }
          } else {
            console.error(`  ❌ Error: ${error.message}`)
          }
        } else if (data.user) {
          // Update our database with the Supabase ID
          await prisma.user.update({
            where: { id: user.id },
            data: { supabaseId: data.user.id }
          })
          console.log(`  ✅ Created and linked Supabase user`)

          // Sign out to continue with other users
          await supabase.auth.signOut()
        }
      } catch (err) {
        console.error(`  ❌ Failed to create ${user.email}:`, err)
      }
    }

    console.log('\n✨ User creation completed!')
    console.log('\n📝 All users can now log in with:')
    console.log('   Password: PassWord2021')
    console.log('\n⚠️  Note: Email confirmation may be required depending on your Supabase settings.')
    console.log('   Check your Supabase dashboard to disable email confirmation if needed.')

  } catch (error) {
    console.error('User creation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run signup
signupUsers()