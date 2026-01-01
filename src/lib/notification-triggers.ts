/**
 * Notification Triggers
 * Handles sending notifications and emails for various request lifecycle events
 */

// Prisma Client will be available after running: pnpm db:generate
// import { prisma } from "./prisma"
import { NotificationService } from "./notifications"
import {
  sendRequestSubmittedEmail,
  sendRequestReturnedEmail,
  sendRequestApprovedEmail,
  sendRequestDeletedEmail,
} from "./email"

export interface EventRequest {
  id: string
  requestNumber: string
  title: string
  eventType: string
  eventDate: Date
  startTime: Date
  endTime: Date
  location?: string
  department: {
    id: string
    name: string
  }
  creator: {
    id: string
    name: string
    email: string
  }
  admin?: {
    id: string
    name: string
    email: string
  }
}

/**
 * Get base URL for the application
 * @returns Base URL
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

/**
 * Format date for display in emails
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format time for display in emails
 * @param time - Time to format
 * @returns Formatted time string
 */
function formatTime(time: Date): string {
  return time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Get all admin email addresses
 * @returns Array of admin emails
 */
async function getAdminEmails(): Promise<string[]> {
  try {
    // TODO: Replace with real Prisma call
    /*
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'superadmin'],
        },
      },
      select: {
        email: true,
      },
    })

    return admins.map(admin => admin.email)
    */

    // Mock implementation
    console.log("[NotificationTriggers] Getting admin emails")
    return ["admin@church.com"] // Mock
  } catch (error) {
    console.error("[NotificationTriggers] Error getting admin emails:", error)
    return []
  }
}

/**
 * Get all super admin email addresses
 * @returns Array of super admin emails
 */
async function getSuperAdminEmails(): Promise<string[]> {
  try {
    // TODO: Replace with real Prisma call
    /*
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'superadmin',
      },
      select: {
        email: true,
      },
    })

    return superAdmins.map(admin => admin.email)
    */

    // Mock implementation
    console.log("[NotificationTriggers] Getting super admin emails")
    return ["superadmin@church.com"] // Mock
  } catch (error) {
    console.error(
      "[NotificationTriggers] Error getting super admin emails:",
      error
    )
    return []
  }
}

/**
 * Get all member email addresses
 * @returns Array of member emails
 */
async function getAllMemberEmails(): Promise<string[]> {
  try {
    // TODO: Replace with real Prisma call
    /*
    const members = await prisma.user.findMany({
      where: {
        role: {
          in: ['member', 'lead', 'admin', 'superadmin'],
        },
      },
      select: {
        email: true,
      },
    })

    return members.map(member => member.email)
    */

    // Mock implementation
    console.log("[NotificationTriggers] Getting all member emails")
    return [] // Mock: Return empty for now to avoid spamming
  } catch (error) {
    console.error(
      "[NotificationTriggers] Error getting member emails:",
      error
    )
    return []
  }
}

/**
 * Trigger notifications when a request is submitted
 * Notifies all admins that a new request needs review
 * @param request - Event request that was submitted
 */
export async function onRequestSubmitted(
  request: EventRequest
): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Request submitted: ${request.requestNumber}`
    )

    // Get all admin emails
    const adminEmails = await getAdminEmails()

    // Create notifications for each admin
    // TODO: Replace with real Prisma call to get admin IDs
    /*
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'superadmin'],
        },
      },
    })

    for (const admin of admins) {
      await NotificationService.createNotification({
        userId: admin.id,
        title: 'New Event Request',
        message: `${request.creator.name} submitted a new event request: ${request.title}`,
        type: 'info',
        resourceType: 'event_request',
        resourceId: request.id,
      })
    }
    */

    console.log(
      `[NotificationTriggers] Created notifications for ${adminEmails.length} admins`
    )

    // Send email notifications to admins
    if (adminEmails.length > 0) {
      await sendRequestSubmittedEmail(adminEmails, {
        requestNumber: request.requestNumber,
        title: request.title,
        eventType: request.eventType,
        department: request.department.name,
        eventDate: formatEventDate(request.eventDate),
        submittedBy: request.creator.name,
        viewUrl: `${getBaseUrl()}/dashboard/admin?request=${request.id}`,
      })
    }

    console.log(
      `[NotificationTriggers] Sent submission emails to ${adminEmails.length} admins`
    )
  } catch (error) {
    console.error(
      "[NotificationTriggers] Error in onRequestSubmitted:",
      error
    )
  }
}

/**
 * Trigger notifications when a request is returned
 * Notifies the creator that their request needs revision
 * @param request - Event request that was returned
 * @param feedback - Feedback from the reviewer
 */
export async function onRequestReturned(
  request: EventRequest,
  feedback: string
): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Request returned: ${request.requestNumber}`
    )

    // Determine who returned it (admin or super admin)
    const returnedBy = request.admin?.name || "Administrator"

    // Create notification for the creator
    await NotificationService.createNotification({
      userId: request.creator.id,
      title: "Request Returned",
      message: `Your event request "${request.title}" has been returned for revision. ${feedback}`,
      type: "warning",
      resourceType: "event_request",
      resourceId: request.id,
    })

    console.log(
      `[NotificationTriggers] Created notification for creator: ${request.creator.email}`
    )

    // Send email notification to creator
    await sendRequestReturnedEmail(request.creator.email, {
      requestNumber: request.requestNumber,
      title: request.title,
      feedback,
      returnedBy,
      editUrl: `${getBaseUrl()}/requests/${request.id}/edit`,
    })

    console.log(
      `[NotificationTriggers] Sent return email to creator: ${request.creator.email}`
    )
  } catch (error) {
    console.error("[NotificationTriggers] Error in onRequestReturned:", error)
  }
}

