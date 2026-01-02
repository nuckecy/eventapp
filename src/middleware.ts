import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * NextAuth v5 Middleware for Route Protection
 *
 * This middleware protects routes that require authentication.
 * It runs before every request and checks if the user is authenticated.
 *
 * Protected Routes:
 * - /dashboard/* - All dashboard routes (lead, admin, super-admin)
 * - /requests/* - Event request management routes
 * - /profile/* - User profile routes
 *
 * Public Routes (explicitly allowed):
 * - / - Public calendar (home page)
 * - /contact - Contact Us page
 * - /login - Login page
 * - /api/auth/* - NextAuth API routes
 * - /api/events - Public events API
 * - /api/departments - Public departments API
 *
 * Features:
 * - Automatic redirect to /login for unauthenticated users
 * - Preserves callback URL for post-login redirect
 * - Role-based access control
 * - CSRF protection via NextAuth
 */

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/contact",
    "/login",
    "/api/events",
    "/api/departments",
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // Allow API auth routes
  const isAuthRoute = pathname.startsWith("/api/auth")

  // Allow public routes and auth routes without authentication
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next()
  }

  // Get the token using NextAuth's getToken helper
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // If no token and accessing protected route, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access control for specific dashboard routes
  if (pathname.startsWith("/dashboard/super-admin")) {
    if (token.role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (token.role !== "admin" && token.role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (pathname.startsWith("/dashboard/lead")) {
    if (
      token.role !== "lead" &&
      token.role !== "admin" &&
      token.role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

/**
 * Matcher Configuration
 *
 * Define which routes this middleware should run on.
 * Using negative lookahead to exclude static files and Next.js internals.
 *
 * Protected patterns:
 * - /dashboard/:path* - All dashboard routes
 * - /requests/:path* - All request management routes
 * - /profile/:path* - All profile routes
 *
 * Excluded patterns:
 * - /_next/* - Next.js internals
 * - /api/auth/* - NextAuth routes (handled by NextAuth itself)
 * - /static/* - Static files
 * - /*.* - Files with extensions (images, fonts, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api/auth (NextAuth routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
}

/**
 * Rate Limiting Considerations
 *
 * For production, consider implementing rate limiting to prevent brute force attacks:
 *
 * 1. Login endpoint rate limiting (e.g., 5 attempts per 10 minutes per IP)
 * 2. API rate limiting (e.g., 100 requests per minute per user)
 * 3. Failed login attempt tracking and account lockout
 *
 * Recommended libraries:
 * - @upstash/ratelimit - Redis-based rate limiting
 * - next-rate-limit - In-memory rate limiting
 * - vercel/kv - Vercel KV-based rate limiting
 *
 * Example implementation in API route:
 * ```typescript
 * import { Ratelimit } from "@upstash/ratelimit"
 * import { Redis } from "@upstash/redis"
 *
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "10 m"),
 * })
 *
 * export async function POST(req: Request) {
 *   const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
 *   const { success } = await ratelimit.limit(ip)
 *
 *   if (!success) {
 *     return new Response("Too many requests", { status: 429 })
 *   }
 *
 *   // Continue with login logic...
 * }
 * ```
 */