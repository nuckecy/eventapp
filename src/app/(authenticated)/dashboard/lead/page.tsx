"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { StatCard, RequestsTable, QuickActions } from "@/components/dashboard"
import type { EventRequest } from "@/components/dashboard"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { mockRequests, type MockEventRequest } from "@/lib/mock-data"

/**
 * Lead Dashboard Page
 *
 * This page displays the dashboard for Department Leads, showing:
 * - Dashboard title and subtitle
 * - Quick action buttons (Create Activity, Create Event)
 * - 4-column stats grid (Total, Pending, Approved, Rejected)
 * - RequestsTable showing Lead's requests only
 *
 * Features:
 * - Stats cards are clickable to filter the table
 * - Table shows only requests from the Lead's department
 * - Responsive design (4 columns → 2 on mobile)
 * - Uses mock data for now
 */
export default function LeadDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  // Mock user data - In production, this would come from auth session
  const currentUserId = "user-lead-001"
  const currentDepartmentId = "dept-001" // Youth Ministry

  // Filter requests to show only this Lead's department
  const leadRequests = useMemo(() => {
    return mockRequests
      .filter((request) => request.departmentId === currentDepartmentId)
      .map((request): EventRequest => ({
        id: request.id,
        requestNumber: request.requestNumber,
        title: request.title,
        status: request.status,
        department: request.departmentName,
        eventDate: request.eventDate,
        submittedAt: request.submittedAt,
        createdAt: request.createdAt,
      }))
  }, [currentDepartmentId])

  // Calculate stats
  const stats = useMemo(() => {
    const total = leadRequests.length
    const pending = leadRequests.filter(
      (r) => r.status === "submitted" || r.status === "under_review" || r.status === "ready_for_approval"
    ).length
    const approved = leadRequests.filter((r) => r.status === "approved").length
    const rejected = leadRequests.filter((r) => r.status === "returned").length

    return { total, pending, approved, rejected }
  }, [leadRequests])

  // Filter requests based on active filter
  const filteredRequests = useMemo(() => {
    if (!statusFilter) return leadRequests

    switch (statusFilter) {
      case "pending":
        return leadRequests.filter(
          (r) => r.status === "submitted" || r.status === "under_review" || r.status === "ready_for_approval"
        )
      case "approved":
        return leadRequests.filter((r) => r.status === "approved")
      case "rejected":
        return leadRequests.filter((r) => r.status === "returned")
      default:
        return leadRequests
    }
  }, [leadRequests, statusFilter])

  // Handle stat card clicks to filter table
  const handleStatClick = (filter: string | null) => {
    setStatusFilter(filter === statusFilter ? null : filter)
  }

  // Handle quick actions
  const handleCreateActivity = () => {
    console.log("Create Activity Request")
    // TODO: Navigate to create activity form
  }

  const handleCreateEvent = () => {
    console.log("Create Event Request")
    // TODO: Navigate to create event form
  }

  // Handle request actions
  const handleViewRequest = (request: EventRequest) => {
    console.log("View request:", request.id)
    // TODO: Navigate to request details page
  }

  const handleEditRequest = (request: EventRequest) => {
    console.log("Edit request:", request.id)
    // TODO: Navigate to edit request form (only for drafts)
  }

  const handleWithdrawRequest = (request: EventRequest) => {
    console.log("Withdraw request:", request.id)
    // TODO: Show confirmation dialog and withdraw request
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lead Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your department's event requests and track their approval status.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions
        onCreateActivity={handleCreateActivity}
        onCreateEvent={handleCreateEvent}
      />

      {/* Stats Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={FileText}
          onClick={() => handleStatClick(null)}
          color={statusFilter === null ? "default" : "default"}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="warning"
          onClick={() => handleStatClick("pending")}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="success"
          onClick={() => handleStatClick("approved")}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="error"
          onClick={() => handleStatClick("rejected")}
        />
      </div>

      {/* Active Filter Indicator */}
      {statusFilter && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {statusFilter} requests ({filteredRequests.length} of {leadRequests.length})
          </span>
          <button
            onClick={() => setStatusFilter(null)}
            className="text-primary hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Requests Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Event Requests</h2>
        </div>
        <RequestsTable
          requests={filteredRequests}
          onView={handleViewRequest}
          onEdit={handleEditRequest}
          onWithdraw={handleWithdrawRequest}
          showActions={true}
        />
      </div>
    </div>
  )
}
