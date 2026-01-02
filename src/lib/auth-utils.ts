import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import type { Role } from "@prisma/client"

/**
 * Hash password using bcryptjs
 * Uses 10 rounds of salting as recommended for security
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10 // Recommended for production use
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Get current session on server-side
 * This function can be used in Server Components, Server Actions, and API Routes
 * NextAuth v5 uses the auth() function instead of getServerSession()
 * @returns Session object or null if not authenticated
 */
export async function getSession() {
  return await auth()
}

/**
 * Get current user from session
 * @returns User object from session or null
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this in Server Components or Server Actions that require authentication
 * @param redirectTo - Path to redirect to after login (default: current path)
 * @returns Session object
 */
export async function requireAuth(redirectTo?: string) {
  const session = await getSession()

  if (!session || !session.user) {
    const callbackUrl = redirectTo || "/login"
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  return session
}

/**
 * Require specific role(s) - redirect if user doesn't have required role
 * Use this in Server Components or Server Actions that require specific roles
 * @param roles - Array of allowed roles
 * @param redirectTo - Path to redirect to if unauthorized (default: /dashboard)
 * @returns Session object
 */
export async function requireRole(roles: Role[], redirectTo?: string) {
  const session = await requireAuth()

  if (!roles.includes(session.user.role as Role)) {
    redirect(redirectTo || "/dashboard")
  }

  return session
}

/**
 * Check if user has specific role
 * @param role - Role to check
 * @returns True if user has role, false otherwise
 */
export async function hasRole(role: Role): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === role
}

/**
 * Check if user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns True if user has any of the roles, false otherwise
 */
export async function hasAnyRole(roles: Role[]): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role ? roles.includes(session.user.role as Role) : false
}

/**
 * Get redirect path based on user role
 * Used after login to redirect users to their appropriate dashboard
 * @param role - User role
 * @returns Redirect path
 */
export function getRoleRedirectPath(role: Role): string {
  switch (role) {
    case "superadmin":
      return "/dashboard/super-admin"
    case "admin":
      return "/dashboard/admin"
    case "lead":
      return "/dashboard/lead"
    case "member":
      return "/" // Members go to public calendar
    default:
      return "/"
  }
}

/**
 * Rate limiting helper (comment)
 * Note: For production, implement rate limiting using libraries like:
 * - @upstash/ratelimit (for Redis-based rate limiting)
 * - next-rate-limit (for in-memory rate limiting)
 * - vercel/kv (for Vercel KV-based rate limiting)
 *
 * Example implementation:
 *
 * import { Ratelimit } from "@upstash/ratelimit"
 * import { Redis } from "@upstash/redis"
 *
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 requests per 10 minutes
 * })
 *
 * export async function checkRateLimit(identifier: string) {
 *   const { success } = await ratelimit.limit(identifier)
 *   return success
 * }
 */
