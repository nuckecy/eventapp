import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth.js Route Handler
 *
 * This file creates the dynamic API route that handles all NextAuth.js requests:
 * - GET  /api/auth/signin - Sign in page
 * - POST /api/auth/signin/:provider - Sign in with provider
 * - GET  /api/auth/signout - Sign out page
 * - POST /api/auth/signout - Sign out
 * - GET  /api/auth/session - Get session
 * - GET  /api/auth/csrf - Get CSRF token
 * - GET  /api/auth/providers - Get configured providers
 * - GET  /api/auth/callback/:provider - OAuth callback
 * - POST /api/auth/callback/:provider - OAuth callback
 *
 * NextAuth v5 uses the App Router and requires both GET and POST handlers
 */

const handler = NextAuth(authOptions)

// Export both GET and POST handlers for Next.js App Router
export { handler as GET, handler as POST }
