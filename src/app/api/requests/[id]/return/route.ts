import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockAuditLogs, mockNotifications } from "@/lib/mock-data"
import { returnRequestSchema } from "@/lib/validators/request"

/**
 * POST /api/requests/[id]/return
 * Return a request with feedback
 *
 * Admin can return:
 * - "under_review" → "returned" (back to Lead)
 *
 * Super Admin can return:
 * - "ready_for_approval" → "under_review" (back to Admin)
 *
 * Requires authentication (Admin or Super Admin)
 *
 * @param params - Route params containing request ID
 * @returns Updated request object
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

    // Only Admins and Super Admins can return requests
    if (!["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only administrators can return requests",
          },
        },
        { status: 403 }
      )
    }

    const { id } = params

    // Parse and validate feedback
    const body = await request.json()
    const validation = returnRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Feedback is required",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { feedback } = validation.data

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

    // Determine new status and notification recipient based on role
    let newStatus: string
    let notificationUserId: string
    let notificationMessage: string

    if (user.role === "admin") {
      // Admin returns to Lead
      if (eventRequest.status !== "under_review") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_STATUS",
              message: `Cannot return request with status: ${eventRequest.status}`,
            },
          },
          { status: 400 }
        )
      }
      newStatus = "returned"
      notificationUserId = eventRequest.creatorId
      notificationMessage = `${user.name} returned your event request '${eventRequest.title}' with feedback`
    } else {
      // Super Admin returns to Admin
      if (eventRequest.status !== "ready_for_approval") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_STATUS",
              message: `Cannot return request with status: ${eventRequest.status}`,
            },
          },
          { status: 400 }
        )
      }
      newStatus = "under_review"
      notificationUserId = eventRequest.adminId || "user-admin-001"
      notificationMessage = `Super Admin returned event request '${eventRequest.title}' for further review`
    }

    // Update request status
    mockRequests[requestIndex] = {
      ...eventRequest,
      status: newStatus as any,
      updatedAt: new Date(),
    }

    // Log to audit trail
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "return_request",
      resourceType: "event_request",
      resourceId: id,
      changes: {
        status: { from: eventRequest.status, to: newStatus },
      },
      reason: feedback,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    // Create notification
    const notification = {
      id: `notif-${Date.now()}`,
      userId: notificationUserId,
      title: "Request Returned",
      message: notificationMessage,
      type: "warning" as const,
      resourceType: "event_request",
      resourceId: id,
      createdAt: new Date(),
    }

    mockNotifications.push(notification)

    return NextResponse.json({
      success: true,
      data: {
        ...mockRequests[requestIndex],
        feedback,
      },
    })
  } catch (error) {
    console.error("Error returning request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while returning the request",
        },
      },
      { status: 500 }
    )
  }
}
