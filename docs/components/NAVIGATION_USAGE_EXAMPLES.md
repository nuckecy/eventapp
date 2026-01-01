# Navigation Components - Usage Examples

This document provides practical examples of using the navigation components in different scenarios.

---

## Example 1: Basic Layout with Navigation

```tsx
// app/layout.tsx
import { NavBar } from "@/components/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <NavBar user={session?.user} />
        <main className="container mx-auto py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
```

---

## Example 2: Different User Roles

### Public User (Not Logged In)
```tsx
import { NavBar } from "@/components/navigation"

// No user prop - shows public view
<NavBar />
```

**Result**: Shows "Church Events", "Contact Us", "Login"

---

### Member User
```tsx
import { NavBar } from "@/components/navigation"

<NavBar
  user={{
    id: "mem-123",
    name: "John Member",
    email: "john@church.com",
    role: "member"
  }}
/>
```

**Result**: Shows "Church Events", "Contact Us", "Calendar", "John Member", Blue "Member" badge, Bell icon, User menu

---

### Lead User
```tsx
import { NavBar } from "@/components/navigation"

<NavBar
  user={{
    id: "lead-456",
    name: "Sarah Lead",
    email: "sarah@church.com",
    role: "lead"
  }}
/>
```

**Result**: Shows "Church Events", "Contact Us", "Sarah Lead", Green "Lead" badge, Bell icon, User menu

---

### Administrator User
```tsx
import { NavBar } from "@/components/navigation"

<NavBar
  user={{
    id: "admin-789",
    name: "Mike Admin",
    email: "mike@church.com",
    role: "admin"
  }}
/>
```

**Result**: Shows "Church Events", "Contact Us", "Mike Admin", Yellow "Administrator" badge, Bell icon, User menu

---

### Super Admin User
```tsx
import { NavBar } from "@/components/navigation"

<NavBar
  user={{
    id: "super-001",
    name: "Pastor Smith",
    email: "pastor@church.com",
    role: "superadmin"
  }}
/>
```

**Result**: Shows "Church Events", "Contact Us", "Pastor Smith", Red "Super Admin" badge, Bell icon, User menu

---

## Example 3: Custom Logout Handler

```tsx
"use client"

import { NavBar } from "@/components/navigation"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function Navigation({ user }) {
  const router = useRouter()

  const handleLogout = async () => {
    // Perform cleanup before logout
    localStorage.removeItem("draft")

    // Sign out
    await signOut({ redirect: false })

    // Redirect to home
    router.push("/")
    router.refresh()
  }

  return <NavBar user={user} />
}
```

---

## Example 4: Notification Integration

```tsx
"use client"

import { NotificationBell } from "@/components/navigation"
import { useNotifications } from "@/hooks/useNotifications"

export function NotificationCenter() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications()

  return (
    <NotificationBell
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onDismiss={dismissNotification}
    />
  )
}
```

### Custom Hook Example

```tsx
// hooks/useNotifications.ts
"use client"

import { useState, useEffect } from "react"
import type { Notification } from "@/components/navigation"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Fetch notifications from API
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    )
  }

  const markAllAsRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" })

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date() }))
    )
  }

  const dismissNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })

    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  }
}
```

---

## Example 5: Complete Client Component

```tsx
"use client"

import { NavBar, NotificationBell, UserMenu } from "@/components/navigation"
import type { User, Notification } from "@/components/navigation"
import { useSession } from "next-auth/react"
import { useNotifications } from "@/hooks/useNotifications"

export function NavigationBar() {
  const { data: session } = useSession()
  const notifications = useNotifications()

  if (!session?.user) {
    return <NavBar />
  }

  return (
    <NavBar user={session.user as User}>
      {/* You can customize the notification bell if needed */}
      <NotificationBell {...notifications} />
    </NavBar>
  )
}
```

---

## Example 6: Standalone UserMenu

If you need the UserMenu separately (e.g., in a sidebar):

```tsx
import { UserMenu } from "@/components/navigation"
import { signOut } from "next-auth/react"

export function Sidebar({ user }) {
  return (
    <aside className="w-64 border-r p-4">
      <div className="mb-6">
        <UserMenu
          user={user}
          onLogout={() => signOut()}
        />
      </div>

      {/* Rest of sidebar content */}
    </aside>
  )
}
```

---

## Example 7: Testing Components

### Jest/React Testing Library

```tsx
import { render, screen } from "@testing-library/react"
import { NavBar } from "@/components/navigation"

describe("NavBar", () => {
  it("shows login button when not authenticated", () => {
    render(<NavBar />)
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument()
  })

  it("shows user name when authenticated", () => {
    const user = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "member" as const,
    }

    render(<NavBar user={user} />)
    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("shows correct role badge for admin", () => {
    const user = {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin" as const,
    }

    render(<NavBar user={user} />)
    expect(screen.getByText("Administrator")).toBeInTheDocument()
  })
})
```

