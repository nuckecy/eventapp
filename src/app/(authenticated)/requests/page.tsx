"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, Loader2, AlertCircle } from "lucide-react"

import { RequestsTable } from "@/components/dashboard/RequestsTable"
import type { EventRequest as TableEventRequest } from "@/components/dashboard/RequestsTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * Requests List Page
 *
 * Displays all event requests for the current user based on their role:
 * - Lead: Shows only their own requests
 * - Admin: Shows submitted and under review requests
 * - Super Admin: Shows all requests
 *
 * Features:
 * - Role-based filtering
 * - Search and sort functionality (in RequestsTable)
 * - Quick action to create new request (Leads only)
 * - View, edit, and withdraw actions
 */
export default function RequestsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [requests, setRequests] = useState<TableEventRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/requests")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch requests")
      }

      if (data.success && data.data) {
        // Map API response to table format
        const mappedRequests: TableEventRequest[] = data.data.map((req: any) => ({
          id: req.id,
          requestNumber: req.requestNumber,
          title: req.title,
          status: req.status,
          department: req.departmentName,
          eventDate: new Date(req.eventDate),
          submittedAt: req.submittedAt ? new Date(req.submittedAt) : undefined,
          createdAt: new Date(req.createdAt),
        }))

        setRequests(mappedRequests)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Error fetching requests:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle table actions
  const handleView = (request: TableEventRequest) => {
    router.push(`/requests/${request.id}`)
  }

  const handleEdit = (request: TableEventRequest) => {
    router.push(`/requests/${request.id}/edit`)
  }

  const handleWithdraw = async (request: TableEventRequest) => {
    if (!confirm(`Are you sure you want to withdraw "${request.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/requests/${request.id}/submit`, {
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

      // Refresh the list
      fetchRequests()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to withdraw request"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleCreateNew = () => {
    router.push("/requests/new")
  }

  // Show loading skeleton while session is loading
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  // User role for conditional rendering
  const userRole = session?.user?.role

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Event Requests</h1>
            <p className="text-muted-foreground">
              {userRole === "lead" && "Manage your department's event requests"}
              {userRole === "admin" && "Review and manage submitted event requests"}
              {userRole === "superadmin" && "View and manage all event requests"}
            </p>
          </div>

          {/* Create New Button (Leads only) */}
          {userRole === "lead" && (
            <Button onClick={handleCreateNew} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Request
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Requests Table */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No event requests found</h3>
                  <p className="text-sm text-muted-foreground">
                    {userRole === "lead"
                      ? "Get started by creating your first event request."
                      : "No requests are available for review at this time."}
                  </p>
                </div>
                {userRole === "lead" && (
                  <Button onClick={handleCreateNew} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Request
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === "lead" && "My Requests"}
                {userRole === "admin" && "Requests for Review"}
                {userRole === "superadmin" && "All Requests"}
              </CardTitle>
              <CardDescription>
                {requests.length} request{requests.length !== 1 ? "s" : ""} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestsTable
                requests={requests}
                onView={handleView}
                onEdit={handleEdit}
                onWithdraw={handleWithdraw}
                showActions={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
