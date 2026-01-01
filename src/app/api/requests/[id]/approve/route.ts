import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockEvents, mockAuditLogs, mockNotifications } from "@/lib/mock-data"

/**
 * POST /api/requests/[id]/approve
 * Super Admin approves request and publishes to public calendar
 * Changes status from "ready_for_approval" to "approved"
 * Creates public event from request
 * Requires authentication (Super Admin only)
 *
 * @param params - Route params containing request ID
 * @returns Published event object
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      )
    }

    // Only Super Admins can approve
    if (user.role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only Super Admins can approve requests",
          },
        },
        { status: 403 }
      )
    }

    const { id } = params

    // Find request
    const requestIndex = mockRequests.findIndex((r) => r.id === id)
    if (requestIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Request not found",
          },
        },
        { status: 404 }
      )
    }

    const eventRequest = mockRequests[requestIndex]

    // Verify current status is ready_for_approval
    if (eventRequest.status !== "ready_for_approval") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot approve request with status: ${eventRequest.status}`,
          },
        },
        { status: 400 }
      )
    }

    // Update request status to approved
    mockRequests[requestIndex] = {
      ...eventRequest,
      status: "approved",
      approvedAt: new Date(),
      updatedAt: new Date(),
    }

    // Create published event from request
    const publishedEvent = {
      id: `evt-${Date.now()}`,
      title: eventRequest.title,
      eventType: eventRequest.eventType,
      departmentId: eventRequest.departmentId,
      departmentName: eventRequest.departmentName,
      eventDate: eventRequest.eventDate,
      startTime: eventRequest.startTime,
      endTime: eventRequest.endTime,
      location: eventRequest.location,
      description: eventRequest.description,
      expectedAttendance: eventRequest.expectedAttendance,
    }

    // Add to published events
    mockEvents.push(publishedEvent)

    // Log to audit trail
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "approve_request",
      resourceType: "event_request",
      resourceId: id,
      changes: {
        status: { from: "ready_for_approval", to: "approved" },
        approvedAt: new Date(),
        publishedEventId: publishedEvent.id,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    // Notify Lead (creator)
    const leadNotification = {
      id: `notif-${Date.now()}-lead`,
      userId: eventRequest.creatorId,
      title: "Request Approved!",
      message: `Your event request '${eventRequest.title}' has been approved and published to the calendar`,
      type: "success" as const,
      resourceType: "event",
      resourceId: publishedEvent.id,
      createdAt: new Date(),
    }

    mockNotifications.push(leadNotification)

    // Notify Admin
    if (eventRequest.adminId) {
      const adminNotification = {
        id: `notif-${Date.now()}-admin`,
        userId: eventRequest.adminId,
        title: "Request Approved",
        message: `Super Admin approved event request '${eventRequest.title}' that you reviewed`,
        type: "success" as const,
        resourceType: "event",
        resourceId: publishedEvent.id,
        createdAt: new Date(),
      }

      mockNotifications.push(adminNotification)
    }

    return NextResponse.json({
      success: true,
      data: {
        request: mockRequests[requestIndex],
        publishedEvent,
      },
    })
  } catch (error) {
    console.error("Error approving request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while approving the request",
        },
      },
      { status: 500 }
    )
  }
}