/**
 * Trigger notifications when a request is forwarded
 * Notifies super admins that a request is ready for final approval
 * @param request - Event request that was forwarded
 */
export async function onRequestForwarded(
  request: EventRequest
): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Request forwarded: ${request.requestNumber}`
    )

    // Get all super admin emails
    const superAdminEmails = await getSuperAdminEmails()

    // Create notifications for each super admin
    // TODO: Replace with real Prisma call
    /*
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'superadmin',
      },
    })

    for (const superAdmin of superAdmins) {
      await NotificationService.createNotification({
        userId: superAdmin.id,
        title: 'Request Ready for Approval',
        message: `Event request "${request.title}" is ready for your final approval`,
        type: 'info',
        resourceType: 'event_request',
        resourceId: request.id,
      })
    }
    */

    console.log(
      `[NotificationTriggers] Created notifications for ${superAdminEmails.length} super admins`
    )

    // Send email to super admins
    if (superAdminEmails.length > 0) {
      await sendRequestSubmittedEmail(superAdminEmails, {
        requestNumber: request.requestNumber,
        title: request.title,
        eventType: request.eventType,
        department: request.department.name,
        eventDate: formatEventDate(request.eventDate),
        submittedBy: request.admin?.name || "Administrator",
        viewUrl: `${getBaseUrl()}/dashboard/super-admin?request=${request.id}`,
      })
    }

    console.log(
      `[NotificationTriggers] Sent forwarding emails to ${superAdminEmails.length} super admins`
    )
  } catch (error) {
    console.error(
      "[NotificationTriggers] Error in onRequestForwarded:",
      error
    )
  }
}

/**
 * Trigger notifications when a request is approved
 * Notifies creator, admin, and all members that an event is approved and published
 * @param request - Event request that was approved
 */
export async function onRequestApproved(
  request: EventRequest
): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Request approved: ${request.requestNumber}`
    )

    // Notify the creator
    await NotificationService.createNotification({
      userId: request.creator.id,
      title: "Event Approved!",
      message: `Your event "${request.title}" has been approved and is now published on the calendar`,
      type: "success",
      resourceType: "event_request",
      resourceId: request.id,
    })

    // Notify the admin who processed it
    if (request.admin) {
      await NotificationService.createNotification({
        userId: request.admin.id,
        title: "Event Approved",
        message: `The event "${request.title}" you reviewed has been approved`,
        type: "success",
        resourceType: "event_request",
        resourceId: request.id,
      })
    }

    console.log(
      "[NotificationTriggers] Created notifications for creator and admin"
    )

    // Get all member emails for announcement
    const memberEmails = await getAllMemberEmails()

    // Prepare email recipients (creator, admin, and optionally all members)
    const recipients: string[] = [request.creator.email]
    if (request.admin?.email) {
      recipients.push(request.admin.email)
    }
    // Uncomment to notify all members when events are approved
    // recipients.push(...memberEmails)

    // Send approval email
    await sendRequestApprovedEmail(recipients, {
      requestNumber: request.requestNumber,
      title: request.title,
      eventType: request.eventType,
      eventDate: formatEventDate(request.eventDate),
      location: request.location || "TBD",
      approvedBy: "Super Admin",
      viewUrl: `${getBaseUrl()}/?event=${request.id}`,
    })

    console.log(
      `[NotificationTriggers] Sent approval emails to ${recipients.length} recipients`
    )

    // Optional: Create notifications for all members
    // This is commented out to avoid spamming, but can be enabled if desired
    /*
    const allMembers = await prisma.user.findMany({
      where: {
        role: {
          in: ['member', 'lead', 'admin', 'superadmin'],
        },
      },
    })

    for (const member of allMembers) {
      await NotificationService.createNotification({
        userId: member.id,
        title: 'New Event Published',
        message: `${request.title} on ${formatEventDate(request.eventDate)}`,
        type: 'info',
        resourceType: 'event',
        resourceId: request.id,
      })
    }
    */
  } catch (error) {
    console.error("[NotificationTriggers] Error in onRequestApproved:", error)
  }
}

