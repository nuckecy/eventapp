"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Loader2, AlertCircle, AlertTriangle } from "lucide-react"

import { RequestForm } from "@/components/requests/RequestForm"
import type { Department } from "@/components/requests/RequestForm"
import type { CreateRequestInput, EventRequest } from "@/lib/validators/request"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * Edit Request Page
 *
 * Allows editing of event requests based on role and status:
 * - Leads: Can edit their own draft requests
 * - Admins: Can edit submitted/under_review requests
 * - Super Admins: Can edit requests ready for approval
 *
 * Features:
 * - Pre-populate form with existing data
 * - Role-based edit permissions
 * - Option to approve after editing (Super Admin only)
 * - Save changes and redirect
 */
export default function EditRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [request, setRequest] = useState<EventRequest | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userRole = session?.user?.role
  const userId = session?.user?.id
  const approveAfterEdit = searchParams.get("approve") === "true"

  // Fetch request and departments on mount
  useEffect(() => {
    Promise.all([fetchRequestDetails(), fetchDepartments()])
  }, [params.id])

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch request")
      }

      if (data.success && data.data) {
        const requestData = {
          ...data.data,
          eventDate: new Date(data.data.eventDate),
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
        }
        setRequest(requestData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load request"
      setError(errorMessage)
      console.error("Error fetching request:", err)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch departments")
      }

      if (data.success && data.data) {
        const mappedDepartments: Department[] = data.data.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          color: dept.color,
        }))
        setDepartments(mappedDepartments)
      }
    } catch (err) {
      console.error("Error fetching departments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Check edit permissions
  const canEdit = React.useMemo(() => {
    if (!request || !session?.user) return false

    const isCreator = request.creatorId === userId

    switch (userRole) {
      case "lead":
        // Leads can only edit their own draft requests
        return isCreator && request.status === "draft"

      case "admin":
        // Admins can edit submitted or under_review requests
        return request.status === "submitted" || request.status === "under_review"

      case "superadmin":
        // Super Admins can edit ready_for_approval requests
        return request.status === "ready_for_approval"

      default:
        return false
    }
  }, [request, session, userId, userRole])

  const handleSubmit = async (data: CreateRequestInput, isDraft: boolean) => {
    try {
      // Update the request
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to update request")
      }

      // If Super Admin is approving after edit
      if (approveAfterEdit && userRole === "superadmin" && !isDraft) {
        const approveResponse = await fetch(`/api/requests/${params.id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        const approveResult = await approveResponse.json()

        if (!approveResponse.ok) {
          throw new Error(approveResult.error?.message || "Failed to approve request")
        }

        toast({
          title: "Request approved",
          description: "The request has been updated and approved successfully.",
        })
      } else {
        toast({
          title: isDraft ? "Draft saved" : "Request updated",
          description: isDraft
            ? "Your changes have been saved as a draft."
            : "Your request has been updated successfully.",
        })
      }

      // Redirect to request details
      router.push(`/requests/${params.id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err // Re-throw to stop form loading state
    }
  }

  const handleCancel = () => {
    router.push(`/requests/${params.id}`)
  }

  // Show loading skeleton
  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Show error or permission denied
  if (error || !request || !canEdit) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/requests/${params.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Request
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "You don't have permission to edit this request."}
            </AlertDescription>
          </Alert>

          {!error && !canEdit && request && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {userRole === "lead" && "You can only edit draft requests."}
                {userRole === "admin" && "You can only edit submitted or under review requests."}
                {userRole === "superadmin" && "You can only edit requests ready for approval."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Request
          </Button>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Event Request
            </h1>
            <p className="text-muted-foreground">
              {approveAfterEdit
                ? "Make your changes and approve the request."
                : "Update the event request details below."}
            </p>
          </div>
        </div>

        {/* Info Alert for Super Admin Edit & Approve */}
        {approveAfterEdit && userRole === "superadmin" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After saving your changes, this request will be automatically approved
              and published to the public calendar.
            </AlertDescription>
          </Alert>
        )}

        {/* Request Form */}
        {departments.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No departments available. Please contact an administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <RequestForm
            request={request}
            departments={departments}
            isEdit={true}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  )
}
