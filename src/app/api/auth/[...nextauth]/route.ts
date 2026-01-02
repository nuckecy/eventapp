import { handlers } from "@/lib/auth"

/**
 * NextAuth.js v5 Route Handler
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

// Export both GET and POST handlers from the auth configuration
export const { GET, POST } = handlers
