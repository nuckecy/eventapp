"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  Building2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import type { EventRequestWithRelations } from "@/lib/validators/request"

export interface RequestDetailsProps {
  /**
   * The event request with all relations
   */
  request: EventRequestWithRelations
  /**
   * Whether to show actions section placeholder
   */
  showActions?: boolean
  /**
   * Slot for action buttons
   */
  actions?: React.ReactNode
  /**
   * Whether to show audit trail
   */
  showAuditTrail?: boolean
  /**
   * Slot for audit trail component
   */
  auditTrail?: React.ReactNode
}

const eventTypeColors = {
  sunday: {
    bg: "bg-teal-500",
    text: "text-teal-700",
    label: "Sunday Event",
  },
  regional: {
    bg: "bg-purple-500",
    text: "text-purple-700",
    label: "Regional Event",
  },
  local: {
    bg: "bg-blue-500",
    text: "text-blue-700",
    label: "Local Event",
  },
}

export function RequestDetails({
  request,
  showActions = true,
  actions,
  showAuditTrail = true,
  auditTrail,
}: RequestDetailsProps) {
  const eventTypeConfig = eventTypeColors[request.eventType]

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{request.title}</CardTitle>
              </div>
              <CardDescription>
                Request #{request.requestNumber} • Created{" "}
                {format(new Date(request.createdAt), "PPP")}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={request.status} />
              <Badge
                variant="outline"
                className={`${eventTypeConfig.bg} text-white border-0`}
              >
                {eventTypeConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Details Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Event Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(request.eventDate), "PPPP")}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {request.startTime} - {request.endTime}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {request.location || "Not specified"}
                </p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-muted-foreground">
                  {request.department?.name || "Unknown"}
                </p>
              </div>
            </div>

            {/* Expected Attendance */}
            {request.expectedAttendance && (
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Expected Attendance</p>
                  <p className="text-sm text-muted-foreground">
                    {request.expectedAttendance.toLocaleString()} people
                  </p>
                </div>
              </div>
            )}

            {/* Budget */}
            {request.budget && (
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof request.budget === 'number'
                      ? `$${request.budget.toLocaleString()}`
                      : `$${Number(request.budget).toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {request.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm font-medium">Description</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                  {request.description}
                </p>
              </div>
            </>
          )}

          {/* Special Requirements */}
          {request.specialRequirements && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm font-medium">Special Requirements</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                  {request.specialRequirements}
                </p>
              </div>
            </>
          )}

          {/* Requester Information */}
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium">Request Information</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Submitted By</p>
                <p className="text-sm">
                  {request.creator?.name || "Unknown"}{" "}
                  <span className="text-muted-foreground">
                    ({request.creator?.email || "N/A"})
                  </span>
                </p>
              </div>
              {request.admin && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Assigned Admin</p>
                  <p className="text-sm">
                    {request.admin.name}{" "}
                    <span className="text-muted-foreground">
                      ({request.admin.email})
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {request.submittedAt && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm">
                    {format(new Date(request.submittedAt), "PPp")}
                  </p>
                </div>
              )}
              {request.reviewedAt && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Reviewed</p>
                  <p className="text-sm">
                    {format(new Date(request.reviewedAt), "PPp")}
                  </p>
                </div>
              )}
              {request.approvedAt && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Approved</p>
                  <p className="text-sm">
                    {format(new Date(request.approvedAt), "PPp")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback History */}
      {request.feedback && request.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback History</CardTitle>
            <CardDescription>
              Comments and feedback from reviewers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.feedback.map((fb) => (
              <div key={fb.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Action: <span className="capitalize">{fb.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(fb.createdAt), "PPp")} •{" "}
                      <span className="capitalize">{fb.userRole}</span>
                    </p>
                  </div>
                </div>
                {fb.feedback && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {fb.feedback}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions Section */}
      {showActions && actions && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Available actions for this request</CardDescription>
          </CardHeader>
          <CardContent>{actions}</CardContent>
        </Card>
      )}

      {/* Audit Trail Section */}
      {showAuditTrail && auditTrail && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Complete change history</CardDescription>
          </CardHeader>
          <CardContent>{auditTrail}</CardContent>
        </Card>
      )}
    </div>
  )
}
