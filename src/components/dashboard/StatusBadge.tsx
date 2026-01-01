"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FileText,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react"

export type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "ready_for_approval"
  | "approved"
  | "returned"
  | "deleted"

export interface StatusBadgeProps {
  status: RequestStatus
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
    icon: FileText,
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
    icon: Send,
  },
  under_review: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800",
    icon: Search,
  },
  ready_for_approval: {
    label: "Ready for Approval",
    className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800",
    icon: CheckCircle2,
  },
  returned: {
    label: "Returned",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800",
    icon: XCircle,
  },
  deleted: {
    label: "Deleted",
    className: "bg-gray-200 text-gray-700 border-gray-300 line-through dark:bg-gray-800 dark:text-gray-500 dark:border-gray-600",
    icon: Trash2,
  },
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        Unknown Status
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        config.className,
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{config.label}</span>
    </Badge>
  )
}

/**
 * Helper function to get status label
 */
export function getStatusLabel(status: RequestStatus): string {
  return statusConfig[status]?.label || "Unknown"
}

/**
 * Helper function to get all available statuses
 */
export function getAllStatuses(): RequestStatus[] {
  return [
    "draft",
    "submitted",
    "under_review",
    "ready_for_approval",
    "approved",
    "returned",
    "deleted",
  ]
}
