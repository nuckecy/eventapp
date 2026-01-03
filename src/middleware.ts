import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { prisma } from "@/lib/prisma"

/**
 * Supabase Auth Middleware for Route Protection
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
 * - /api/auth/* - Auth API routes
 * - /api/events - Public events API
 * - /api/departments - Public departments API
 *
 * Features:
 * - Automatic redirect to /login for unauthenticated users
 * - Preserves callback URL for post-login redirect
 * - Role-based access control
 * - Session refresh via Supabase
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

  // Update Supabase session
  const { supabase, user, response } = await updateSession(request)

  // Allow public routes without authentication
  if (isPublicRoute || isAuthRoute) {
    return response
  }

  // Check for temporary session if no Supabase user
  let hasValidSession = !!user
  let userId = user?.id

  if (!hasValidSession) {
    // Check for temporary auth session cookie
    const tempSession = request.cookies.get('temp-session')
    if (tempSession) {
      try {
        // Parse the session token to get user ID
        const decoded = Buffer.from(tempSession.value, 'base64').toString()
        const [tempUserId, timestamp] = decoded.split(':')
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)

        if (tempUserId && parseInt(timestamp) > thirtyDaysAgo) {
          hasValidSession = true
          userId = tempUserId
        }
      } catch (error) {
        console.error('Error parsing temp session:', error)
      }
    }
  }

  // If no valid session and accessing protected route, redirect to login
  if (!hasValidSession) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Get user role from database
  // Note: In production, you might want to cache this in the session
  try {
    // Find user by supabaseId or regular id (for temp auth)
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: userId },
          { id: userId }
        ]
      },
      select: { role: true }
    })

    if (!dbUser) {
      // User not found in DB - redirect to login
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Role-based access control for specific dashboard routes
    if (pathname.startsWith("/dashboard/super-admin")) {
      if (dbUser.role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    if (pathname.startsWith("/dashboard/admin")) {
      if (dbUser.role !== "admin" && dbUser.role !== "superadmin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    if (pathname.startsWith("/dashboard/lead")) {
      if (
        dbUser.role !== "lead" &&
        dbUser.role !== "admin" &&
        dbUser.role !== "superadmin"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  } catch (error) {
    console.error("Error checking user role:", error)
    // On error, redirect to login
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Allow the request to proceed
  return response
}

/**
 * Matcher Configuration
 *
 * Define which routes this middleware should run on.
 * Using negative lookahead to exclude static files and Next.js internals.
 *
 * Protected patterns:
 * - /dashboard/* - Dashboard routes
 * - /requests/* - Event request management
 * - /profile/* - User profile pages
 * - All other routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (metadata files)
     * - Images, fonts, and other static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
}