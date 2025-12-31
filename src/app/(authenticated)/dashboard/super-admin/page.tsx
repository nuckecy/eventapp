"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/dashboard/StatCard"
import { SuperAdminRequestCard } from "@/components/dashboard/SuperAdminRequestCard"
import {
  FileText,
  Search,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  Clock
} from "lucide-react"

// Mock data - replace with actual data fetching
const mockRequests = {
  submitted: [
    {
      id: "REQ-001",
      title: "Youth Conference 2025",
      eventType: "local" as const,
      department: "Youth Ministry",
      submittedDate: "2025-12-28",
      status: "submitted" as const,
      lead: "Otobong Okoko",
    },
    {
      id: "REQ-002",
      title: "Women's Prayer Retreat",
      eventType: "regional" as const,
      department: "Women's Fellowship",
      submittedDate: "2025-12-27",
      status: "submitted" as const,
      lead: "Sister Mary Johnson",
    },
  ],
  underReview: [
    {
      id: "REQ-003",
      title: "Community Outreach Event",
      eventType: "local" as const,
      department: "Community Outreach",
      submittedDate: "2025-12-25",
      status: "under_review" as const,
      lead: "Brother David Thompson",
      adminNotes: "Reviewing budget requirements and venue availability",
    },
    {
      id: "REQ-004",
      title: "Sunday Worship Service - New Year",
      eventType: "sunday" as const,
      department: "Worship Team",
      submittedDate: "2025-12-24",
      status: "under_review" as const,
      lead: "Pastor John Emmanuel",
      adminNotes: "Coordinating with technical team for special production",
    },
  ],
  readyForApproval: [
    {
      id: "REQ-005",
      title: "Senior Ministry Luncheon",
      eventType: "local" as const,
      department: "Senior Ministry",
      submittedDate: "2025-12-20",
      status: "ready_for_approval" as const,
      lead: "Elder Peter Adeyemi",
      adminNotes: "All requirements verified. Budget approved.",
      eventDate: "2026-01-15",
      location: "Fellowship Hall",
    },
    {
      id: "REQ-006",
      title: "Regional Prayer Summit",
      eventType: "regional" as const,
      department: "Prayer Team",
      submittedDate: "2025-12-18",
      status: "ready_for_approval" as const,
      lead: "Sister Grace Obi",
      adminNotes: "Venue confirmed. Speakers finalized.",
      eventDate: "2026-01-25",
      location: "Main Sanctuary",
    },
  ],
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = React.useState("ready-for-approval")

  const submittedCount = mockRequests.submitted.length
  const underReviewCount = mockRequests.underReview.length
  const readyForApprovalCount = mockRequests.readyForApproval.length
  const thisWeekProcessed = 23
  const avgProcessingTime = "28h"

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review and approve event requests with final authority
        </p>
      </div>

      {/* Summary Cards - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Submitted"
          value={submittedCount}
          color="default"
          icon={FileText}
          onClick={() => setActiveTab("submitted")}
        />

        <StatCard
          label="Under Review"
          value={underReviewCount}
          color="warning"
          icon={Search}
          onClick={() => setActiveTab("under-review")}
        />

        <div className="relative">
          <StatCard
            label="Ready for Approval"
            value={readyForApprovalCount}
            color="success"
            icon={CheckCircle}
            onClick={() => setActiveTab("ready-for-approval")}
          />
          {readyForApprovalCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 animate-pulse"
            >
              ACTION REQUIRED
            </Badge>
          )}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  This Week
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold">
                      {thisWeekProcessed} processed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">
                      avg {avgProcessingTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-background">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flat Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="submitted" className="flex items-center gap-2 py-3">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Submitted</span>
            <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
              {submittedCount}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="under-review" className="flex items-center gap-2 py-3">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Under Review</span>
            <Badge variant="outline" className="ml-1 bg-yellow-50 text-yellow-700 border-yellow-200">
              {underReviewCount}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="ready-for-approval" className="flex items-center gap-2 py-3 relative">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Ready for Approval</span>
            <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200">
              {readyForApprovalCount}
            </Badge>
            {readyForApprovalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="analytics" className="flex items-center gap-2 py-3">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Submitted Tab - View Only */}
        <TabsContent value="submitted" className="space-y-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Submitted Requests
              </CardTitle>
              <CardDescription>
                These requests are with the Administrator. You can view details but cannot take action until forwarded.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {mockRequests.submitted.map((request) => (
              <SuperAdminRequestCard
                key={request.id}
                request={request}
                mode="view-only"
                variant="submitted"
              />
            ))}
          </div>
        </TabsContent>

        {/* Under Review Tab - View + Progress */}
        <TabsContent value="under-review" className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-yellow-600" />
                Under Review
              </CardTitle>
              <CardDescription>
                Administrator is reviewing these requests. You can view progress notes.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {mockRequests.underReview.map((request) => (
              <SuperAdminRequestCard
                key={request.id}
                request={request}
                mode="view-progress"
                variant="under-review"
              />
            ))}
          </div>
        </TabsContent>

        {/* Ready for Approval Tab - Full Actions */}
        <TabsContent value="ready-for-approval" className="space-y-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Ready for Approval
                  </CardTitle>
                  <CardDescription>
                    These requests are awaiting your final approval. All actions available.
                  </CardDescription>
                </div>
                {readyForApprovalCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    ACTION REQUIRED
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {mockRequests.readyForApproval.map((request) => (
              <SuperAdminRequestCard
                key={request.id}
                request={request}
                mode="full-actions"
                variant="ready-for-approval"
              />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab - Placeholder */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Insights and metrics for event request management
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Weekly Request Counts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Weekly Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">32</div>
                <p className="text-sm text-muted-foreground mt-1">
                  This week
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Last week</span>
                    <span className="font-semibold">28</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Request Counts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Monthly Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">127</div>
                <p className="text-sm text-muted-foreground mt-1">
                  This month
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Last month</span>
                    <span className="font-semibold">115</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">94%</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Overall approval rate
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Approved</span>
                    <span className="font-semibold">108</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Returned</span>
                    <span className="font-semibold">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">28h</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average time to approval
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target</span>
                    <span className="font-semibold">48h</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '58%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Departments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">6</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Departments submitting requests
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Youth Ministry</span>
                    <span className="font-semibold">35</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Worship Team</span>
                    <span className="font-semibold">28</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Time Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Chart placeholder
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
