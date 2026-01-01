"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/StatCard"
import { AdminRequestCard } from "@/components/dashboard/AdminRequestCard"
import { FeedbackDialog } from "@/components/requests/FeedbackDialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { mockRequests, type MockEventRequest } from "@/lib/mock-data"
import {
  FileText,
  Send,
  Search,
  CheckCircle2,
  Clock,
} from "lucide-react"

export default function AdminDashboardPage() {
  // State for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false)
  const [selectedRequest, setSelectedRequest] = React.useState<MockEventRequest | null>(null)

  // Filter requests by status
  const submittedRequests = mockRequests.filter(req => req.status === "submitted")
  const underReviewRequests = mockRequests.filter(req => req.status === "under_review")
  const forwardedRequests = mockRequests.filter(req => req.status === "ready_for_approval")

  // Calculate stats
  const totalPending = submittedRequests.length + underReviewRequests.length + forwardedRequests.length
  const submittedCount = submittedRequests.length
  const underReviewCount = underReviewRequests.length
  const forwardedCount = forwardedRequests.length

  // Calculate average processing time (in hours)
  const calculateAvgProcessingTime = (): string => {
    const reviewedRequests = mockRequests.filter(
      req => req.reviewedAt && req.submittedAt
    )

    if (reviewedRequests.length === 0) return "N/A"

    const totalHours = reviewedRequests.reduce((sum, req) => {
      if (req.submittedAt && req.reviewedAt) {
        const submitted = req.submittedAt.getTime()
        const reviewed = req.reviewedAt.getTime()
        const hours = (reviewed - submitted) / (1000 * 60 * 60)
        return sum + hours
      }
      return sum
    }, 0)

    const avgHours = Math.round(totalHours / reviewedRequests.length)
    return `${avgHours}h`
  }

  // Action handlers
  const handleClaimRequest = (requestId: string) => {
    console.log("Claiming request:", requestId)
    // In a real app, this would call an API to update the request status
    // and assign the admin to the request
  }

  const handleEditRequest = (requestId: string) => {
    console.log("Editing request:", requestId)
    // In a real app, this would navigate to the edit page
  }

  const handleReturnToLead = (requestId: string) => {
    const request = mockRequests.find(req => req.id === requestId)
    if (request) {
      setSelectedRequest(request)
      setFeedbackDialogOpen(true)
    }
  }

  const handleForwardRequest = (requestId: string) => {
    console.log("Forwarding request to Super Admin:", requestId)
    // In a real app, this would call an API to update the request status
    // and notify the Super Admin
  }

  const handleSubmitFeedback = async (feedback: string) => {
    console.log("Submitting feedback:", feedback, "for request:", selectedRequest?.id)
    // In a real app, this would call an API to return the request to the lead
    // with the provided feedback
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Administrator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Review and process event requests from department leads
        </p>
      </div>

      {/* Stats Grid - 5 columns on desktop, 3 on tablet, 2 on mobile */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Pending"
          value={totalPending}
          icon={FileText}
        />
        <StatCard
          label="Submitted"
          value={submittedCount}
          color="default"
          icon={Send}
        />
        <StatCard
          label="Under Review"
          value={underReviewCount}
          color="warning"
          icon={Search}
        />
        <StatCard
          label="Forwarded"
          value={forwardedCount}
          color="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Avg Processing Time"
          value={calculateAvgProcessingTime()}
          icon={Clock}
        />
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="new-requests" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="new-requests" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">New Requests</span>
            <span className="sm:hidden">New</span>
            {submittedCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {submittedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="under-review" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Under Review</span>
            <span className="sm:hidden">Review</span>
            {underReviewCount > 0 && (
              <span className="ml-1 rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-white">
                {underReviewCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="forwarded" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Forwarded</span>
            <span className="sm:hidden">Sent</span>
            {forwardedCount > 0 && (
              <span className="ml-1 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                {forwardedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* New Requests Tab */}
        <TabsContent value="new-requests" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">
              Submitted Requests Awaiting Review
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              These requests have been submitted by department leads and are waiting for an administrator to claim and review them.
            </p>
            {submittedRequests.length > 0 ? (
              <div className="grid gap-4">
                {submittedRequests.map((request) => (
                  <AdminRequestCard
                    key={request.id}
                    request={request}
                    onClaim={handleClaimRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Send className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No New Requests</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  There are currently no submitted requests awaiting review.
                  New submissions will appear here.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Under Review Tab */}
        <TabsContent value="under-review" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">
              Requests Under Review
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              These requests are currently being processed. You can edit details, return them to the lead for revisions, or forward them to the Super Admin.
            </p>
            {underReviewRequests.length > 0 ? (
              <div className="grid gap-4">
                {underReviewRequests.map((request) => (
                  <AdminRequestCard
                    key={request.id}
                    request={request}
                    onEdit={handleEditRequest}
                    onReturn={handleReturnToLead}
                    onForward={handleForwardRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Requests Under Review</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You haven't claimed any requests yet. Go to the New Requests tab to claim and start reviewing submissions.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Forwarded Tab */}
        <TabsContent value="forwarded" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold mb-4">
              Forwarded to Super Admin
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              These requests have been forwarded to the Super Admin for final approval. They are now awaiting the Super Admin's decision.
            </p>
            {forwardedRequests.length > 0 ? (
              <div className="grid gap-4">
                {forwardedRequests.map((request) => (
                  <AdminRequestCard
                    key={request.id}
                    request={request}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Forwarded Requests</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You haven't forwarded any requests to the Super Admin yet. Reviewed requests will appear here after being forwarded.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      {selectedRequest && (
        <FeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          requestId={selectedRequest.requestNumber}
          requestTitle={selectedRequest.title}
          returnTo="lead"
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  )
}