---

## Example 8: Customizing Styles

```tsx
import { NavBar } from "@/components/navigation"

// Custom styling
<NavBar
  user={user}
  className="bg-gradient-to-r from-primary to-secondary"
/>

// Or wrap in a container
<div className="shadow-lg">
  <NavBar user={user} />
</div>
```

---

## Example 9: Role-Based Dashboard Routing

The UserMenu automatically routes to the correct dashboard based on role:

| Role        | Dashboard URL              | Label      |
|-------------|---------------------------|------------|
| member      | `/profile`                | Profile    |
| lead        | `/dashboard/lead`         | Dashboard  |
| admin       | `/dashboard/admin`        | Dashboard  |
| superadmin  | `/dashboard/super-admin`  | Dashboard  |

You can customize these URLs by modifying the `getDashboardUrl` function in `UserMenu.tsx`.

---

## Example 10: Notification Types

The NotificationBell supports different notification types with color coding:

```tsx
const notifications: Notification[] = [
  {
    id: "1",
    title: "Success",
    message: "Your request was approved!",
    type: "success", // Green styling
    createdAt: new Date(),
    readAt: null,
  },
  {
    id: "2",
    title: "Information",
    message: "New event submitted",
    type: "info", // Blue styling
    createdAt: new Date(),
    readAt: null,
  },
  {
    id: "3",
    title: "Warning",
    message: "Request needs revision",
    type: "warning", // Yellow styling
    createdAt: new Date(),
    readAt: null,
  },
  {
    id: "4",
    title: "Error",
    message: "Submission failed",
    type: "error", // Red styling
    createdAt: new Date(),
    readAt: null,
  },
]

<NotificationBell notifications={notifications} />
```

---

## Example 11: Accessibility Testing

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NotificationBell } from "@/components/navigation"

describe("NotificationBell Accessibility", () => {
  it("has proper ARIA labels", () => {
    render(<NotificationBell />)

    const button = screen.getByRole("button", {
      name: /notifications/i,
    })
    expect(button).toHaveAttribute("aria-expanded")
    expect(button).toHaveAttribute("aria-haspopup", "true")
  })

  it("is keyboard accessible", async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)

    // Tab to button
    await user.tab()

    // Open with Enter
    await user.keyboard("{Enter}")

    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
```

---

## Example 12: Server Component with Client Navigation

```tsx
// app/layout.tsx (Server Component)
import { auth } from "@/lib/auth"
import { ClientNav } from "./ClientNav"

export default async function RootLayout({ children }) {
  const session = await auth()

  return (
    <html>
      <body>
        <ClientNav initialUser={session?.user} />
        {children}
      </body>
    </html>
  )
}

// app/ClientNav.tsx (Client Component)
"use client"

import { NavBar } from "@/components/navigation"
import { useSession } from "next-auth/react"

export function ClientNav({ initialUser }) {
  const { data: session } = useSession()
  const user = session?.user || initialUser

  return <NavBar user={user} />
}
```

---

## Tips and Best Practices

1. **Always type your user data** to match the `User` interface
2. **Handle logout gracefully** with proper cleanup
3. **Fetch notifications** from your API, don't hardcode
4. **Use the mock data** for development and testing
5. **Customize styles** via className prop if needed
6. **Test accessibility** with keyboard and screen readers
7. **Mobile test** across different viewport sizes
8. **Handle loading states** when fetching user data
9. **Implement error boundaries** for production
10. **Monitor performance** with React DevTools

---

## Common Issues and Solutions

### Issue: User name not showing on mobile

**Solution**: This is expected behavior. User name is hidden on screens < 1024px for space optimization.

---

### Issue: Notifications not updating in real-time

**Solution**: Implement polling or WebSocket for real-time updates:

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    refetchNotifications()
  }, 30000) // Poll every 30 seconds

  return () => clearInterval(interval)
}, [])
```

---

### Issue: Logout not working

**Solution**: Make sure you're using the correct auth library method:

```tsx
// NextAuth.js
import { signOut } from "next-auth/react"
<NavBar onLogout={() => signOut()} />

// Custom auth
<NavBar onLogout={() => {
  localStorage.removeItem('token')
  router.push('/login')
}} />
```

---

### Issue: TypeScript errors with user type

**Solution**: Import the User type and use type assertion:

```tsx
import type { User } from "@/components/navigation"

const user = session?.user as User
<NavBar user={user} />
```

---

## Summary

These examples cover the most common use cases for the navigation components. For more details, refer to the component source code and the comprehensive README in the navigation directory.
