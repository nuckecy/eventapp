import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockRequests, mockAuditLogs } from "@/lib/mock-data"
import { createRequestSchema } from "@/lib/validators/request"

/**
 * Query parameters validation schema for requests filtering
 */
const requestsQuerySchema = z.object({
  status: z.string().optional(),
  department: z.string().optional(),
})

/**
 * GET /api/requests
 * Fetch event requests filtered by role
 * Requires authentication
 *
 * Role-based filtering:
 * - Lead: Only their own requests
 * - Admin: All submitted/under_review requests
 * - Super Admin: All requests
 *
 * Query params:
 * - status: Filter by status
 * - department: Filter by department ID
 *
 * @returns Array of event requests
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

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      status: searchParams.get("status") || undefined,
      department: searchParams.get("department") || undefined,
    }

    // Validate query parameters
    const validation = requestsQuerySchema.safeParse(queryParams)
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

    // Filter requests based on user role
    let filteredRequests = [...mockRequests]

    switch (user.role) {
      case "lead":
        // Leads can only see their own requests
        filteredRequests = filteredRequests.filter(
          (req) => req.creatorId === user.id
        )
        break

      case "admin":
        // Admins can see submitted, under_review, and ready_for_approval requests
        filteredRequests = filteredRequests.filter((req) =>
          ["submitted", "under_review", "ready_for_approval"].includes(
            req.status
          )
        )
        break

      case "superadmin":
        // Super Admins can see all requests
        break

      default:
        // Members have no access to requests
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "You do not have permission to view requests",
            },
          },
          { status: 403 }
        )
    }

    // Apply additional filters
    if (queryParams.status) {
      const statuses = queryParams.status.split(",").map((s) => s.trim())
      filteredRequests = filteredRequests.filter((req) =>
        statuses.includes(req.status)
      )
    }

    if (queryParams.department) {
      filteredRequests = filteredRequests.filter(
        (req) => req.departmentId === queryParams.department
      )
    }

    // Sort by creation date (newest first)
    filteredRequests.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return NextResponse.json({
      success: true,
      data: filteredRequests,
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching requests",
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/requests
 * Create new event request
 * Requires authentication (Lead role only)
 *
 * @returns Created request object
 */
export async function POST(request: NextRequest) {
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

    // Check if user is a Lead
    if (user.role !== "lead") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only department leads can create event requests",
          },
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate request data
    const validation = createRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Create new request (in production, save to database)
    const newRequest = {
      id: `req-${Date.now()}`,
      requestNumber: `REQ-${String(mockRequests.length + 1).padStart(3, "0")}`,
      title: data.title,
      eventType: data.eventType,
      departmentId: data.departmentId,
      departmentName: "Department Name", // Would be fetched from database
      creatorId: user.id,
      creatorName: user.name,
      creatorEmail: user.email,
      eventDate: new Date(data.eventDate),
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      description: data.description,
      expectedAttendance: data.expectedAttendance,
      budget: data.budget,
      specialRequirements: data.specialRequirements,
      status: "draft" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Log to audit trail (in production, save to database)
    const auditLog = {
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "create_request",
      resourceType: "event_request",
      resourceId: newRequest.id,
      changes: { status: "draft" },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      createdAt: new Date(),
    }

    mockAuditLogs.push(auditLog)

    return NextResponse.json(
      {
        success: true,
        data: newRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while creating the request",
        },
      },
      { status: 500 }
    )
  }
}
