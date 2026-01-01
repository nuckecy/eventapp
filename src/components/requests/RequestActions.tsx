"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Pencil,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Send,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RequestStatus } from "@/lib/validators/request"

export type UserRole = "lead" | "admin" | "superadmin"

export interface RequestActionsProps {
  /**
   * Current request ID
   */
  requestId: string
  /**
   * Current request status
   */
  status: RequestStatus
  /**
   * Current user's role
   */
  userRole: UserRole
  /**
   * Whether user is the creator of this request
   */
  isCreator?: boolean
  /**
   * Callback handlers for each action
   */
  onEdit?: () => void
  onWithdraw?: () => Promise<void>
  onClaim?: () => Promise<void>
  onReturn?: () => void
  onForward?: () => Promise<void>
  onApprove?: () => Promise<void>
  onEditAndApprove?: () => void
  onDelete?: () => void
}

export function RequestActions({
  requestId,
  status,
  userRole,
  isCreator = false,
  onEdit,
  onWithdraw,
  onClaim,
  onReturn,
  onForward,
  onApprove,
  onEditAndApprove,
  onDelete,
}: RequestActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean
    title: string
    description: string
    action: () => Promise<void> | void
    variant?: "default" | "destructive"
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
    variant: "default",
  })

  const handleAction = async (
    action: () => Promise<void> | void,
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      variant,
    })
  }

  const executeAction = async () => {
    try {
      setIsLoading(true)
      await confirmDialog.action()
      setConfirmDialog({ ...confirmDialog, open: false })
    } catch (error) {
      console.error("Action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Lead actions
  const canEdit = userRole === "lead" && isCreator && status === "draft"
  const canWithdraw =
    userRole === "lead" &&
    isCreator &&
    (status === "submitted" || status === "under_review")

  // Admin actions
  const canClaim = userRole === "admin" && status === "submitted"
  const canReturnToLead = userRole === "admin" && status === "under_review"
  const canForward = userRole === "admin" && status === "under_review"

  // Super Admin actions
  const canApprove = userRole === "superadmin" && status === "ready_for_approval"
  const canEditAndApprove = userRole === "superadmin" && status === "ready_for_approval"
  const canReturnToAdmin = userRole === "superadmin" && status === "ready_for_approval"
  const canDelete = userRole === "superadmin" && status !== "approved"

  // If no actions available
  const hasAnyAction =
    canEdit ||
    canWithdraw ||
    canClaim ||
    canReturnToLead ||
    canForward ||
    canApprove ||
    canEditAndApprove ||
    canReturnToAdmin ||
    canDelete

  if (!hasAnyAction) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            No actions available
          </p>
          <p className="text-xs text-muted-foreground">
            You don't have permission to perform actions on this request.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Lead Actions */}
        {userRole === "lead" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Lead Actions</h3>
            <div className="flex flex-wrap gap-2">
              {canEdit && onEdit && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Draft
                </Button>
              )}
              {canWithdraw && onWithdraw && (
                <Button
                  onClick={() =>
                    handleAction(
                      onWithdraw,
                      "Withdraw Request",
                      "Are you sure you want to withdraw this request? You can resubmit it later.",
                      "destructive"
                    )
                  }
                  variant="destructive"
                  size="sm"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {userRole === "admin" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Administrator Actions</h3>
            <div className="flex flex-wrap gap-2">
              {canClaim && onClaim && (
                <Button
                  onClick={() =>
                    handleAction(
                      onClaim,
                      "Claim Request",
                      "Claim this request to begin reviewing it. It will move to 'Under Review' status."
                    )
                  }
                  size="sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Claim Request
                </Button>
              )}
              {canReturnToLead && onReturn && (
                <Button onClick={onReturn} variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return to Lead
                </Button>
              )}
              {canForward && onForward && (
                <Button
                  onClick={() =>
                    handleAction(
                      onForward,
                      "Forward to Super Admin",
                      "Forward this request to Super Admin for final approval?"
                    )
                  }
                  size="sm"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Forward to Super Admin
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Super Admin Actions */}
        {userRole === "superadmin" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Super Admin Actions</h3>
            <div className="flex flex-wrap gap-2">
              {canApprove && onApprove && (
                <Button
                  onClick={() =>
                    handleAction(
                      onApprove,
                      "Approve Request",
                      "Approve this request and publish the event to the public calendar?"
                    )
                  }
                  size="sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {canEditAndApprove && onEditAndApprove && (
                <Button onClick={onEditAndApprove} variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit & Approve
                </Button>
              )}
              {canReturnToAdmin && onReturn && (
                <Button onClick={onReturn} variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return to Admin
                </Button>
              )}
              {canDelete && onDelete && (
                <Button onClick={onDelete} variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status-specific warnings */}
        {status === "returned" && (
          <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Request Returned
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-500">
                This request was returned with feedback. Please review the
                feedback and resubmit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.variant === "destructive" ? "destructive" : "default"}
              onClick={executeAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
