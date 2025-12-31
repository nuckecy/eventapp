"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  returnRequestSchema,
  type ReturnRequestInput,
} from "@/lib/validators/request"

export interface FeedbackDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void
  /**
   * The request ID being returned
   */
  requestId: string
  /**
   * The request title for display
   */
  requestTitle: string
  /**
   * Who the request is being returned to
   */
  returnTo: "lead" | "admin"
  /**
   * Callback when feedback is submitted
   */
  onSubmit: (feedback: string) => Promise<void>
}

export function FeedbackDialog({
  open,
  onOpenChange,
  requestId,
  requestTitle,
  returnTo,
  onSubmit,
}: FeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<ReturnRequestInput>({
    resolver: zodResolver(returnRequestSchema),
    defaultValues: {
      feedback: "",
    },
  })

  const handleSubmit = async (data: ReturnRequestInput) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data.feedback)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      // Error handling can be enhanced with toast notifications
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Return Request to {returnTo === "lead" ? "Lead" : "Administrator"}
          </DialogTitle>
          <DialogDescription>
            Provide feedback explaining why this request is being returned.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Request Information */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Request Details</p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium">Title:</span> {requestTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">ID:</span> {requestId}
              </p>
            </div>

            {/* Warning Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will return the request to the{" "}
                {returnTo === "lead" ? "lead" : "administrator"} for revision.
                Please provide clear, constructive feedback to help them
                understand what needs to be changed.
              </AlertDescription>
            </Alert>

            {/* Feedback Field */}
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain what needs to be changed or why this request cannot be approved at this time..."
                      className="min-h-[150px] resize-none"
                      {...field}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription>
                    Provide specific, actionable feedback (minimum 10 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Returning...
                  </>
                ) : (
                  "Return Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Delete Request Dialog (Super Admin only)
 * Similar pattern but for permanent deletion
 */
export interface DeleteDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void
  /**
   * The request ID being deleted
   */
  requestId: string
  /**
   * The request title for display
   */
  requestTitle: string
  /**
   * Callback when deletion is confirmed
   */
  onConfirm: (reason?: string) => Promise<void>
}

export function DeleteDialog({
  open,
  onOpenChange,
  requestId,
  requestTitle,
  onConfirm,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [reason, setReason] = React.useState("")

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onConfirm(reason || undefined)
      setReason("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete request:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Event Request
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the event
            request from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Information */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium">Request Details</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium">Title:</span> {requestTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">ID:</span> {requestId}
            </p>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>WARNING:</strong> This will permanently delete this event
              request from the database. The lead and administrator will be
              notified. This action is logged in the audit trail.
            </AlertDescription>
          </Alert>

          {/* Reason Field (Optional) */}
          <div className="space-y-2">
            <label htmlFor="delete-reason" className="text-sm font-medium">
              Reason for Deletion (Optional)
            </label>
            <Textarea
              id="delete-reason"
              placeholder="e.g., Duplicate request, inappropriate content, policy violation..."
              className="min-h-[100px] resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Providing a reason helps with audit trail and transparency
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
