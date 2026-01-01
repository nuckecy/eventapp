/**
 * Access Control Utilities
 *
 * Centralized access control and authorization helpers to prevent
 * broken access control vulnerabilities.
 *
 * OWASP Coverage:
 * - A01:2021 – Broken Access Control
 *
 * Features:
 * - Role-based access control (RBAC)
 * - Resource ownership verification
 * - Permission checking
 * - API route authorization helpers
 */

import { Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'

/**
 * User session type for access control
 */
export interface UserSession {
  id: string
  name: string
  email: string
  role: Role
  departmentId?: string
}

/**
 * Permission enum for granular access control
 */
export enum Permission {
  // Event Request Permissions
  CREATE_REQUEST = 'create_request',
  VIEW_OWN_REQUEST = 'view_own_request',
  VIEW_ALL_REQUESTS = 'view_all_requests',
  EDIT_OWN_REQUEST = 'edit_own_request',
  EDIT_ANY_REQUEST = 'edit_any_request',
  DELETE_REQUEST = 'delete_request',

  // Workflow Permissions
  SUBMIT_REQUEST = 'submit_request',
  CLAIM_REQUEST = 'claim_request',
  FORWARD_REQUEST = 'forward_request',
  APPROVE_REQUEST = 'approve_request',
  RETURN_REQUEST = 'return_request',

  // Event Permissions
  VIEW_EVENTS = 'view_events',
  MANAGE_EVENTS = 'manage_events',

  // User Management Permissions
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',

  // Audit Permissions
  VIEW_AUDIT_LOG = 'view_audit_log',
  VIEW_ANALYTICS = 'view_analytics',
}

/**
 * Role-based permission matrix
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  member: [Permission.VIEW_EVENTS],

  lead: [
    Permission.VIEW_EVENTS,
    Permission.CREATE_REQUEST,
    Permission.VIEW_OWN_REQUEST,
    Permission.EDIT_OWN_REQUEST,
    Permission.SUBMIT_REQUEST,
  ],

  admin: [
    Permission.VIEW_EVENTS,
    Permission.VIEW_ALL_REQUESTS,
    Permission.EDIT_ANY_REQUEST,
    Permission.CLAIM_REQUEST,
    Permission.FORWARD_REQUEST,
    Permission.RETURN_REQUEST,
    Permission.VIEW_AUDIT_LOG,
  ],

  superadmin: [
    Permission.VIEW_EVENTS,
    Permission.VIEW_ALL_REQUESTS,
    Permission.EDIT_ANY_REQUEST,
    Permission.APPROVE_REQUEST,
    Permission.DELETE_REQUEST,
    Permission.RETURN_REQUEST,
    Permission.MANAGE_EVENTS,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOG,
    Permission.VIEW_ANALYTICS,
  ],
}

/**
 * Check if user has a specific permission
 *
 * @param user - User session
 * @param permission - Permission to check
 * @returns True if user has permission
 */
export function hasPermission(
  user: UserSession,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[user.role]
  return rolePermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 *
 * @param user - User session
 * @param permissions - Permissions to check
 * @returns True if user has any of the permissions
 */
export function hasAnyPermission(
  user: UserSession,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}

/**
 * Check if user has all of the specified permissions
 *
 * @param user - User session
 * @param permissions - Permissions to check
 * @returns True if user has all permissions
 */
export function hasAllPermissions(
  user: UserSession,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(user, permission))
}

/**
 * Require specific permission or throw error
 *
 * @param user - User session
 * @param permission - Required permission
 * @throws Error if user lacks permission
 */
export function requirePermission(
  user: UserSession,
  permission: Permission
): void {
  if (!hasPermission(user, permission)) {
    throw new Error(
      `Access denied: ${permission} permission required (current role: ${user.role})`
    )
  }
}

/**
 * Check if user owns a resource
 *
 * @param user - User session
 * @param resourceOwnerId - ID of resource owner
 * @returns True if user owns the resource
 */
export function ownsResource(user: UserSession, resourceOwnerId: string): boolean {
  return user.id === resourceOwnerId
}

/**
 * Check if user can access department resources
 *
 * @param user - User session
 * @param departmentId - Department ID
 * @returns True if user can access department
 */
export function canAccessDepartment(
  user: UserSession,
  departmentId: string
): boolean {
  // Super admins can access all departments
  if (user.role === 'superadmin') {
    return true
  }

  // Admins can access all departments
  if (user.role === 'admin') {
    return true
  }

  // Leads and members can only access their own department
  return user.departmentId === departmentId
}

/**
 * Check if user can view a request
 *
 * @param user - User session
 * @param request - Request with creator and department info
 * @returns True if user can view the request
 */
export function canViewRequest(
  user: UserSession,
  request: { creatorId: string; departmentId?: string }
): boolean {
  // Super admin can view all
  if (user.role === 'superadmin') {
    return true
  }

  // Admin can view all
  if (user.role === 'admin') {
    return true
  }

  // Lead can view their own
  if (user.role === 'lead') {
    return ownsResource(user, request.creatorId)
  }

  // Members cannot view requests
  return false
}

/**
 * Check if user can edit a request
 *
 * @param user - User session
 * @param request - Request with creator, status, and department info
 * @returns True if user can edit the request
 */
export function canEditRequest(
  user: UserSession,
  request: { creatorId: string; status: string; departmentId?: string }
): boolean {
  // Super admin can edit ready_for_approval
  if (user.role === 'superadmin') {
    return request.status === 'ready_for_approval'
  }

  // Admin can edit submitted and under_review
  if (user.role === 'admin') {
    return ['submitted', 'under_review'].includes(request.status)
  }

  // Lead can edit their own drafts
  if (user.role === 'lead') {
    return ownsResource(user, request.creatorId) && request.status === 'draft'
  }

  return false
}

/**
 * Check if user can delete a request
 *
 * @param user - User session
 * @returns True if user can delete requests
 */
export function canDeleteRequest(user: UserSession): boolean {
  // Only super admin can permanently delete
  return user.role === 'superadmin'
}

/**
 * API route authorization middleware
 *
 * Checks authentication and returns standardized error responses.
 * Use this at the start of API route handlers.
 *
 * @param request - Next.js request
 * @param requiredRole - Optional required role
 * @returns User session or error response
 */
export async function authorizeRequest(
  request: NextRequest,
  requiredRole?: Role
): Promise<{ user: UserSession } | NextResponse> {
  // Check authentication
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    )
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    // Allow super admin to access any role-restricted endpoint
    if (user.role !== 'superadmin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Required role: ${requiredRole}`,
          },
        },
        { status: 403 }
      )
    }
  }

  return { user: user as UserSession }
}

