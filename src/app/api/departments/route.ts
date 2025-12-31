import { NextResponse } from "next/server"
import { mockDepartments } from "@/lib/mock-data"

/**
 * GET /api/departments
 * Fetch all departments with lead contact information
 * Public access (no authentication required)
 *
 * @returns Array of all departments with lead contact info
 */
export async function GET() {
  try {
    // Return all departments (in production, query from database)
    return NextResponse.json({
      success: true,
      data: mockDepartments,
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching departments",
        },
      },
      { status: 500 }
    )
  }
}
