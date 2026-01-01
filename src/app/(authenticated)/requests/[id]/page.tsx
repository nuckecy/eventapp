"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import { RequestDetails } from "@/components/requests/RequestDetails"
import { RequestActions } from "@/components/requests/RequestActions"
import type { UserRole } from "@/components/requests/RequestActions"
import { AuditTrail } from "@/components/requests/AuditTrail"
import type { AuditEntry } from "@/components/requests/AuditTrail"
import { FeedbackDialog, DeleteDialog } from "@/components/requests/FeedbackDialog"
import type { EventRequestWithRelations } from "@/lib/validators/request"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * Request Details Page
 *
 * Displays full details of a single event request with:
 * - Request information and status
 * - Role-based actions (RequestActions component)
 * - Feedback history
 * - Audit trail
 *
 * Supports different actions based on user role:
 * - Lead: Edit drafts, withdraw requests
 * - Admin: Claim, review, return, forward
 * - Super Admin: Approve, return, delete
 */
export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [request, setRequest] = useState<EventRequestWithRelations | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Feedback dialog state
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean
    returnTo: "lead" | "admin"
  }>({ open: false, returnTo: "lead" })

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState(false)

  const userRole = session?.user?.role as UserRole
  const userId = session?.user?.id

  // Fetch request details on mount
  useEffect(() => {
    if (params.id) {
      fetchRequestDetails()
    }
  }, [params.id])

  const fetchRequestDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/requests/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch request")
      }

      if (data.success && data.data) {
        // Map dates to Date objects
        const requestData = {
          ...data.data,
          eventDate: new Date(data.data.eventDate),
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
          submittedAt: data.data.submittedAt ? new Date(data.data.submittedAt) : null,
          reviewedAt: data.data.reviewedAt ? new Date(data.data.reviewedAt) : null,
          approvedAt: data.data.approvedAt ? new Date(data.data.approvedAt) : null,
          feedback: data.data.feedback?.map((fb: any) => ({
            ...fb,
            createdAt: new Date(fb.createdAt),
          })),
        }

        setRequest(requestData)

        // Map audit logs
        if (data.data.auditLogs) {
          const mappedAuditLogs: AuditEntry[] = data.data.auditLogs.map((log: any) => ({
            id: log.id,
            userId: log.userId,
            userName: log.userName,
            userRole: log.userRole,
            action: log.action,
            timestamp: new Date(log.createdAt),
            changes: log.changes ? Object.entries(log.changes).map(([field, change]: [string, any]) => ({
              field,
              oldValue: change.from?.toString() || null,
              newValue: change.to?.toString() || null,
            })) : undefined,
            reason: log.reason,
            ipAddress: log.ipAddress,
          }))
          setAuditEntries(mappedAuditLogs)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load request"
      setError(errorMessage)
      console.error("Error fetching request:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Action handlers
  const handleEdit = () => {
    router.push(`/requests/${params.id}/edit`)
  }

  const handleWithdraw = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to withdraw request")
      }

      toast({
        title: "Request withdrawn",
        description: "Your request has been withdrawn successfully.",
      })

      fetchRequestDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to withdraw request",
        variant: "destructive",
      })
    }
  }

  const handleClaim = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to claim request")
      }

      toast({
        title: "Request claimed",
        description: "You have successfully claimed this request for review.",
      })

      fetchRequestDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to claim request",
        variant: "destructive",
      })
    }
  }

  const handleReturn = () => {
    // Determine who to return to based on user role
    const returnTo = userRole === "admin" ? "lead" : "admin"
    setFeedbackDialog({ open: true, returnTo })
  }

  const handleReturnSubmit = async (feedback: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to return request")
      }

      toast({
        title: "Request returned",
        description: `Request has been returned to ${feedbackDialog.returnTo} with feedback.`,
      })

      fetchRequestDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to return request",
        variant: "destructive",
      })
      throw err // Re-throw to prevent dialog from closing
    }
  }

  const handleForward = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to forward request")
      }

      toast({
        title: "Request forwarded",
        description: "Request has been forwarded to Super Admin for approval.",
      })

      fetchRequestDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to forward request",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to approve request")
      }

      toast({
        title: "Request approved",
        description: "The event has been approved and published to the calendar.",
      })

      fetchRequestDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve request",
        variant: "destructive",
      })
    }
  }

  const handleEditAndApprove = () => {
    router.push(`/requests/${params.id}/edit?approve=true`)
  }

  const handleDelete = () => {
    setDeleteDialog(true)
  }

  const handleDeleteConfirm = async (reason?: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to delete request")
      }

      toast({
        title: "Request deleted",
        description: "The request has been permanently deleted.",
      })

      router.push("/requests")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete request",
        variant: "destructive",
      })
      throw err // Re-throw to prevent dialog from closing
    }
  }

  // Show loading skeleton
  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !request) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/requests")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Request not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const isCreator = request.creatorId === userId
  const showIpAddresses = userRole === "admin" || userRole === "superadmin"

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/requests")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Button>

        {/* Request Details */}
        <RequestDetails
          request={request}
          showActions={true}
          actions={
            <RequestActions
              requestId={request.id}
              status={request.status}
              userRole={userRole}
              isCreator={isCreator}
              onEdit={handleEdit}
              onWithdraw={handleWithdraw}
              onClaim={handleClaim}
              onReturn={handleReturn}
              onForward={handleForward}
              onApprove={handleApprove}
              onEditAndApprove={handleEditAndApprove}
              onDelete={handleDelete}
            />
          }
          showAuditTrail={true}
          auditTrail={
            <AuditTrail
              entries={auditEntries}
              showIpAddresses={showIpAddresses}
              initialLimit={10}
            />
          }
        />

        {/* Feedback Dialog */}
        <FeedbackDialog
          open={feedbackDialog.open}
          onOpenChange={(open) => setFeedbackDialog({ ...feedbackDialog, open })}
          requestId={request.id}
          requestTitle={request.title}
          returnTo={feedbackDialog.returnTo}
          onSubmit={handleReturnSubmit}
        />

        {/* Delete Dialog */}
        <DeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          requestId={request.id}
          requestTitle={request.title}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  )
}
