"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge, type RequestStatus } from "./StatusBadge"
import { cn } from "@/lib/utils"
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  XCircle,
  MoreHorizontal,
} from "lucide-react"
import { format } from "date-fns"

export interface EventRequest {
  id: string
  requestNumber: string
  title: string
  status: RequestStatus
  department: string
  eventDate: Date
  submittedAt?: Date
  createdAt: Date
}

export interface RequestsTableProps {
  requests: EventRequest[]
  onView?: (request: EventRequest) => void
  onEdit?: (request: EventRequest) => void
  onWithdraw?: (request: EventRequest) => void
  onDelete?: (request: EventRequest) => void
  showActions?: boolean
  className?: string
}

type SortField = "requestNumber" | "title" | "status" | "department" | "eventDate" | "submittedAt"
type SortDirection = "asc" | "desc" | null

export function RequestsTable({
  requests,
  onView,
  onEdit,
  onWithdraw,
  onDelete,
  showActions = true,
  className,
}: RequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Filter requests based on search query
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests

    const query = searchQuery.toLowerCase()
    return requests.filter(
      (request) =>
        request.requestNumber.toLowerCase().includes(query) ||
        request.title.toLowerCase().includes(query) ||
        request.department.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query)
    )
  }, [requests, searchQuery])

  // Sort filtered requests
  const sortedRequests = useMemo(() => {
    if (!sortField || !sortDirection) return filteredRequests

    return [...filteredRequests].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime()
        bValue = bValue.getTime()
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredRequests, sortField, sortDirection])

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4" aria-hidden="true" />
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="w-4 h-4" aria-hidden="true" />
    }
    return <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
  }

  // Check if edit is allowed (only for drafts)
  const canEdit = (request: EventRequest) => {
    return request.status === "draft" && onEdit
  }

  // Check if withdraw is allowed (submitted or under_review)
  const canWithdraw = (request: EventRequest) => {
    return (
      (request.status === "submitted" || request.status === "under_review") &&
      onWithdraw
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search event requests by ID, title, department, or status"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground" role="status">
            {filteredRequests.length} result{filteredRequests.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("requestNumber")}
                  className="h-8 px-2 font-medium"
                  aria-label="Sort by request ID"
                >
                  Request ID
                  {getSortIcon("requestNumber")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("title")}
                  className="h-8 px-2 font-medium"
                  aria-label="Sort by title"
                >
                  Title
                  {getSortIcon("title")}
                </Button>
              </TableHead>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("status")}
                  className="h-8 px-2 font-medium"
                  aria-label="Sort by status"
                >
                  Status
                  {getSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("department")}
                  className="h-8 px-2 font-medium"
                  aria-label="Sort by department"
                >
                  Department
                  {getSortIcon("department")}
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("eventDate")}
                  className="h-8 px-2 font-medium"
                  aria-label="Sort by event date"
                >
                  Event Date
                  {getSortIcon("eventDate")}
                </Button>
              </TableHead>
              {showActions && <TableHead className="w-[120px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="w-8 h-8" aria-hidden="true" />
                    <p>
                      {searchQuery
                        ? "No requests found matching your search."
                        : "No event requests yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-sm">
                    {request.requestNumber}
                  </TableCell>
                  <TableCell className="font-medium">{request.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-sm">{request.department}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {format(request.eventDate, "MMM dd, yyyy")}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(request)}
                            aria-label={`View details for ${request.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {canEdit(request) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit!(request)}
                            aria-label={`Edit ${request.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canWithdraw(request) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onWithdraw!(request)}
                            aria-label={`Withdraw ${request.title}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(request)}
                            aria-label={`More actions for ${request.title}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table footer with count */}
      {sortedRequests.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {sortedRequests.length} of {requests.length} request
            {requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  )
}
