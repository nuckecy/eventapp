import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * NextAuth Middleware for Route Protection
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
 * - Role-based access control in callbacks
 * - CSRF protection via NextAuth
 */

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based access control
    // You can add custom logic here to restrict access based on user role
    if (pathname.startsWith("/dashboard/super-admin")) {
      if (token?.role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    if (pathname.startsWith("/dashboard/admin")) {
      if (token?.role !== "admin" && token?.role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    if (pathname.startsWith("/dashboard/lead")) {
      if (
        token?.role !== "lead" &&
        token?.role !== "admin" &&
        token?.role !== "superadmin"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      /**
       * Authorized callback
       * Return true to allow access, false to redirect to login
       */
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow access to public routes without authentication
        const publicRoutes = [
          "/",
          "/contact",
          "/login",
          "/api/events",
          "/api/departments",
        ]

        // Check if route is public
        if (publicRoutes.some((route) => pathname === route)) {
          return true
        }

        // Allow API auth routes
        if (pathname.startsWith("/api/auth")) {
          return true
        }

        // Protect all other routes - require authentication
        return !!token
      },
    },
    pages: {
      signIn: "/login", // Redirect to custom login page
    },
  }
)

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