/**
 * Trigger notifications when a request is deleted
 * Notifies creator and admin that a request was permanently deleted
 * @param request - Event request that was deleted
 * @param reason - Reason for deletion
 */
export async function onRequestDeleted(
  request: EventRequest,
  reason: string
): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Request deleted: ${request.requestNumber}`
    )

    // Notify the creator
    await NotificationService.createNotification({
      userId: request.creator.id,
      title: "Request Deleted",
      message: `Your event request "${request.title}" has been permanently deleted. Reason: ${reason}`,
      type: "error",
      resourceType: "event_request",
      resourceId: request.id,
    })

    // Notify the admin who processed it
    if (request.admin) {
      await NotificationService.createNotification({
        userId: request.admin.id,
        title: "Request Deleted",
        message: `The event request "${request.title}" has been permanently deleted. Reason: ${reason}`,
        type: "error",
        resourceType: "event_request",
        resourceId: request.id,
      })
    }

    console.log(
      "[NotificationTriggers] Created deletion notifications for creator and admin"
    )

    // Prepare email recipients
    const recipients: string[] = [request.creator.email]
    if (request.admin?.email) {
      recipients.push(request.admin.email)
    }

    // Send deletion email
    await sendRequestDeletedEmail(recipients, {
      requestNumber: request.requestNumber,
      title: request.title,
      reason,
      deletedBy: "Super Admin",
    })

    console.log(
      `[NotificationTriggers] Sent deletion emails to ${recipients.length} recipients`
    )
  } catch (error) {
    console.error("[NotificationTriggers] Error in onRequestDeleted:", error)
  }
}

/**
 * Trigger notifications when a request is claimed by an admin
 * Notifies the creator that their request is being reviewed
 * @param request - Event request that was claimed
 */
export async function onRequestClaimed(request: EventRequest): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Request claimed: ${request.requestNumber}`
    )

    // Notify the creator that their request is under review
    await NotificationService.createNotification({
      userId: request.creator.id,
      title: "Request Under Review",
      message: `Your event request "${request.title}" is now being reviewed by ${request.admin?.name || "an administrator"}`,
      type: "info",
      resourceType: "event_request",
      resourceId: request.id,
    })

    console.log(
      `[NotificationTriggers] Created claim notification for creator: ${request.creator.email}`
    )
  } catch (error) {
    console.error("[NotificationTriggers] Error in onRequestClaimed:", error)
  }
}

/**
 * Batch send notifications
 * Useful for system-wide announcements or bulk operations
 * @param userIds - Array of user IDs to notify
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 */
export async function batchSendNotifications(
  userIds: string[],
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
): Promise<void> {
  try {
    console.log(
      `[NotificationTriggers] Batch sending ${userIds.length} notifications`
    )

    for (const userId of userIds) {
      await NotificationService.createNotification({
        userId,
        title,
        message,
        type,
      })
    }

    console.log(
      `[NotificationTriggers] Successfully sent ${userIds.length} notifications`
    )
  } catch (error) {
    console.error(
      "[NotificationTriggers] Error in batchSendNotifications:",
      error
    )
  }
}
