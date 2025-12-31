# Dashboard Components - Quick Reference Card

## Import Statement

```tsx
import {
  StatCard,
  StatusBadge,
  RequestsTable,
  QuickActions,
  getStatusLabel,
  getAllStatuses,
  type StatCardProps,
  type StatusBadgeProps,
  type RequestsTableProps,
  type QuickActionsProps,
  type RequestStatus,
  type EventRequest,
} from "@/components/dashboard"
```

## Component Signatures

### 1. StatCard
```tsx
<StatCard
  label: string
  value: number | string
  color?: "default" | "warning" | "success" | "error"
  icon?: LucideIcon
  onClick?: () => void
/>
```

### 2. StatusBadge
```tsx
<StatusBadge
  status: "draft" | "submitted" | "under_review" | "ready_for_approval" | "approved" | "returned" | "deleted"
  className?: string
  showIcon?: boolean  // default: true
/>
```

### 3. RequestsTable
```tsx
<RequestsTable
  requests: EventRequest[]
  onView?: (request: EventRequest) => void
  onEdit?: (request: EventRequest) => void
  onWithdraw?: (request: EventRequest) => void
  onDelete?: (request: EventRequest) => void
  showActions?: boolean  // default: true
  className?: string
/>
```

### 4. QuickActions
```tsx
<QuickActions
  onCreateActivity?: () => void
  onCreateEvent?: () => void
  className?: string
/>
```

## Type Definitions

```tsx
type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "ready_for_approval"
  | "approved"
  | "returned"
  | "deleted"

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

## Color Scheme

### StatCard Colors
- `default`: Gray (text-foreground)
- `warning`: Yellow (#ca8a04)
- `success`: Green (#16a34a)
- `error`: Red (#dc2626)

### StatusBadge Colors
- `draft`: Gray
- `submitted`: Blue (#2563eb)
- `under_review`: Yellow (#ca8a04)
- `ready_for_approval`: Purple (#9333ea)
- `approved`: Green (#16a34a)
- `returned`: Red (#dc2626)
- `deleted`: Gray (strikethrough)

### QuickActions Colors
- Activity Request: Green (#16a34a)
- Event Request: Blue (#2563eb)

## Responsive Breakpoints

```tsx
// Recommended grid layouts
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</div>
```

## Accessibility Features

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader friendly
- ✅ Color + Icon indicators (not color alone)
- ✅ Proper semantic HTML (table headers, button roles)
- ✅ Focus indicators visible

## Common Patterns

### Lead Dashboard (4 Stats)
```tsx
<StatCard label="Total Requests" value={total} icon={FileText} />
<StatCard label="Pending Review" value={pending} color="warning" icon={Clock} />
<StatCard label="Approved" value={approved} color="success" icon={CheckCircle} />
<StatCard label="Rejected" value={rejected} color="error" icon={XCircle} />
```

### Admin Dashboard (5 Stats)
```tsx
<StatCard label="Total Pending" value={totalPending} />
<StatCard label="Submitted" value={submitted} color="default" icon={Send} />
<StatCard label="Under Review" value={underReview} color="warning" icon={Search} />
<StatCard label="Forwarded" value={forwarded} color="success" icon={ArrowRight} />
<StatCard label="Avg Processing Time" value="24h" icon={Clock} />
```

### Super Admin Dashboard (Summary Cards)
```tsx
<StatCard label="Submitted" value={5} color="default" icon={Send} />
<StatCard label="Under Review" value={7} color="warning" icon={Search} />
<StatCard label="Ready for Approval" value={7} color="success" icon={CheckCircle} />
<StatCard label="This Week" value={23} icon={Calendar} />
```

## File Locations

```
src/components/dashboard/
├── StatCard.tsx           # Stats display card
├── StatusBadge.tsx        # Status indicators
├── RequestsTable.tsx      # Event requests table
├── QuickActions.tsx       # Action buttons
├── index.ts               # Exports
├── README.md              # Full documentation
└── __test-example.tsx     # Usage example
```

## Dependencies

```json
{
  "lucide-react": "^0.562.0",
  "date-fns": "^4.1.0",
  "@radix-ui/react-slot": "1.2.4",
  "class-variance-authority": "0.7.1"
}
```

## Best Practices

1. **Always provide accessible labels** for clickable StatCards
2. **Use icons with StatusBadge** for better accessibility
3. **Implement all handlers** in RequestsTable to enable actions
4. **Test keyboard navigation** before deployment
5. **Verify color contrast** in both light and dark modes

---

**Quick Tip**: See `__test-example.tsx` for a complete working implementation!
