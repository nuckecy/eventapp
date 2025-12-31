/**
 * Example usage of dashboard components
 * This file demonstrates how to use all dashboard components together
 *
 * Note: This is an example file for reference only
 */

"use client"

import { StatCard } from "./StatCard"
import { StatusBadge } from "./StatusBadge"
import { RequestsTable, type EventRequest } from "./RequestsTable"
import { QuickActions } from "./QuickActions"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"

// Example data
const sampleRequests: EventRequest[] = [
  {
    id: "1",
    requestNumber: "REQ-001",
    title: "Youth Conference 2025",
    status: "approved",
    department: "Youth Ministry",
    eventDate: new Date("2025-03-15"),
    submittedAt: new Date("2025-01-10"),
    createdAt: new Date("2025-01-05"),
  },
  {
    id: "2",
    requestNumber: "REQ-002",
    title: "Women's Fellowship Retreat",
    status: "under_review",
    department: "Women's Fellowship",
    eventDate: new Date("2025-04-20"),
    submittedAt: new Date("2025-01-15"),
    createdAt: new Date("2025-01-12"),
  },
  {
    id: "3",
    requestNumber: "REQ-003",
    title: "Community Outreach Program",
    status: "submitted",
    department: "Community Outreach",
    eventDate: new Date("2025-05-10"),
    submittedAt: new Date("2025-01-20"),
    createdAt: new Date("2025-01-18"),
  },
]

export default function DashboardExample() {
  // Calculate stats
  const stats = {
    total: sampleRequests.length,
    pending: sampleRequests.filter(
      (r) => r.status === "submitted" || r.status === "under_review"
    ).length,
    approved: sampleRequests.filter((r) => r.status === "approved").length,
    rejected: sampleRequests.filter((r) => r.status === "returned").length,
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your event requests and view statistics
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions
        onCreateActivity={() => console.log("Create activity request")}
        onCreateEvent={() => console.log("Create event request")}
      />

      {/* Stats Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={FileText}
          color="default"
          onClick={() => console.log("View all requests")}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="warning"
          onClick={() => console.log("View pending requests")}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="success"
          onClick={() => console.log("View approved requests")}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="error"
          onClick={() => console.log("View rejected requests")}
        />
      </div>

      {/* Status Badge Examples */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Status Examples</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="draft" />
          <StatusBadge status="submitted" />
          <StatusBadge status="under_review" />
          <StatusBadge status="ready_for_approval" />
          <StatusBadge status="approved" />
          <StatusBadge status="returned" />
          <StatusBadge status="deleted" />
        </div>
      </div>

      {/* Requests Table */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
        <RequestsTable
          requests={sampleRequests}
          onView={(request) => console.log("View:", request.title)}
          onEdit={(request) => console.log("Edit:", request.title)}
          onWithdraw={(request) => console.log("Withdraw:", request.title)}
        />
      </div>
    </div>
  )
}
