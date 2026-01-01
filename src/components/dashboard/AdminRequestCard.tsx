"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, type RequestStatus } from "@/components/dashboard/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  Edit,
  Send,
  RotateCcw,
  CheckCircle,
} from "lucide-react"
import { format } from "date-fns"

export interface AdminRequestCardProps {
  request: {
    id: string
    requestNumber: string
    title: string
    eventType: "sunday" | "regional" | "local"
    departmentName: string
    creatorName: string
    creatorEmail: string
    eventDate: Date
    startTime: string
    endTime: string
    location: string
    description?: string
    expectedAttendance?: number
    budget?: number
    status: RequestStatus
    submittedAt?: Date
  }
  onClaim?: (requestId: string) => void
  onEdit?: (requestId: string) => void
  onReturn?: (requestId: string) => void
  onForward?: (requestId: string) => void
  className?: string
}

const eventTypeColors = {
  sunday: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400",
  regional: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400",
  local: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400",
}

const eventTypeLabels = {
  sunday: "Sunday Event",
  regional: "Regional Event",
  local: "Local Event",
}

export function AdminRequestCard({
  request,
  onClaim,
  onEdit,
  onReturn,
  onForward,
  className,
}: AdminRequestCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const isSubmitted = request.status === "submitted"
  const isUnderReview = request.status === "under_review"
  const isForwarded = request.status === "ready_for_approval"

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isHovered && "shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold leading-tight">
                {request.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {request.requestNumber}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <StatusBadge status={request.status} />
            <Badge
              variant="outline"
              className={cn(eventTypeColors[request.eventType])}
            >
              {eventTypeLabels[request.eventType]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Event Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {format(request.eventDate, "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {request.startTime} - {request.endTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{request.location}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{request.departmentName}</span>
          </div>
        </div>

        {/* Submitter Info */}
        <div className="flex items-center gap-2 text-sm pt-2 border-t">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">{request.creatorName}</span>
          <span className="text-muted-foreground">
            ({request.creatorEmail})
          </span>
        </div>

        {/* Submitted Date */}
        {request.submittedAt && (
          <div className="text-xs text-muted-foreground">
            Submitted {format(request.submittedAt, "MMM d, yyyy 'at' h:mm a")}
          </div>
        )}

        {/* Description Preview */}
        {request.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 pt-2">
            {request.description}
          </p>
        )}

        {/* Additional Info */}
        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
          {request.expectedAttendance && (
            <span>Expected: {request.expectedAttendance} attendees</span>
          )}
          {request.budget && (
            <span>Budget: ${request.budget.toLocaleString()}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 flex flex-wrap gap-2">
        {/* Action Buttons Based on Status */}
        {isSubmitted && (
          <>
            {onClaim && (
              <Button
                size="sm"
                onClick={() => onClaim(request.id)}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Claim Request
              </Button>
            )}
          </>
        )}

        {isUnderReview && (
          <>
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(request.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
            )}
            {onReturn && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReturn(request.id)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Return to Lead
              </Button>
            )}
            {onForward && (
              <Button
                size="sm"
                onClick={() => onForward(request.id)}
              >
                <Send className="mr-2 h-4 w-4" />
                Forward to Super Admin
              </Button>
            )}
          </>
        )}

        {isForwarded && (
          <div className="text-sm text-muted-foreground italic">
            Forwarded to Super Admin for approval
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
