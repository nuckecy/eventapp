"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Clock,
  Edit,
  Send,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface AuditEntry {
  id: string
  userId: string
  userName?: string
  userRole?: string
  action: string
  timestamp: Date
  changes?: Array<{
    field: string
    oldValue: string | null
    newValue: string | null
  }>
  reason?: string
  ipAddress?: string
}

export interface AuditTrailProps {
  /**
   * Array of audit entries
   */
  entries: AuditEntry[]
  /**
   * Whether to show IP addresses (admin/superadmin only)
   */
  showIpAddresses?: boolean
  /**
   * Maximum number of entries to show initially
   */
  initialLimit?: number
}

const actionIcons = {
  created: FileText,
  submitted: Send,
  claimed: User,
  updated: Edit,
  forwarded: Send,
  approved: CheckCircle2,
  returned: RotateCcw,
  withdrawn: XCircle,
  deleted: Trash2,
}

const actionColors = {
  created: "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
  claimed: "bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400",
  updated: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400",
  forwarded: "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400",
  returned: "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400",
  deleted: "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400",
}

function getActionIcon(action: string) {
  const actionType = action.toLowerCase()
  return actionIcons[actionType as keyof typeof actionIcons] || FileText
}

function getActionColor(action: string) {
  const actionType = action.toLowerCase()
  return actionColors[actionType as keyof typeof actionColors] || actionColors.created
}

function formatFieldName(field: string): string {
  // Convert camelCase or snake_case to Title Case
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

interface AuditEntryItemProps {
  entry: AuditEntry
  showIpAddress?: boolean
}

function AuditEntryItem({ entry, showIpAddress }: AuditEntryItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const Icon = getActionIcon(entry.action)
  const hasChanges = entry.changes && entry.changes.length > 0

  return (
    <div className="relative border-l-2 border-muted pl-6 pb-6 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full border-2 border-background bg-muted" />

      <div className="space-y-2">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-2">
          <Badge
            variant="outline"
            className={cn("inline-flex items-center gap-1.5", getActionColor(entry.action))}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span className="capitalize">{entry.action}</span>
          </Badge>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium">
                {entry.userName || "Unknown User"}
              </span>
              {entry.userRole && (
                <Badge variant="secondary" className="text-xs">
                  {entry.userRole}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={entry.timestamp.toISOString()}>
              {format(entry.timestamp, "PPp")}
            </time>
          </div>
        </div>

        {/* Reason */}
        {entry.reason && (
          <p className="text-sm text-muted-foreground italic">"{entry.reason}"</p>
        )}

        {/* Changes Collapsible */}
        {hasChanges && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-medium hover:bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ChevronDown className="mr-1 h-3 w-3" />
              ) : (
                <ChevronRight className="mr-1 h-3 w-3" />
              )}
              {entry.changes!.length} field{entry.changes!.length > 1 ? "s" : ""}{" "}
              changed
            </Button>
            {isOpen && (
              <div className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-3">
                {entry.changes!.map((change, index) => (
                  <div
                    key={index}
                    className="space-y-1 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatFieldName(change.field)}
                    </p>
                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Before:</p>
                        <p
                          className={cn(
                            "rounded border bg-background p-2 font-mono",
                            !change.oldValue && "text-muted-foreground italic"
                          )}
                        >
                          {change.oldValue || "(empty)"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">After:</p>
                        <p
                          className={cn(
                            "rounded border bg-background p-2 font-mono",
                            !change.newValue && "text-muted-foreground italic"
                          )}
                        >
                          {change.newValue || "(empty)"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IP Address (if shown) */}
        {showIpAddress && entry.ipAddress && (
          <p className="text-xs text-muted-foreground">
            IP: <code className="rounded bg-muted px-1 py-0.5">{entry.ipAddress}</code>
          </p>
        )}
      </div>
    </div>
  )
}

export function AuditTrail({
  entries,
  showIpAddresses = false,
  initialLimit = 10,
}: AuditTrailProps) {
  const [showAll, setShowAll] = React.useState(false)

  // Sort entries by timestamp (newest first)
  const sortedEntries = React.useMemo(() => {
    return [...entries].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [entries])

  const displayedEntries = showAll
    ? sortedEntries
    : sortedEntries.slice(0, initialLimit)

  const hasMore = sortedEntries.length > initialLimit

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="space-y-2">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            No audit trail available
          </p>
          <p className="text-xs text-muted-foreground">
            Changes will appear here as the request is processed
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {displayedEntries.map((entry) => (
          <AuditEntryItem
            key={entry.id}
            entry={entry}
            showIpAddress={showIpAddresses}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Show {sortedEntries.length - initialLimit} more{" "}
            {sortedEntries.length - initialLimit > 1 ? "entries" : "entry"}
          </Button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
        </div>
      )}
    </div>
  )
}
