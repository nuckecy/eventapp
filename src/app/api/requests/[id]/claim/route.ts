import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockAuditLogs, mockNotifications } from "@/lib/mock-data"

/**
 * POST /api/requests/[id]/claim
 * Admin claims a submitted request for review
 * Changes status from "submitted" to "under_review"
 * Assigns admin to the request
 * Requires authentication (Admin only)
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

    // Only Admins can claim requests
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only administrators can claim requests",
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

    // Verify current status is submitted
    if (eventRequest.status !== "submitted") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot claim request with status: ${eventRequest.status}`,
          },
        },
        { status: 400 }
      )
    }

    // Update request status and assign admin
    mockRequests[requestIndex] = {
      ...eventRequest,
      status: "under_review",
      adminId: user.id,
      adminName: user.name,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }

    // Log to audit trail
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "claim_request",
      resourceType: "event_request",
      resourceId: id,
      changes: {
        status: { from: "submitted", to: "under_review" },
        adminId: user.id,
        reviewedAt: new Date(),
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    // Notify the Lead who submitted the request
    const notification = {
      id: `notif-${Date.now()}`,
      userId: eventRequest.creatorId,
      title: "Request Under Review",
      message: `${user.name} is now reviewing your event request: ${eventRequest.title}`,
      type: "info" as const,
      resourceType: "event_request",
      resourceId: id,
      createdAt: new Date(),
    }

    mockNotifications.push(notification)

    return NextResponse.json({
      success: true,
      data: mockRequests[requestIndex],
    })
  } catch (error) {
    console.error("Error claiming request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while claiming the request",
        },
      },
      { status: 500 }
    )
  }
}
