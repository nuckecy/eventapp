import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockAuditLogs, mockNotifications } from "@/lib/mock-data"

/**
 * POST /api/requests/[id]/forward
 * Admin forwards request to Super Admin for final approval
 * Changes status from "under_review" to "ready_for_approval"
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

    // Only Admins can forward requests
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only administrators can forward requests to Super Admin",
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

    // Verify current status is under_review
    if (eventRequest.status !== "under_review") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: `Cannot forward request with status: ${eventRequest.status}`,
          },
        },
        { status: 400 }
      )
    }

    // Verify the admin forwarding is the one assigned to the request
    if (eventRequest.adminId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only forward requests assigned to you",
          },
        },
        { status: 403 }
      )
    }

    // Update request status
    mockRequests[requestIndex] = {
      ...eventRequest,
      status: "ready_for_approval",
      updatedAt: new Date(),
    }

    // Log to audit trail
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "forward_request",
      resourceType: "event_request",
      resourceId: id,
      changes: {
        status: { from: "under_review", to: "ready_for_approval" },
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    // Notify Super Admin
    const notification = {
      id: `notif-${Date.now()}`,
      userId: "user-superadmin-001", // In production, notify all super admins
      title: "Request Ready for Approval",
      message: `${user.name} forwarded event request '${eventRequest.title}' for your approval`,
      type: "success" as const,
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
    console.error("Error forwarding request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while forwarding the request",
        },
      },
      { status: 500 }
    )
  }
}
