"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Lock,
  Info,
  Eye,
  CheckCircle,
  Edit,
  ArrowLeft,
  Trash2,
  Calendar,
  MapPin,
  User,
  Building2,
  AlertTriangle,
} from "lucide-react"

// Request types
interface BaseRequest {
  id: string
  title: string
  eventType: "sunday" | "regional" | "local"
  department: string
  submittedDate: string
  lead: string
}

interface SubmittedRequest extends BaseRequest {
  status: "submitted"
}

interface UnderReviewRequest extends BaseRequest {
  status: "under_review"
  adminNotes: string
}

interface ReadyForApprovalRequest extends BaseRequest {
  status: "ready_for_approval"
  adminNotes: string
  eventDate: string
  location: string
}

type Request = SubmittedRequest | UnderReviewRequest | ReadyForApprovalRequest

// Component props
interface SuperAdminRequestCardProps {
  request: Request
  mode: "view-only" | "view-progress" | "full-actions"
  variant: "submitted" | "under-review" | "ready-for-approval"
  onApprove?: (id: string) => void
  onEditAndApprove?: (id: string) => void
  onSendBackToAdmin?: (id: string) => void
  onDelete?: (id: string) => void
}

const eventTypeColors = {
  sunday: "bg-teal-500 text-white",
  regional: "bg-purple-500 text-white",
  local: "bg-blue-500 text-white",
}

const eventTypeLabels = {
  sunday: "Sunday Event",
  regional: "Regional Event",
  local: "Local Event",
}

const variantStyles = {
  submitted: {
    card: "border-blue-200 bg-blue-50/30",
    header: "bg-blue-100/50",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
  },
  "under-review": {
    card: "border-yellow-200 bg-yellow-50/30",
    header: "bg-yellow-100/50",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  "ready-for-approval": {
    card: "border-green-200 bg-green-50/30",
    header: "bg-green-100/50",
    badge: "bg-green-100 text-green-800 border-green-300",
  },
}

export function SuperAdminRequestCard({
  request,
  mode,
  variant,
  onApprove,
  onEditAndApprove,
  onSendBackToAdmin,
  onDelete,
}: SuperAdminRequestCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const styles = variantStyles[variant]

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onDelete?.(request.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting request:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md", styles.card)}>
        <CardHeader className={cn("pb-3", styles.header)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={eventTypeColors[request.eventType]}>
                  {eventTypeLabels[request.eventType]}
                </Badge>
                <Badge variant="outline" className={styles.badge}>
                  {request.id}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{request.title}</h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Request Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{request.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lead:</span>
              <span className="font-medium">{request.lead}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="font-medium">
                {new Date(request.submittedDate).toLocaleDateString()}
              </span>
            </div>
            {request.status === "ready_for_approval" && (
              <>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Event Date:</span>
                  <span className="font-medium">
                    {new Date(request.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{request.location}</span>
                </div>
              </>
            )}
          </div>

          {/* Mode-specific content */}
          {mode === "view-only" && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Request with Administrator
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This request is with the Administrator. You can view details but
                  cannot take action until it&apos;s forwarded.
                </p>
              </div>
            </div>
          )}

          {mode === "view-progress" && request.status !== "submitted" && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Administrator is reviewing
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This request is currently being processed by the Administrator.
                  </p>
                </div>
              </div>
              {request.status === "under_review" && request.adminNotes && (
                <div className="p-3 bg-white border rounded-md">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Administrator Notes:
                  </p>
                  <p className="text-sm">{request.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {mode === "full-actions" &&
            request.status === "ready_for_approval" &&
            request.adminNotes && (
              <div className="p-3 bg-white border rounded-md">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Administrator Notes:
                </p>
                <p className="text-sm">{request.adminNotes}</p>
              </div>
            )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-4 border-t">
          {/* View Only Mode - Just View Button */}
          {mode === "view-only" && (
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          )}

          {/* View Progress Mode - Just View Button */}
          {mode === "view-progress" && (
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          )}

          {/* Full Actions Mode - All Buttons */}
          {mode === "full-actions" && (
            <>
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => onApprove?.(request.id)}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onEditAndApprove?.(request.id)}
              >
                <Edit className="w-4 h-4" />
                Edit & Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onSendBackToAdmin?.(request.id)}
              >
                <ArrowLeft className="w-4 h-4" />
                Send Back to Admin
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 ml-auto"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete Event Request?</DialogTitle>
            </div>
            <DialogDescription className="text-base space-y-2">
              <p className="font-semibold text-red-600">
                WARNING: This action cannot be undone.
              </p>
              <p>
                This will permanently delete the event request &quot;
                {request.title}&quot; from the system.
              </p>
              <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                <p>
                  <span className="font-semibold">Request ID:</span> {request.id}
                </p>
                <p>
                  <span className="font-semibold">Department:</span>{" "}
                  {request.department}
                </p>
                <p>
                  <span className="font-semibold">Lead:</span> {request.lead}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                This action will be logged in the audit trail and the Lead and
                Administrator will be notified.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
