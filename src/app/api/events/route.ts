import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { mockEvents } from "@/lib/mock-data"

/**
 * Query parameters validation schema for events filtering
 */
const eventsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.string().optional(), // Comma-separated: "sunday,local,regional"
  department: z.string().optional(),
})

/**
 * GET /api/events
 * Fetch published events with optional filters
 * Public access (no authentication required)
 *
 * Query params:
 * - startDate: ISO date string (e.g., "2025-01-01")
 * - endDate: ISO date string
 * - type: Event types comma-separated (e.g., "sunday,local")
 * - department: Department ID
 *
 * @returns Array of published events
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      type: searchParams.get("type") || undefined,
      department: searchParams.get("department") || undefined,
    }

    // Validate query parameters
    const validation = eventsQuerySchema.safeParse(queryParams)
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

    // Start with all mock events (in production, these would be from database)
    let filteredEvents = [...mockEvents]

    // Filter by date range
    if (queryParams.startDate) {
      const startDate = new Date(queryParams.startDate)
      filteredEvents = filteredEvents.filter(
        (event) => event.eventDate >= startDate
      )
    }

    if (queryParams.endDate) {
      const endDate = new Date(queryParams.endDate)
      filteredEvents = filteredEvents.filter(
        (event) => event.eventDate <= endDate
      )
    }

    // Filter by event type
    if (queryParams.type) {
      const types = queryParams.type.split(",").map((t) => t.trim())
      filteredEvents = filteredEvents.filter((event) =>
        types.includes(event.eventType)
      )
    }

    // Filter by department
    if (queryParams.department) {
      filteredEvents = filteredEvents.filter(
        (event) => event.departmentId === queryParams.department
      )
    }

    // Sort by date (ascending)
    filteredEvents.sort(
      (a, b) => a.eventDate.getTime() - b.eventDate.getTime()
    )

    return NextResponse.json({
      success: true,
      data: filteredEvents,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching events",
        },
      },
      { status: 500 }
    )
  }
}
