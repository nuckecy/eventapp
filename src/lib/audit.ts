/**
 * Audit Service
 * Handles audit logging for compliance and governance
 */

// Prisma Client will be available after running: pnpm db:generate
// import { prisma } from "./prisma"

export type AuditAction =
  | "created"
  | "submitted"
  | "claimed"
  | "updated"
  | "forwarded"
  | "approved"
  | "returned"
  | "deleted"

export type ResourceType = "event_request" | "event" | "user" | "department"

export interface AuditLog {
  id: string
  userId?: string
  userRole?: string
  action: AuditAction
  resourceType: ResourceType
  resourceId: string
  changes?: Record<string, any>
  reason?: string
  ipAddress?: string
  createdAt: Date
}

export interface LogActionParams {
  userId?: string
  userRole?: string
  action: AuditAction
  resourceType: ResourceType
  resourceId: string
  changes?: Record<string, any>
  reason?: string
  ipAddress?: string
}

export interface GetAuditLogParams {
  requestId?: string
  userId?: string
  startDate?: Date
  endDate?: Date
  action?: AuditAction
  resourceType?: ResourceType
  limit?: number
}

/**
 * AuditService class for managing audit logs
 */
export class AuditService {
  /**
   * Log an action to the audit trail
   * @param params - Audit log parameters
   * @returns Created audit log entry
   */
  static async logAction(params: LogActionParams): Promise<AuditLog> {
    const {
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      changes,
      reason,
      ipAddress,
    } = params

    try {
      // TODO: Replace with real Prisma call once client is generated
      /*
      const auditLog = await prisma.auditLog.create({
        data: {
          userId,
          userRole,
          action,
          resourceType,
          resourceId,
          changes: changes || null,
          reason,
          ipAddress,
        },
      })

      return auditLog
      */

      // Mock implementation for development
      const auditLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userRole,
        action,
        resourceType,
        resourceId,
        changes,
        reason,
        ipAddress,
        createdAt: new Date(),
      }

      console.log("[AuditService] Logged action:", {
        action,
        resourceType,
        resourceId,
        userId,
        userRole,
      })

      return auditLog
    } catch (error) {
      console.error("[AuditService] Error logging action:", error)
      throw new Error(`Failed to log action: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Get audit log entries with optional filters
   * @param filters - Query filters
   * @returns Array of audit log entries
   */
  static async getAuditLog(
    filters: GetAuditLogParams = {}
  ): Promise<AuditLog[]> {
    const {
      requestId,
      userId,
      startDate,
      endDate,
      action,
      resourceType,
      limit = 100,
    } = filters

    try {
      // TODO: Replace with real Prisma call
      /*
      const where: any = {}

      if (requestId) {
        where.resourceId = requestId
        where.resourceType = 'event_request'
      }

      if (userId) {
        where.userId = userId
      }

      if (action) {
        where.action = action
      }

      if (resourceType) {
        where.resourceType = resourceType
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
          where.createdAt.gte = startDate
        }
        if (endDate) {
          where.createdAt.lte = endDate
        }
      }

      const auditLogs = await prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      })

      return auditLogs
      */

      // Mock implementation
      console.log("[AuditService] Getting audit logs with filters:", filters)
      return [] // Mock: returns empty array for now
    } catch (error) {
      console.error("[AuditService] Error getting audit log:", error)
      throw new Error(`Failed to get audit log: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Get audit log for a specific request
   * @param requestId - Request ID
   * @returns Array of audit log entries for the request
   */
  static async getRequestAuditLog(requestId: string): Promise<AuditLog[]> {
    return this.getAuditLog({ requestId })
  }

  /**
   * Get audit log for a specific user
   * @param userId - User ID
   * @param limit - Maximum number of entries to return
   * @returns Array of audit log entries for the user
   */
  static async getUserAuditLog(
    userId: string,
    limit?: number
  ): Promise<AuditLog[]> {
    return this.getAuditLog({ userId, limit })
  }

  /**
   * Get audit log for a date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param limit - Maximum number of entries to return
   * @returns Array of audit log entries within the date range
   */
  static async getAuditLogByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<AuditLog[]> {
    return this.getAuditLog({ startDate, endDate, limit })
  }

  /**
   * Get all deletion logs (for Super Admin oversight)
   * @param limit - Maximum number of entries to return
   * @returns Array of deletion audit log entries
   */
  static async getDeletionLogs(limit?: number): Promise<AuditLog[]> {
    return this.getAuditLog({ action: "deleted", limit })
  }
}

/**
 * Helper functions for logging common actions
 */

/**
 * Log request creation
 */
export async function logRequestCreated(
  userId: string,
  userRole: string,
  requestId: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "created",
    resourceType: "event_request",
    resourceId: requestId,
    ipAddress,
  })
}

/**
 * Log request submission
 */
export async function logRequestSubmitted(
  userId: string,
  userRole: string,
  requestId: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "submitted",
    resourceType: "event_request",
    resourceId: requestId,
    ipAddress,
  })
}

/**
 * Log request claimed by admin
 */
export async function logRequestClaimed(
  userId: string,
  userRole: string,
  requestId: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "claimed",
    resourceType: "event_request",
    resourceId: requestId,
    ipAddress,
  })
}

/**
 * Log request update with changes
 */
export async function logRequestUpdated(
  userId: string,
  userRole: string,
  requestId: string,
  changes: Record<string, any>,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "updated",
    resourceType: "event_request",
    resourceId: requestId,
    changes,
    ipAddress,
  })
}

/**
 * Log request forwarded to Super Admin
 */
export async function logRequestForwarded(
  userId: string,
  userRole: string,
  requestId: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "forwarded",
    resourceType: "event_request",
    resourceId: requestId,
    ipAddress,
  })
}

/**
 * Log request approval
 */
export async function logRequestApproved(
  userId: string,
  userRole: string,
  requestId: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "approved",
    resourceType: "event_request",
    resourceId: requestId,
    ipAddress,
  })
}

/**
 * Log request returned with feedback
 */
export async function logRequestReturned(
  userId: string,
  userRole: string,
  requestId: string,
  reason: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "returned",
    resourceType: "event_request",
    resourceId: requestId,
    reason,
    ipAddress,
  })
}

/**
 * Log request deletion (permanent removal by Super Admin)
 */
export async function logRequestDeleted(
  userId: string,
  userRole: string,
  requestId: string,
  reason: string,
  ipAddress?: string
): Promise<AuditLog> {
  return AuditService.logAction({
    userId,
    userRole,
    action: "deleted",
    resourceType: "event_request",
    resourceId: requestId,
    reason,
    ipAddress,
  })
}

/**
 * Get IP address from request headers (for use in API routes)
 * @param headers - Request headers
 * @returns IP address or undefined
 */
export function getIpAddress(headers: Headers): string | undefined {
  // Try various headers that might contain the IP
  const forwardedFor = headers.get("x-forwarded-for")
  const realIp = headers.get("x-real-ip")
  const cfConnectingIp = headers.get("cf-connecting-ip") // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return undefined
}
