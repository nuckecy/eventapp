import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockAuditLogs } from "@/lib/mock-data"

/**
 * Query parameters validation schema for audit log filtering
 */
const auditQuerySchema = z.object({
  requestId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
})

/**
 * GET /api/audit
 * Fetch audit logs with filtering
 * Requires authentication (Admin or Super Admin only)
 *
 * Query params:
 * - requestId: Filter by specific request ID
 * - userId: Filter by user who performed the action
 * - startDate: ISO date string for start of date range
 * - endDate: ISO date string for end of date range
 * - action: Filter by action type (e.g., "create_request", "approve_request")
 * - resourceType: Filter by resource type (e.g., "event_request", "event")
 *
 * @returns Array of audit log entries
 */
export async function GET(request: NextRequest) {
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

    // Only Admins and Super Admins can view audit logs
    if (!["admin", "superadmin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message:
              "Only administrators can view audit logs",
          },
        },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      requestId: searchParams.get("requestId") || undefined,
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      action: searchParams.get("action") || undefined,
      resourceType: searchParams.get("resourceType") || undefined,
    }

    // Validate query parameters
    const validation = auditQuerySchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      )
    }

    // Start with all audit logs
    let filteredLogs = [...mockAuditLogs]

    // Filter by request ID
    if (queryParams.requestId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.resourceId === queryParams.requestId
      )
    }

    // Filter by user ID
    if (queryParams.userId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.userId === queryParams.userId
      )
    }

    // Filter by date range
    if (queryParams.startDate) {
      const startDate = new Date(queryParams.startDate)
      filteredLogs = filteredLogs.filter(
        (log) => log.createdAt >= startDate
      )
    }

    if (queryParams.endDate) {
      const endDate = new Date(queryParams.endDate)
      filteredLogs = filteredLogs.filter(
        (log) => log.createdAt <= endDate
      )
    }

    // Filter by action type
    if (queryParams.action) {
      filteredLogs = filteredLogs.filter(
        (log) => log.action === queryParams.action
      )
    }

    // Filter by resource type
    if (queryParams.resourceType) {
      filteredLogs = filteredLogs.filter(
        (log) => log.resourceType === queryParams.resourceType
      )
    }

    // Sort by creation date (newest first)
    filteredLogs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return NextResponse.json({
      success: true,
      data: {
        logs: filteredLogs,
        totalCount: filteredLogs.length,
      },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching audit logs",
        },
      },
      { status: 500 }
    )
  }
}
