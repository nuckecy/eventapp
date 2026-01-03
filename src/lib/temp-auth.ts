// Temporary authentication using direct database access
// This bypasses Supabase Auth until the anon key is configured
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { verifyPassword } from "./auth-utils"
import type { Role } from "@prisma/client"

interface TempSession {
  user: {
    id: string
    email: string
    name: string
    role: Role
    departmentId: string | null
  }
}

// Create a simple session token
function createSessionToken(userId: string): string {
  const timestamp = Date.now()
  return Buffer.from(`${userId}:${timestamp}`).toString('base64')
}

// Parse session token
function parseSessionToken(token: string): { userId: string, timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId, timestamp] = decoded.split(':')
    return { userId, timestamp: parseInt(timestamp) }
  } catch {
    return null
  }
}

// Sign in with email and password using database directly
export async function tempSignIn(email: string, password: string): Promise<{ success: boolean, user?: TempSession['user'], error?: string }> {
  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true }
    })

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    // Check password
    const validPassword = user.hashedPassword && await verifyPassword(password, user.hashedPassword)
    if (!validPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    // Create session
    const sessionToken = createSessionToken(user.id)
    const cookieStore = await cookies()

    // Set session cookie (expires in 30 days)
    cookieStore.set('temp-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId
      }
    }
  } catch (error) {
    console.error("Temp sign in error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Get current session from cookies
export async function getTempSession(): Promise<TempSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('temp-session')?.value

    if (!sessionToken) {
      return null
    }

    const parsed = parseSessionToken(sessionToken)
    if (!parsed) {
      return null
    }

    // Check if session is not too old (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    if (parsed.timestamp < thirtyDaysAgo) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
      include: { department: true }
    })

    if (!user) {
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId
      }
    }
  } catch {
    return null
  }
}

// Sign out
export async function tempSignOut() {
  const cookieStore = await cookies()
  cookieStore.delete('temp-session')
}

// Get current user
export async function getTempCurrentUser() {
  const session = await getTempSession()
  return session?.user || null
}