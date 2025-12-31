/**
 * Workflow Service
 * Manages request status transitions and workflow rules
 */

// Prisma Client will be available after running: pnpm db:generate
// import { prisma } from "./prisma"
import { AuditService } from "./audit"
import { NotificationService } from "./notifications"

export type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "ready_for_approval"
  | "approved"
  | "returned"
  | "deleted"

export type UserRole = "member" | "lead" | "admin" | "superadmin"

export interface StatusTransition {
  from: RequestStatus
  to: RequestStatus
  allowedRoles: UserRole[]
}

export interface ValidateTransitionParams {
  currentStatus: RequestStatus
  newStatus: RequestStatus
  userRole: UserRole
}

export interface ExecuteTransitionParams {
  requestId: string
  newStatus: RequestStatus
  userId: string
  userRole: UserRole
  feedback?: string
  ipAddress?: string
}

export interface TransitionResult {
  success: boolean
  message: string
  request?: any
}

/**
 * WorkflowService class for managing request status transitions
 */
export class WorkflowService {
  /**
   * Define all valid status transitions
   * Each transition specifies allowed roles
   */
  private static transitions: StatusTransition[] = [
    // Lead transitions
    {
      from: "draft",
      to: "submitted",
      allowedRoles: ["lead"],
    },
    // Admin transitions
    {
      from: "submitted",
      to: "under_review",
      allowedRoles: ["admin"],
    },
    {
      from: "under_review",
      to: "returned",
      allowedRoles: ["admin"],
    },
    {
      from: "under_review",
      to: "ready_for_approval",
      allowedRoles: ["admin"],
    },
    // Super Admin transitions
    {
      from: "ready_for_approval",
      to: "approved",
      allowedRoles: ["superadmin"],
    },
    {
      from: "ready_for_approval",
      to: "returned",
      allowedRoles: ["superadmin"],
    },
    {
      from: "ready_for_approval",
      to: "deleted",
      allowedRoles: ["superadmin"],
    },
    // Resubmission after returned
    {
      from: "returned",
      to: "submitted",
      allowedRoles: ["lead"], // Lead can resubmit after Admin returns
    },
    {
      from: "returned",
      to: "under_review",
      allowedRoles: ["admin"], // Admin can reclaim after Super Admin returns
    },
  ]

  /**
   * Validate if a status transition is allowed
   * @param params - Validation parameters
   * @returns Validation result with error message if invalid
   */
  static validateTransition(
    params: ValidateTransitionParams
  ): { valid: boolean; error?: string } {
    const { currentStatus, newStatus, userRole } = params

    // Find matching transition
    const transition = this.transitions.find(
      (t) => t.from === currentStatus && t.to === newStatus
    )

    if (!transition) {
      return {
        valid: false,
        error: `Invalid transition from '${currentStatus}' to '${newStatus}'`,
      }
    }

    // Check if user role is allowed
    if (!transition.allowedRoles.includes(userRole)) {
      return {
        valid: false,
        error: `Role '${userRole}' is not allowed to transition from '${currentStatus}' to '${newStatus}'`,
      }
    }

    return { valid: true }
  }

  /**
   * Execute a status transition with validation and logging
   * @param params - Transition execution parameters
   * @returns Transition result
   */
  static async executeTransition(
    params: ExecuteTransitionParams
  ): Promise<TransitionResult> {
    const { requestId, newStatus, userId, userRole, feedback, ipAddress } =
      params

    try {
      // TODO: Replace with real Prisma call to get current request
      /*
      const request = await prisma.eventRequest.findUnique({
        where: { id: requestId },
        include: {
          creator: true,
          admin: true,
          department: true,
        },
      })

      if (!request) {
        return {
          success: false,
          message: 'Request not found',
        }
      }

      const currentStatus = request.status
      */

      // Mock implementation - in real use, fetch from database
      const currentStatus: RequestStatus = "draft" // This would come from database
      console.log(`[WorkflowService] Executing transition for request ${requestId}`)

      // Validate transition
      const validation = this.validateTransition({
        currentStatus,
        newStatus,
        userRole,
      })

      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || "Invalid transition",
        }
      }

