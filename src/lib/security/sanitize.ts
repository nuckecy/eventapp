/**
 * Input Sanitization and Output Encoding Utilities
 *
 * Provides functions to sanitize user input and encode output to prevent
 * security vulnerabilities like XSS, SQL injection, and log injection.
 *
 * OWASP Coverage:
 * - A03:2021 – Injection (XSS, SQL, Log injection prevention)
 * - A09:2021 – Security Logging and Monitoring Failures (safe logging)
 *
 * Note: We use Zod for input validation and Prisma for SQL injection prevention.
 * These utilities provide additional layers of defense in depth.
 */

/**
 * HTML encode special characters to prevent XSS
 *
 * Converts characters that have special meaning in HTML to their entity equivalents.
 * Use this when displaying user-generated content in HTML.
 *
 * @param text - Text to encode
 * @returns HTML-safe encoded text
 */
export function encodeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, (char) => htmlEntities[char])
}

/**
 * Strip HTML tags from text
 *
 * Removes all HTML tags, leaving only text content.
 * Use this for plain text fields that should never contain HTML.
 *
 * @param html - HTML string
 * @returns Plain text with tags removed
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize string for safe logging
 *
 * Removes or replaces characters that could cause log injection attacks.
 * Prevents newlines, control characters, and ANSI escape codes.
 *
 * @param text - Text to sanitize
 * @param maxLength - Maximum length (default: 1000)
 * @returns Sanitized text safe for logging
 */
export function sanitizeForLog(text: string, maxLength = 1000): string {
  // Remove control characters, newlines, and ANSI escape codes
  let sanitized = text
    .replace(/[\r\n]/g, ' ')           // Replace newlines with spaces
    .replace(/[\x00-\x1F\x7F]/g, '')   // Remove control characters
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') // Remove ANSI escape codes

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...[truncated]'
  }

  return sanitized
}

/**
 * Sanitize email address
 *
 * Validates and normalizes email addresses.
 * Returns null if email is invalid.
 *
 * @param email - Email address to sanitize
 * @returns Normalized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return null
  }

  // Normalize: trim and lowercase
  return email.trim().toLowerCase()
}

/**
 * Sanitize URL
 *
 * Validates URL and ensures it uses safe protocols.
 * Returns null if URL is invalid or uses dangerous protocol.
 *
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed protocols (default: http, https)
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:']
): string | null {
  try {
    const parsed = new URL(url)

    // Check if protocol is allowed
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }

    // Prevent javascript: protocol XSS
    if (parsed.protocol === 'javascript:') {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize filename
 *
 * Removes or replaces dangerous characters from filenames.
 * Prevents directory traversal and other file system attacks.
 *
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts
  let sanitized = filename.replace(/\.\./g, '')

  // Remove path separators
  sanitized = sanitized.replace(/[\/\\]/g, '')

  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Ensure filename is not empty
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = 'file'
  }

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    const name = sanitized.substring(0, 255 - ext.length)
    sanitized = name + ext
  }

  return sanitized
}

/**
 * Redact sensitive data from objects for logging
 *
 * Recursively walks through objects and redacts sensitive fields.
 * Useful for logging request/response data without exposing secrets.
 *
 * @param obj - Object to redact
 * @param sensitiveKeys - Keys to redact (default: common sensitive fields)
 * @returns Object with sensitive data redacted
 */
export function redactSensitiveData(
  obj: any,
  sensitiveKeys: string[] = [
    'password',
    'hashedPassword',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
    'sessionToken',
    'authorization',
    'cookie',
    'creditCard',
    'ssn',
  ]
): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, sensitiveKeys))
  }

  const redacted: any = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()

    // Check if key is sensitive
    const isSensitive = sensitiveKeys.some((sensitiveKey) =>
      lowerKey.includes(sensitiveKey.toLowerCase())
    )

    if (isSensitive) {
      redacted[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value, sensitiveKeys)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

/**
 * Sanitize SQL-like strings (defense in depth)
 *
 * While Prisma prevents SQL injection, this provides an extra layer
 * of protection for any raw SQL queries or logging.
 *
 * @param text - Text that might be used in SQL
 * @returns Sanitized text
 */
export function sanitizeSqlString(text: string): string {
  // Escape single quotes
  return text.replace(/'/g, "''")
}

/**
 * Validate and sanitize UUID
 *
 * Ensures string is a valid UUID format.
 * Returns null if invalid.
 *
 * @param uuid - UUID to validate
 * @returns Valid UUID or null
 */
export function sanitizeUuid(uuid: string): string | null {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(uuid)) {
    return null
  }

  return uuid.toLowerCase()
}

/**
 * Sanitize integer input
 *
 * Ensures value is a valid integer within optional bounds.
 * Returns null if invalid.
 *
 * @param value - Value to sanitize
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Valid integer or null
 */
export function sanitizeInteger(
  value: any,
  min?: number,
  max?: number
): number | null {
  const num = parseInt(value, 10)

  if (isNaN(num)) {
    return null
  }

  if (min !== undefined && num < min) {
    return null
  }

  if (max !== undefined && num > max) {
    return null
  }

  return num
}

/**
 * Sanitize phone number
 *
 * Removes non-numeric characters and validates format.
 *
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number or null if invalid
 */
export function sanitizePhone(phone: string): string | null {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '')

  // Basic validation: 10-15 digits
  if (digits.length < 10 || digits.length > 15) {
    return null
  }

  return digits
}

/**
 * Safe JSON stringify that handles circular references
 *
 * Useful for logging objects that might have circular references.
 *
 * @param obj - Object to stringify
 * @param space - Spacing for pretty printing
 * @returns JSON string
 */
export function safeJsonStringify(obj: any, space?: number): string {
  const seen = new WeakSet()

  return JSON.stringify(
    obj,
    (key, value) => {
      // Redact sensitive keys
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret')
      ) {
        return '[REDACTED]'
      }

      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
      }

      return value
    },
    space
  )
}

/**
 * Truncate text to maximum length
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated text
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix = '...'
): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Remove whitespace from both ends and collapse internal whitespace
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/**
 * Escape special characters for use in RegExp
 *
 * @param text - Text to escape
 * @returns Escaped text safe for RegExp
 */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Sanitize user input for search queries
 *
 * @param query - Search query
 * @param maxLength - Maximum length (default: 200)
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string, maxLength = 200): string {
  // Trim and normalize whitespace
  let sanitized = normalizeWhitespace(query)

  // Remove special characters that might cause issues
  sanitized = sanitized.replace(/[<>]/g, '')

  // Truncate
  sanitized = truncate(sanitized, maxLength, '')

  return sanitized
}
