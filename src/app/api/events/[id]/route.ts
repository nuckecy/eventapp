import { NextRequest, NextResponse } from "next/server"
import { mockEvents } from "@/lib/mock-data"

/**
 * GET /api/events/[id]
 * Fetch single event details
 * Public access (no authentication required)
 *
 * @param params - Route params containing event ID
 * @returns Single event object with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Find event in mock data (in production, query database)
    const event = mockEvents.find((e) => e.id === id)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Event not found",
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching event details",
        },
      },
      { status: 500 }
    )
  }
}
