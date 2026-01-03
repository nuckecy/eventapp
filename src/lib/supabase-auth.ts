import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'
import { tempSignIn, getTempSession, getTempCurrentUser, tempSignOut } from './temp-auth'

/**
 * Sign in with email and password
 * Links Supabase auth with our Prisma user data
 * Falls back to temporary auth if Supabase key is invalid
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  // Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If Supabase auth fails due to invalid API key or email not confirmed, use temporary auth
  if (error && (error.message.includes('Invalid API key') || error.message.includes('Email not confirmed'))) {
    console.log('Using temporary database auth due to:', error.message)
    const result = await tempSignIn(email, password)

    if (result.success && result.user) {
      return {
        data: {
          user: result.user
        }
      }
    }
    return { error: result.error || 'Authentication failed' }
  }

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Get or create user in our database
    let user = await prisma.user.findUnique({
      where: { email: data.user.email! }
    })

    if (!user) {
      // User exists in Supabase but not in our DB (shouldn't happen)
      return { error: 'User configuration error. Please contact admin.' }
    }

    // Update supabaseId if not set
    if (!user.supabaseId) {
      user = await prisma.user.update({
        where: { email: data.user.email! },
        data: { supabaseId: data.user.id }
      })
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          departmentId: user.departmentId,
        }
      }
    }
  }

  return { error: 'Authentication failed' }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  // Try to sign out from both Supabase and temp auth
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  // Also clear temp session if it exists
  await tempSignOut()

  return { error: error?.message }
}

/**
 * Get the current user session
 */
export async function getSession() {
  // First try Supabase auth
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Fallback to temporary auth
    const tempSession = await getTempSession()
    if (tempSession) {
      // Return a session-like object for compatibility
      return {
        user: tempSession.user,
        access_token: 'temp-token',
        token_type: 'bearer',
        expires_in: 0,
        expires_at: 0,
        refresh_token: 'temp-refresh'
      }
    }
    return null
  }

  // Get user details from our database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
    }
  })

  if (!user) {
    return null
  }

  return {
    ...session,
    user: {
      ...session.user,
      ...user,
    }
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const session = await getSession()
  if (session?.user) {
    return session.user
  }

  // Fallback to temp auth
  const tempUser = await getTempCurrentUser()
  return tempUser
}

/**
 * Create a new user in Supabase and our database
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: Role,
  departmentId?: string
) {
  const supabase = await createClient()

  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create user in our database
    const user = await prisma.user.create({
      data: {
        supabaseId: data.user.id,
        email: data.user.email!,
        name,
        role,
        departmentId,
        emailVerified: new Date(),
      }
    })

    return { data: { user } }
  }

  return { error: 'Failed to create user' }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    member: 1,
    lead: 2,
    admin: 3,
    superadmin: 4,
  }

  return roleHierarchy[userRole as Role] >= roleHierarchy[requiredRole]
}

/**
 * Get redirect path based on user role
 */
export function getRoleRedirectPath(role: string): string {
  switch (role) {
    case 'superadmin':
      return '/dashboard/super-admin'
    case 'admin':
      return '/dashboard/admin'
    case 'lead':
      return '/dashboard/department'
    case 'member':
      return '/dashboard/member'
    default:
      return '/'
  }
}