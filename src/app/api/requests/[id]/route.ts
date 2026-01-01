import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockAuditLogs } from "@/lib/mock-data"
import { updateRequestSchema } from "@/lib/validators/request"

/**
 * GET /api/requests/[id]
 * Fetch single request with details
 * Requires authentication
 *
 * @param params - Route params containing request ID
 * @returns Single request object with full details
 */
export async function GET(
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

    const { id } = params

    // Find request in mock data
    const eventRequest = mockRequests.find((r) => r.id === id)

    if (!eventRequest) {
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

    // Check permissions
    if (user.role === "lead" && eventRequest.creatorId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to view this request",
          },
        },
        { status: 403 }
      )
    }

    // Get related audit logs for this request
    const relatedAuditLogs = mockAuditLogs
      .filter((log) => log.resourceId === id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json({
      success: true,
      data: {
        ...eventRequest,
        auditLogs: relatedAuditLogs,
      },
    })
  } catch (error) {
    console.error("Error fetching request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching the request",
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/requests/[id]
 * Update request details (tracks changes in audit log)
 * Requires authentication
 *
 * Permissions:
 * - Lead: Can update their own draft requests
 * - Admin: Can update submitted/under_review requests
 * - Super Admin: Can update ready_for_approval requests
 *
 * @param params - Route params containing request ID
 * @returns Updated request object
 */
export async function PATCH(
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

    // Check permissions based on role and request status
    if (user.role === "lead") {
      if (
        eventRequest.creatorId !== user.id ||
        eventRequest.status !== "draft"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message:
                "You can only update your own draft requests",
            },
          },
          { status: 403 }
        )
      }
    } else if (user.role === "admin") {
      if (
        !["submitted", "under_review"].includes(eventRequest.status)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message:
                "Admins can only update submitted or under review requests",
            },
          },
          { status: 403 }
        )
      }
    } else if (user.role === "superadmin") {
      if (eventRequest.status !== "ready_for_approval") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message:
                "Super Admins can only update requests ready for approval",
            },
          },
          { status: 403 }
        )
      }
    }

    // Parse and validate update data
    const body = await request.json()
    const validation = updateRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const updates = validation.data

    // Track changes for audit log
    const changes: Record<string, any> = {}
    Object.keys(updates).forEach((key) => {
      const oldValue = (eventRequest as any)[key]
      const newValue = (updates as any)[key]
      if (oldValue !== newValue) {
        changes[key] = { from: oldValue, to: newValue }
      }
    })

    // Update the request
    mockRequests[requestIndex] = {
      ...eventRequest,
      ...updates,
      updatedAt: new Date(),
    }

    // Log to audit trail
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "update_request",
      resourceType: "event_request",
      resourceId: id,
      changes,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    return NextResponse.json({
      success: true,
      data: mockRequests[requestIndex],
    })
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while updating the request",
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/requests/[id]
 * Permanently delete request (Super Admin only)
 * Logs deletion in audit trail
 *
 * @param params - Route params containing request ID
 * @returns Confirmation message
 */
export async function DELETE(
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

    // Only Super Admins can delete
    if (user.role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only Super Admins can permanently delete requests",
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

    // Parse optional reason from body
    let reason: string | undefined
    try {
      const body = await request.json()
      reason = body.reason
    } catch {
      // No body provided, that's okay
    }

    // Log deletion to audit trail (PERMANENT RECORD)
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "delete_request",
      resourceType: "event_request",
      resourceId: id,
      changes: {
        deleted: true,
        deletedRequest: {
          ...eventRequest,
          deletedAt: new Date(),
        },
      },
      reason: reason || "No reason provided",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    // Remove request from array (in production, mark as deleted in database)
    mockRequests.splice(requestIndex, 1)

    return NextResponse.json({
      success: true,
      data: {
        message: "Request permanently deleted",
        deletedId: id,
        auditLogId: auditLog.id,
      },
    })
  } catch (error) {
    console.error("Error deleting request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while deleting the request",
        },
      },
      { status: 500 }
    )
  }
}
