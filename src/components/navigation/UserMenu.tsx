"use client"

import { useState } from "react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import type { User as UserType, UserRole } from "./NavBar"

interface UserMenuProps {
  user: UserType
  onLogout?: () => void
}

const getDashboardUrl = (role: UserRole) => {
  const dashboardUrls = {
    member: "/profile",
    lead: "/dashboard/lead",
    admin: "/dashboard/admin",
    superadmin: "/dashboard/super-admin",
  }
  return dashboardUrls[role]
}

const getDashboardLabel = (role: UserRole) => {
  if (role === "member") return "Profile"
  return "Dashboard"
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const initials = getInitials(user.name)
  const dashboardUrl = getDashboardUrl(user.role)
  const dashboardLabel = getDashboardLabel(user.role)

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior - can be replaced with actual auth logout
      window.location.href = "/api/auth/signout"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`User menu for ${user.name}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
        sideOffset={8}
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard/Profile Link */}
        <DropdownMenuItem asChild>
          <Link
            href={dashboardUrl}
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{dashboardLabel}</span>
          </Link>
        </DropdownMenuItem>

        {/* Profile Settings (for staff roles) */}
        {user.role !== "member" && (
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Settings (Optional - can be enabled later) */}
        {/* <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
