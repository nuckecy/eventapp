# Navigation Components

This directory contains the navigation components for the Church Event Management System.

## Components

### NavBar

The main navigation bar component that adapts based on authentication status and user role.

**Features:**
- Dynamic navigation based on auth status
- Logo "Church Events" (links to calendar)
- Public view: Contact Us, Login buttons
- Member view: Contact Us, Calendar, User name, Member badge, Bell icon, Logout
- Staff view: Contact Us, User name, Role badge, Bell icon, Logout
- Role badges with correct colors (Member=blue, Lead=green, Admin=yellow, SuperAdmin=red)
- Mobile responsive with proper spacing
- Full accessibility support (ARIA labels, keyboard navigation, focus states)

**Usage:**

```tsx
import { NavBar } from "@/components/navigation"

// Public view (not authenticated)
<NavBar />

// Authenticated member
<NavBar
  user={{
    id: "123",
    name: "John Doe",
    email: "john@example.com",
    role: "member"
  }}
/>

// Authenticated staff
<NavBar
  user={{
    id: "456",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "admin"
  }}
/>
```

### UserMenu

Dropdown menu for authenticated users with profile and logout options.

**Features:**
- Shows user name and role
- Profile link
- Dashboard link (role-specific)
- Logout option
- Avatar with user initials
- Accessible dropdown with keyboard navigation

**Usage:**

```tsx
import { UserMenu } from "@/components/navigation"

<UserMenu
  user={{
    id: "123",
    name: "John Doe",
    email: "john@example.com",
    role: "lead"
  }}
  onLogout={() => {
    // Custom logout handler
    signOut()
  }}
/>
```

### NotificationBell

Bell icon with notification count badge and dropdown showing recent notifications.

**Features:**
- Bell icon with unread count badge
- Dropdown showing recent notifications
- Mark as read functionality (UI only for now)
- Mark all as read
- Dismiss notifications
- Time-based formatting (e.g., "30 minutes ago")
- Empty state when no notifications
- Link to view all notifications

**Usage:**

```tsx
import { NotificationBell } from "@/components/navigation"

// With mock data (default)
<NotificationBell />

// With custom notifications
<NotificationBell
  notifications={[
    {
      id: "1",
      title: "Event Approved",
      message: "Your event request has been approved",
      type: "success",
      createdAt: new Date(),
      readAt: null
    }
  ]}
  onMarkAsRead={(id) => {
    // Handle mark as read
    console.log("Mark as read:", id)
  }}
  onMarkAllAsRead={() => {
    // Handle mark all as read
    console.log("Mark all as read")
  }}
  onDismiss={(id) => {
    // Handle dismiss
    console.log("Dismiss:", id)
  }}
/>
```

## Types

### User

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}
```

### UserRole

```typescript
export type UserRole = "member" | "lead" | "admin" | "superadmin"
```

### Notification

```typescript
export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  resourceType?: string
  resourceId?: string
  createdAt: Date
  readAt?: Date | null
}
```

## Role Badge Colors

According to PRD specifications:

- **Member**: Blue (`bg-blue-100 text-blue-800`)
- **Lead**: Green (`bg-green-100 text-green-800`)
- **Administrator**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Super Admin**: Red (`bg-red-100 text-red-800`)

## Accessibility

All components follow accessibility best practices:

- **ARIA labels**: All interactive elements have proper ARIA labels
- **Keyboard navigation**: Full support for keyboard navigation
- **Focus visible states**: Clear focus indicators for keyboard users
- **Screen reader friendly**: Semantic HTML and ARIA attributes for screen readers
- **Role attributes**: Proper role attributes for navigation, dialog, and article elements

## Mobile Responsiveness

The navigation components are fully responsive:

- **NavBar**: Hides some elements on mobile, shows Contact instead of Contact Us
- **User name**: Hidden on small screens (< lg)
- **Role badge**: Hidden on extra small screens (< sm)
- **Popover/Dropdown**: Automatically adjusts position on mobile

## Integration with Next.js App Router

These components are designed to work with Next.js App Router and can be used in both server and client components:

```tsx
// In a layout.tsx (server component)
import { NavBar } from "@/components/navigation"
import { auth } from "@/lib/auth" // Your auth implementation

export default async function Layout({ children }) {
  const session = await auth()

  return (
    <div>
      <NavBar user={session?.user} />
      {children}
    </div>
  )
}
```

## Future Enhancements

- Real-time notification updates via WebSocket or Server-Sent Events
- Notification preferences (email, in-app, etc.)
- Notification grouping and filtering
- Infinite scroll for notifications list
- Settings menu option in UserMenu
