import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockAuditLogs, mockNotifications } from "@/lib/mock-data"

/**
 * POST /api/requests/[id]/submit
 * Submit a draft request for review
 * Changes status from "draft" to "submitted"
 * Notifies Admins
 * Requires authentication (Lead only)
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

    // Only Leads can submit requests
    if (user.role !== "lead") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only department leads can submit requests",
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

    // Verify ownership
    if (eventRequest.creatorId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only submit your own requests",
          },
        },
        { status: 403 }
      )
    }

    // Verify current status is draft
    if (eventRequest.status !== "draft") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot submit request with status: ${eventRequest.status}`,
          },
        },
        { status: 400 }
      )
    }

    // Update request status
    mockRequests[requestIndex] = {
      ...eventRequest,
      status: "submitted",
      submittedAt: new Date(),
      updatedAt: new Date(),
    }

    // Log to audit trail
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "submit_request",
      resourceType: "event_request",
      resourceId: id,
      changes: {
        status: { from: "draft", to: "submitted" },
        submittedAt: new Date(),
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    // Create notification for Admins
    const notification = {
      id: `notif-${Date.now()}`,
      userId: "user-admin-001", // In production, notify all admins
      title: "New Event Request",
      message: `${user.name} submitted a new event request: ${eventRequest.title}`,
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
    console.error("Error submitting request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while submitting the request",
        },
      },
      { status: 500 }
    )
  }
}
