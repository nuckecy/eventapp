"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import { RequestForm } from "@/components/requests/RequestForm"
import type { Department } from "@/components/requests/RequestForm"
import type { CreateRequestInput } from "@/lib/validators/request"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * New Request Page
 *
 * Allows department leads to create new event requests.
 *
 * Features:
 * - Request form with validation
 * - Save as draft or submit for review
 * - Auto-populate department for leads
 * - Redirect after successful creation
 * - Error handling and loading states
 */
export default function NewRequestPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is a lead (only leads can create requests)
  const userRole = session?.user?.role
  const isLead = userRole === "lead"
  const userDepartmentId = session?.user?.departmentId

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Redirect non-leads
  useEffect(() => {
    if (status === "authenticated" && !isLead) {
      toast({
        title: "Access Denied",
        description: "Only department leads can create event requests.",
        variant: "destructive",
      })
      router.push("/requests")
    }
  }, [status, isLead, router, toast])

  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true)
      setError(null)

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
      const errorMessage = err instanceof Error ? err.message : "Failed to load departments"
      setError(errorMessage)
      console.error("Error fetching departments:", err)
    } finally {
      setIsLoadingDepartments(false)
    }
  }

  const handleSubmit = async (data: CreateRequestInput, isDraft: boolean) => {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to create request")
      }

      // If it's a draft, submit it
      if (!isDraft && result.data?.id) {
        const submitResponse = await fetch(`/api/requests/${result.data.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        const submitResult = await submitResponse.json()

        if (!submitResponse.ok) {
          throw new Error(submitResult.error?.message || "Failed to submit request")
        }
      }

      toast({
        title: isDraft ? "Draft saved" : "Request submitted",
        description: isDraft
          ? "Your request has been saved as a draft."
          : "Your request has been submitted for review.",
      })

      // Redirect to the request details page or requests list
      if (result.data?.id) {
        router.push(`/requests/${result.data.id}`)
      } else {
        router.push("/requests")
      }
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
    router.push("/requests")
  }

  // Show loading skeleton while session is loading
  if (status === "loading" || isLoadingDepartments) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Don't render form for non-leads (will redirect anyway)
  if (!isLead) {
    return null
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
            Back to Requests
          </Button>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Create Event Request</h1>
            <p className="text-muted-foreground">
              Fill out the form below to submit a new event request for approval.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
            departments={departments}
            defaultDepartmentId={userDepartmentId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={false}
          />
        )}
      </div>
    </div>
  )
}
