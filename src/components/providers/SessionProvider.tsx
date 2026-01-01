"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

/**
 * Session Provider Component
 *
 * This is a client-side wrapper for NextAuth's SessionProvider.
 * It needs to be a separate client component because SessionProvider
 * uses React Context, which requires client-side rendering.
 *
 * Usage:
 * Wrap your app or layout with this provider to enable session access
 * throughout your application.
 *
 * Example in layout.tsx:
 * ```tsx
 * import { SessionProvider } from "@/components/providers"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>
 *           {children}
 *         </SessionProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

interface SessionProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
