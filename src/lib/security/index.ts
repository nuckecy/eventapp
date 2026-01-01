/**
 * Security Utilities - Central Export
 *
 * This module exports all security utilities for easy importing.
 * Import from '@/lib/security' instead of individual files.
 *
 * Usage:
 * ```typescript
 * import {
 *   getSecurityHeaders,
 *   loginRateLimiter,
 *   sanitizeForLog,
 *   authorizeRequest,
 *   Permission
 * } from '@/lib/security'
 * ```
 */

// ============================================================================
// Access Control
// ============================================================================
export {
  type UserSession,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  ownsResource,
  canAccessDepartment,
  canViewRequest,
  canEditRequest,
  canDeleteRequest,
  authorizeRequest,
  authorizeWithPermission,
  authorizeResourceAccess,
  forbiddenResponse,
  unauthorizedResponse,
} from './access-control'

// ============================================================================
// Security Headers
// ============================================================================
export {
  type SecurityHeaders,
  type CSPViolationReport,
  getContentSecurityPolicy,
  getSecurityHeaders,
  addSecurityHeaders,
  logCSPViolation,
} from './headers'

// ============================================================================
// Rate Limiting
// ============================================================================
export {
  type RateLimiterConfig,
  type RateLimitResult,
  RateLimiter,
  loginRateLimiter,
  apiRateLimiter,
  requestCreationRateLimiter,
  passwordResetRateLimiter,
  getClientIp,
  checkRateLimit,
  createRateLimiter,
  parseTimeWindow,
} from './rate-limit'

// ============================================================================
// Input Sanitization & Output Encoding
// ============================================================================
export {
  encodeHtml,
  stripHtml,
  sanitizeForLog,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  redactSensitiveData,
  sanitizeSqlString,
  sanitizeUuid,
  sanitizeInteger,
  sanitizePhone,
  safeJsonStringify,
  truncate,
  normalizeWhitespace,
  escapeRegExp,
  sanitizeSearchQuery,
} from './sanitize'

/**
 * Security best practices for Church Event Management System
 *
 * 1. AUTHENTICATION & AUTHORIZATION
 *    - Use authorizeRequest() in all API routes
 *    - Check permissions with hasPermission()
 *    - Verify resource ownership with canViewRequest(), canEditRequest()
 *
 * 2. RATE LIMITING
 *    - Apply loginRateLimiter to login endpoints
 *    - Apply apiRateLimiter to all API routes
 *    - Apply requestCreationRateLimiter to event creation
 *
 * 3. INPUT VALIDATION & SANITIZATION
 *    - Use Zod schemas for all inputs (primary defense)
 *    - Sanitize user input before logging with sanitizeForLog()
 *    - Redact sensitive data with redactSensitiveData()
 *
 * 4. OUTPUT ENCODING
 *    - HTML is automatically encoded by React
 *    - For custom HTML rendering, use encodeHtml()
 *    - For URLs, validate with sanitizeUrl()
 *
 * 5. LOGGING
 *    - Use sanitizeForLog() for all user input in logs
 *    - Use redactSensitiveData() before logging objects
 *    - Never log passwords, tokens, or secrets
 *
 * 6. ERROR HANDLING
 *    - Use forbiddenResponse() for 403 errors
 *    - Use unauthorizedResponse() for 401 errors
 *    - Never expose stack traces or internal errors to users
 *
 * 7. HEADERS
 *    - Security headers are configured in next.config.ts
 *    - CSP prevents XSS attacks
 *    - HSTS enforces HTTPS in production
 *
 * Example API Route with all security measures:
 *
 * ```typescript
 * import { NextRequest, NextResponse } from 'next/server'
 * import {
 *   authorizeRequest,
 *   loginRateLimiter,
 *   getClientIp,
 *   checkRateLimit,
 *   sanitizeForLog,
 *   redactSensitiveData,
 *   Permission,
 *   canEditRequest,
 * } from '@/lib/security'
 * import { updateRequestSchema } from '@/lib/validators/request'
 *
 * export async function PATCH(
 *   request: NextRequest,
 *   { params }: { params: { id: string } }
 * ) {
 *   try {
 *     // 1. Rate limiting
 *     const ip = getClientIp(request)
 *     const rateLimitResponse = await checkRateLimit(loginRateLimiter, ip)
 *     if (rateLimitResponse) {
 *       return rateLimitResponse
 *     }
 *
 *     // 2. Authentication
 *     const auth = await authorizeRequest(request)
 *     if (auth instanceof NextResponse) return auth
 *     const { user } = auth
 *
 *     // 3. Get resource
 *     const requestId = params.id
 *     const eventRequest = await prisma.eventRequest.findUnique({
 *       where: { id: requestId },
 *     })
 *
 *     if (!eventRequest) {
 *       return NextResponse.json(
 *         { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } },
 *         { status: 404 }
 *       )
 *     }
 *
 *     // 4. Authorization - check if user can edit
 *     if (!canEditRequest(user, eventRequest)) {
 *       return NextResponse.json(
 *         { success: false, error: { code: 'FORBIDDEN', message: 'Cannot edit this request' } },
 *         { status: 403 }
 *       )
 *     }
 *
 *     // 5. Input validation
 *     const body = await request.json()
 *     const validation = updateRequestSchema.safeParse(body)
 *
 *     if (!validation.success) {
 *       return NextResponse.json(
 *         {
 *           success: false,
 *           error: {
 *             code: 'VALIDATION_ERROR',
 *             message: 'Invalid input',
 *             details: validation.error.issues,
 *           },
 *         },
 *         { status: 400 }
 *       )
 *     }
 *
 *     // 6. Update resource
 *     const updated = await prisma.eventRequest.update({
 *       where: { id: requestId },
 *       data: validation.data,
 *     })
 *
 *     // 7. Audit logging (with sanitization)
 *     console.log('[API] Request updated:', {
 *       requestId: sanitizeForLog(requestId),
 *       userId: user.id,
 *       userRole: user.role,
 *       changes: redactSensitiveData(validation.data),
 *     })
 *
 *     return NextResponse.json({ success: true, data: updated })
 *   } catch (error) {
 *     // 8. Error handling (don't expose internals)
 *     console.error('[API] Error updating request:', error)
 *     return NextResponse.json(
 *       {
 *         success: false,
 *         error: {
 *           code: 'INTERNAL_ERROR',
 *           message: 'An error occurred while processing your request',
 *         },
 *       },
 *       { status: 500 }
 *     )
 *   }
 * }
 * ```
 */
