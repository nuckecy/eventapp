import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import type { User as PrismaUser } from "@prisma/client"

/**
 * Extend NextAuth types to include custom user properties
 * This allows TypeScript to recognize our custom user fields in session
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      departmentId?: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    departmentId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    departmentId?: string
  }
}

/**
 * NextAuth.js v5 Configuration
 *
 * Features:
 * - Credentials provider for email/password authentication
 * - JWT session strategy for stateless authentication
 * - Custom callbacks to include user role in session
 * - Secure session cookies with HTTP-only and SameSite flags
 * - CSRF protection enabled by default
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database session management (optional)
  // Comment out if using JWT-only strategy
  adapter: PrismaAdapter(prisma) as any,

  // Session strategy: JWT (stateless) or Database (stateful)
  session: {
    strategy: "jwt", // Use JWT for stateless authentication
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        // Validate credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
            hashedPassword: true,
          },
        })

        // Check if user exists
        if (!user) {
          throw new Error("Invalid email or password")
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          credentials.password,
          user.hashedPassword
        )

        if (!isValidPassword) {
          throw new Error("Invalid email or password")
        }

        // Return user object (excluding password)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId || undefined,
        }
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/login", // Custom login page
    error: "/login", // Error page (redirect to login with error)
    // signOut: '/logout', // Custom sign out page
    // verifyRequest: '/verify-email', // Email verification page
  },

  // Callbacks to customize session and JWT
  callbacks: {
    /**
     * JWT Callback
     * This callback is called whenever a JWT is created or updated
     * Add custom fields to the token here
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.departmentId = user.departmentId
      }

      // Handle session update (e.g., after profile update)
      if (trigger === "update" && session) {
        token.name = session.user.name
        token.email = session.user.email
      }

      return token
    },

    /**
     * Session Callback
     * This callback is called whenever a session is checked
     * Add custom fields from JWT to session here
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.departmentId = token.departmentId
      }

      return session
    },

    /**
     * Sign In Callback
     * Control whether user is allowed to sign in
     * Return true to allow, false to deny
     */
    async signIn({ user, account, profile }) {
      // Add custom sign-in logic here
      // For example, check if user email is verified
      // if (!user.emailVerified) {
      //   return false
      // }

      return true
    },

    /**
     * Redirect Callback
     * Control where user is redirected after sign in/out
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      return baseUrl
    },
  },

  // Security options
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true, // Prevents JavaScript access to cookie
        sameSite: "lax", // CSRF protection
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
      },
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT signing and encryption
  secret: process.env.NEXTAUTH_SECRET,
}