      // Update request status with additional fields based on transition
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date(),
      }

      // Set timestamps and admin assignment based on transition
      switch (newStatus) {
        case "submitted":
          updateData.submittedAt = new Date()
          break
        case "under_review":
          updateData.reviewedAt = new Date()
          updateData.adminId = userId // Assign admin when claiming
          break
        case "ready_for_approval":
          // Keep admin assignment
          break
        case "approved":
          updateData.approvedAt = new Date()
          break
        case "deleted":
          updateData.deletedAt = new Date()
          break
        case "returned":
          // Reset to earlier stage, clear forward timestamps
          if (currentStatus === "ready_for_approval") {
            // Super Admin returning to Admin
            updateData.reviewedAt = new Date() // Reset review timestamp
          }
          break
      }

      // TODO: Replace with real Prisma update
      /*
      const updatedRequest = await prisma.eventRequest.update({
        where: { id: requestId },
        data: updateData,
      })
      */

      // Log the transition in audit trail
      await AuditService.logAction({
        userId,
        userRole,
        action: this.getAuditAction(newStatus),
        resourceType: "event_request",
        resourceId: requestId,
        reason: feedback,
        ipAddress,
      })

      // If feedback provided, save it
      if (feedback) {
        // TODO: Replace with real Prisma call
        /*
        await prisma.requestFeedback.create({
          data: {
            requestId,
            userId,
            userRole,
            action: this.getAuditAction(newStatus),
            feedback,
          },
        })
        */
        console.log(`[WorkflowService] Saved feedback for request ${requestId}`)
      }

      return {
        success: true,
        message: `Request successfully transitioned to '${newStatus}'`,
        request: { id: requestId, status: newStatus }, // Mock return
      }
    } catch (error) {
      console.error("[WorkflowService] Error executing transition:", error)
      return {
        success: false,
        message: `Failed to execute transition: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Get audit action type based on status
   * @param status - New status
   * @returns Audit action type
   */
  private static getAuditAction(status: RequestStatus): string {
    const actionMap: Record<RequestStatus, string> = {
      draft: "created",
      submitted: "submitted",
      under_review: "claimed",
      ready_for_approval: "forwarded",
      approved: "approved",
      returned: "returned",
      deleted: "deleted",
    }

    return actionMap[status] || "updated"
  }

  /**
   * Get allowed transitions for a given status and role
   * @param currentStatus - Current request status
   * @param userRole - User's role
   * @returns Array of allowed next statuses
   */
  static getAllowedTransitions(
    currentStatus: RequestStatus,
    userRole: UserRole
  ): RequestStatus[] {
    return this.transitions
      .filter(
        (t) => t.from === currentStatus && t.allowedRoles.includes(userRole)
      )
      .map((t) => t.to)
  }

  /**
   * Check if a specific transition is allowed
   * @param currentStatus - Current request status
   * @param newStatus - Desired new status
   * @param userRole - User's role
   * @returns True if transition is allowed
   */
  static isTransitionAllowed(
    currentStatus: RequestStatus,
    newStatus: RequestStatus,
    userRole: UserRole
  ): boolean {
    const validation = this.validateTransition({
      currentStatus,
      newStatus,
      userRole,
    })
    return validation.valid
  }

  /**
   * Get human-readable status label
   * @param status - Request status
   * @returns Human-readable label
   */
  static getStatusLabel(status: RequestStatus): string {
    const labels: Record<RequestStatus, string> = {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      ready_for_approval: "Ready for Approval",
      approved: "Approved",
      returned: "Returned",
      deleted: "Deleted",
    }

    return labels[status] || status
  }

  /**
   * Get status badge color for UI
   * @param status - Request status
   * @returns Tailwind color class
   */
  static getStatusColor(status: RequestStatus): string {
    const colors: Record<RequestStatus, string> = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      ready_for_approval: "bg-green-100 text-green-800",
      approved: "bg-green-600 text-white",
      returned: "bg-red-100 text-red-800",
      deleted: "bg-red-600 text-white",
    }

    return colors[status] || "bg-gray-100 text-gray-800"
  }
}

/**
 * Helper functions for common workflow operations
 */

/**
 * Submit a draft request
 */
export async function submitRequest(
  requestId: string,
  userId: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "submitted",
    userId,
    userRole: "lead",
    ipAddress,
  })
}

/**
 * Claim a submitted request (Admin)
 */
export async function claimRequest(
  requestId: string,
  adminId: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "under_review",
    userId: adminId,
    userRole: "admin",
    ipAddress,
  })
}

/**
 * Return request to Lead (Admin)
 */
export async function returnRequestToLead(
  requestId: string,
  adminId: string,
  feedback: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "returned",
    userId: adminId,
    userRole: "admin",
    feedback,
    ipAddress,
  })
}

/**
 * Forward request to Super Admin (Admin)
 */
export async function forwardToSuperAdmin(
  requestId: string,
  adminId: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "ready_for_approval",
    userId: adminId,
    userRole: "admin",
    ipAddress,
  })
}

/**
 * Approve request (Super Admin)
 */
export async function approveRequest(
  requestId: string,
  superAdminId: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "approved",
    userId: superAdminId,
    userRole: "superadmin",
    ipAddress,
  })
}

/**
 * Return request to Admin (Super Admin)
 */
export async function returnRequestToAdmin(
  requestId: string,
  superAdminId: string,
  feedback: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "returned",
    userId: superAdminId,
    userRole: "superadmin",
    feedback,
    ipAddress,
  })
}

/**
 * Delete request permanently (Super Admin only)
 */
export async function deleteRequest(
  requestId: string,
  superAdminId: string,
  reason: string,
  ipAddress?: string
): Promise<TransitionResult> {
  return WorkflowService.executeTransition({
    requestId,
    newStatus: "deleted",
    userId: superAdminId,
    userRole: "superadmin",
    feedback: reason,
    ipAddress,
  })
}
