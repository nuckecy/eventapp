# Dashboard Components

This directory contains all dashboard-related components for the Church Event Management System.

## Components

### 1. StatCard

A reusable statistics card component with color variants and optional click handling.

**Props:**
- `label` (string): The label/title of the stat
- `value` (number | string): The value to display
- `color` (optional): Color variant - "default" | "warning" | "success" | "error"
- `icon` (optional): Lucide icon component to display
- `onClick` (optional): Click handler for making the card interactive

**Example:**
```tsx
import { StatCard } from "@/components/dashboard"
import { Users } from "lucide-react"

<StatCard
  label="Total Requests"
  value={42}
  color="default"
  icon={Users}
  onClick={() => console.log("Card clicked")}
/>
```

**Accessibility Features:**
- Keyboard navigation (Enter/Space)
- ARIA labels for screen readers
- Proper button semantics when clickable

---

### 2. StatusBadge

Color-coded status badges for event request statuses.

**Props:**
- `status` (RequestStatus): The status to display
- `className` (optional): Additional CSS classes
- `showIcon` (optional, default: true): Whether to show status icon

**Status Types:**
- `draft` - Gray
- `submitted` - Blue
- `under_review` - Yellow
- `ready_for_approval` - Purple
- `approved` - Green
- `returned` - Red
- `deleted` - Gray with strikethrough

**Example:**
```tsx
import { StatusBadge } from "@/components/dashboard"

<StatusBadge status="approved" />
<StatusBadge status="under_review" showIcon={false} />
```

**Helper Functions:**
```tsx
import { getStatusLabel, getAllStatuses } from "@/components/dashboard"

const label = getStatusLabel("approved") // "Approved"
const allStatuses = getAllStatuses() // Array of all status values
```

**Accessibility Features:**
- Color is not the only indicator (includes icons and text)
- ARIA labels for status meaning

---

### 3. RequestsTable

A comprehensive table component for displaying event requests with search and sort functionality.

**Props:**
- `requests` (EventRequest[]): Array of event requests
- `onView` (optional): Handler for viewing request details
- `onEdit` (optional): Handler for editing requests
- `onWithdraw` (optional): Handler for withdrawing requests
- `onDelete` (optional): Handler for deleting requests
- `showActions` (optional, default: true): Whether to show action buttons
- `className` (optional): Additional CSS classes

**EventRequest Interface:**
```tsx
interface EventRequest {
  id: string
  requestNumber: string
  title: string
  status: RequestStatus
  department: string
  eventDate: Date
  submittedAt?: Date
  createdAt: Date
}
```

**Example:**
```tsx
import { RequestsTable } from "@/components/dashboard"

const requests = [
  {
    id: "1",
    requestNumber: "REQ-001",
    title: "Youth Conference 2025",
    status: "approved",
    department: "Youth Ministry",
    eventDate: new Date("2025-03-15"),
    createdAt: new Date(),
  },
]

<RequestsTable
  requests={requests}
  onView={(request) => console.log("View", request)}
  onEdit={(request) => console.log("Edit", request)}
  onWithdraw={(request) => console.log("Withdraw", request)}
/>
```

**Features:**
- Real-time search across ID, title, department, and status
- Sortable columns (click to sort ascending/descending/none)
- Conditional action buttons based on status:
  - Edit: Only for draft status
  - Withdraw: Only for submitted or under_review status
- Mobile responsive with horizontal scroll
- Empty state messages

**Accessibility Features:**
- Proper table headers with scope
- ARIA labels for all buttons
- Keyboard navigation for table rows
- Search results announcements
- Sort button labels

---

### 4. QuickActions

Action button group for dashboard quick access.

**Props:**
- `onCreateActivity` (optional): Handler for creating activity requests
- `onCreateEvent` (optional): Handler for creating event requests
- `className` (optional): Additional CSS classes

**Example:**
```tsx
import { QuickActions } from "@/components/dashboard"

<QuickActions
  onCreateActivity={() => router.push("/requests/new?type=activity")}
  onCreateEvent={() => router.push("/requests/new?type=event")}
/>
```

**Button Colors:**
- Activity Request: Green (`bg-green-600`)
- Event Request: Blue (`bg-blue-600`)

**Accessibility Features:**
- Role group for related buttons
- Descriptive ARIA labels

---

## Usage Example: Lead Dashboard

```tsx
"use client"

import { useState } from "react"
import {
  StatCard,
  RequestsTable,
  QuickActions,
  type EventRequest,
} from "@/components/dashboard"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"

export default function LeadDashboard() {
  const [requests, setRequests] = useState<EventRequest[]>([
    // ... your requests data
  ])

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "submitted" || r.status === "under_review").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "returned").length,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your event requests and view statistics
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions
        onCreateActivity={() => console.log("Create activity")}
        onCreateEvent={() => console.log("Create event")}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={FileText}
          color="default"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="error"
        />
      </div>

      {/* Requests Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
        <RequestsTable
          requests={requests}
          onView={(request) => console.log("View", request)}
          onEdit={(request) => console.log("Edit", request)}
          onWithdraw={(request) => console.log("Withdraw", request)}
        />
      </div>
    </div>
  )
}
```

## Theming

All components use Shadcn UI with the Lime theme and Nova style, ensuring consistent styling across the application. They support both light and dark modes automatically.

## Accessibility Compliance

All dashboard components meet WCAG 2.1 Level AA standards:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios
- ✅ Focus indicators
- ✅ ARIA labels and roles
- ✅ Color is not the only indicator

## Mobile Responsiveness

- **StatCard**: Stacks naturally in grid layouts
- **StatusBadge**: Compact size works on all screens
- **RequestsTable**: Horizontal scroll on small screens
- **QuickActions**: Buttons wrap on small screens