/**
 * Authorize with permission check
 *
 * @param request - Next.js request
 * @param requiredPermission - Required permission
 * @returns User session or error response
 */
export async function authorizeWithPermission(
  request: NextRequest,
  requiredPermission: Permission
): Promise<{ user: UserSession } | NextResponse> {
  const result = await authorizeRequest(request)

  // If result is a response, it's an error - return it
  if (result instanceof NextResponse) {
    return result
  }

  const { user } = result

  // Check permission
  if (!hasPermission(user, requiredPermission)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required permission: ${requiredPermission}`,
        },
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Authorize resource access
 *
 * Checks if user can access a specific resource based on ownership or role.
 *
 * @param request - Next.js request
 * @param resourceOwnerId - ID of resource owner
 * @param allowedRoles - Roles that can access regardless of ownership
 * @returns User session or error response
 */
export async function authorizeResourceAccess(
  request: NextRequest,
  resourceOwnerId: string,
  allowedRoles: Role[] = ['admin', 'superadmin']
): Promise<{ user: UserSession } | NextResponse> {
  const result = await authorizeRequest(request)

  // If result is a response, it's an error - return it
  if (result instanceof NextResponse) {
    return result
  }

  const { user } = result

  // Check if user owns resource or has allowed role
  const canAccess =
    ownsResource(user, resourceOwnerId) || allowedRoles.includes(user.role)

  if (!canAccess) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Example usage in API route:
 *
 * ```typescript
 * import { authorizeRequest, Permission, authorizeWithPermission } from '@/lib/security/access-control'
 *
 * export async function GET(request: NextRequest) {
 *   // Simple auth check
 *   const auth = await authorizeRequest(request)
 *   if (auth instanceof NextResponse) return auth
 *   const { user } = auth
 *
 *   // Or with role requirement
 *   const auth = await authorizeRequest(request, 'admin')
 *   if (auth instanceof NextResponse) return auth
 *
 *   // Or with permission check
 *   const auth = await authorizeWithPermission(request, Permission.CREATE_REQUEST)
 *   if (auth instanceof NextResponse) return auth
 *
 *   // Continue with route logic...
 * }
 * ```
 */

/**
 * Get forbidden response
 *
 * @param message - Optional custom message
 * @returns Forbidden response
 */
export function forbiddenResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: message || 'Access denied',
      },
    },
    { status: 403 }
  )
}

/**
 * Get unauthorized response
 *
 * @param message - Optional custom message
 * @returns Unauthorized response
 */
export function unauthorizedResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: message || 'Authentication required',
      },
    },
    { status: 401 }
  )
}
