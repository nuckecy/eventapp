// Run with: pnpm tsx scripts/migrate-to-supabase-auth.ts

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

// Initialize Supabase Admin client
// Note: You need the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Service role key needed for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function migrateUsers() {
  console.log('🚀 Starting user migration to Supabase Auth...')

  try {
    // Get all users from database
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users to migrate`)

    for (const user of users) {
      console.log(`\n👤 Migrating user: ${user.email}`)

      try {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'PassWord2021', // Default password for all users
          email_confirm: true, // Auto-confirm email
        })

        if (error) {
          if (error.message.includes('already registered')) {
            console.log(`  ⚠️ User already exists in Supabase Auth`)
            // Get the existing user
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const existingUser = existingUsers?.users?.find(u => u.email === user.email)

            if (existingUser) {
              // Update our database with the Supabase ID
              await prisma.user.update({
                where: { id: user.id },
                data: { supabaseId: existingUser.id }
              })
              console.log(`  ✅ Linked existing Supabase user`)
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
        }
      } catch (err) {
        console.error(`  ❌ Failed to migrate ${user.email}:`, err)
      }
    }

    console.log('\n✨ Migration completed!')
    console.log('\n📝 All users can now log in with:')
    console.log('   Password: PassWord2021')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateUsers()