import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { mockNotifications } from "@/lib/mock-data"

/**
 * GET /api/notifications
 * Fetch user's notifications
 * Requires authentication
 *
 * Returns notifications sorted by creation date (newest first)
 * Includes both read and unread notifications
 *
 * @returns Array of user's notifications
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

    // Filter notifications for the current user
    const userNotifications = mockNotifications
      .filter((notif) => notif.userId === user.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Separate into unread and read
    const unreadNotifications = userNotifications.filter((n) => !n.readAt)
    const readNotifications = userNotifications.filter((n) => n.readAt)

    return NextResponse.json({
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount: unreadNotifications.length,
        totalCount: userNotifications.length,
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while fetching notifications",
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 * Requires authentication
 *
 * Body:
 * - notificationIds: Array of notification IDs to mark as read
 * - markAllAsRead: Boolean to mark all user notifications as read
 *
 * @returns Updated notifications
 */
export async function PATCH(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all user notifications as read
      mockNotifications.forEach((notif) => {
        if (notif.userId === user.id && !notif.readAt) {
          notif.readAt = new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          message: "All notifications marked as read",
          updatedCount: mockNotifications.filter(
            (n) => n.userId === user.id && n.readAt
          ).length,
        },
      })
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "notificationIds must be an array",
          },
        },
        { status: 400 }
      )
    }

    // Mark specific notifications as read
    const updatedNotifications: any[] = []
    mockNotifications.forEach((notif) => {
      if (
        notificationIds.includes(notif.id) &&
        notif.userId === user.id &&
        !notif.readAt
      ) {
        notif.readAt = new Date()
        updatedNotifications.push(notif)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        message: `${updatedNotifications.length} notifications marked as read`,
        updatedNotifications,
      },
    })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while updating notifications",
        },
      },
      { status: 500 }
    )
  }
}
