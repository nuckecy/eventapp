"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "./UserMenu"
import { NotificationBell } from "./NotificationBell"
import { cn } from "@/lib/utils"

export type UserRole = "member" | "lead" | "admin" | "superadmin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface NavBarProps {
  user?: User | null
  className?: string
}

const getRoleBadgeColor = (role: UserRole) => {
  const colors = {
    member: "bg-blue-100 text-blue-800",
    lead: "bg-green-100 text-green-800",
    admin: "bg-yellow-100 text-yellow-800",
    superadmin: "bg-red-100 text-red-800",
  }
  return colors[role]
}

const getRoleLabel = (role: UserRole) => {
  const labels = {
    member: "Member",
    lead: "Lead",
    admin: "Administrator",
    superadmin: "Super Admin",
  }
  return labels[role]
}

export function NavBar({ user, className }: NavBarProps) {
  const isAuthenticated = !!user
  const isMember = user?.role === "member"
  const isStaff = user && ["lead", "admin", "superadmin"].includes(user.role)

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label="Go to Church Events home page"
          >
            <span>Church Events</span>
          </Link>

          {/* Contact Us - Always visible */}
          <Link
            href="/contact"
            className="hidden md:block"
          >
            <Button
              variant="ghost"
              size="sm"
              aria-label="Contact us page"
            >
              Contact Us
            </Button>
          </Link>

          {/* Calendar button - Only for Members */}
          {isMember && (
            <Link href="/" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                aria-label="View calendar"
              >
                Calendar
              </Button>
            </Link>
          )}
        </div>

        {/* Right side - Auth dependent */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Contact Us */}
          <Link href="/contact" className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Contact us page"
            >
              Contact
            </Button>
          </Link>

          {!isAuthenticated ? (
            // Public view - Not logged in
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                aria-label="Log in to your account"
              >
                Login
              </Button>
            </Link>
          ) : (
            // Authenticated view
            <>
              {/* User name (visible on larger screens) */}
              <span className="hidden lg:inline-block text-sm font-medium text-foreground">
                {user.name}
              </span>

              {/* Role Badge */}
              <Badge
                className={cn(
                  "hidden sm:inline-flex",
                  getRoleBadgeColor(user.role)
                )}
                aria-label={`User role: ${getRoleLabel(user.role)}`}
              >
                {getRoleLabel(user.role)}
              </Badge>

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Menu (includes Logout) */}
              <UserMenu user={user} />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
