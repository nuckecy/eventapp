/**
 * Security Headers Configuration
 *
 * This module provides secure HTTP headers to protect against common web vulnerabilities.
 * These headers should be applied to all responses via Next.js configuration.
 *
 * Security Headers Included:
 * - Content Security Policy (CSP) - Prevents XSS and data injection attacks
 * - X-Frame-Options - Prevents clickjacking attacks
 * - X-Content-Type-Options - Prevents MIME sniffing
 * - Referrer-Policy - Controls referrer information
 * - Permissions-Policy - Controls browser features
 * - Strict-Transport-Security (HSTS) - Enforces HTTPS
 *
 * OWASP Coverage:
 * - A03:2021 – Injection (XSS prevention via CSP)
 * - A05:2021 – Security Misconfiguration (proper headers)
 * - A08:2021 – Software and Data Integrity Failures (CSP)
 */

export interface SecurityHeaders {
  key: string
  value: string
}

/**
 * Content Security Policy (CSP)
 *
 * Defines which resources can be loaded and executed on the page.
 * This is one of the most important security headers for preventing XSS attacks.
 *
 * Directives:
 * - default-src 'self': Only load resources from same origin by default
 * - script-src: Control JavaScript sources
 * - style-src: Control CSS sources
 * - img-src: Control image sources
 * - font-src: Control font sources
 * - connect-src: Control fetch/XHR/WebSocket sources
 * - frame-ancestors: Control who can frame this page
 */
export function getContentSecurityPolicy(isDevelopment = false): string {
  const policies: Record<string, string[]> = {
    // Default to same-origin for all resource types
    'default-src': ["'self'"],

    // Scripts: Allow self and inline scripts (needed for Next.js)
    // In production, consider using nonces instead of 'unsafe-inline'
    'script-src': [
      "'self'",
      isDevelopment ? "'unsafe-eval'" : "", // Allow eval in dev for hot reload
      "'unsafe-inline'", // Required for Next.js inline scripts
    ].filter(Boolean),

    // Styles: Allow self and inline styles (needed for styled components)
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
      "https://fonts.googleapis.com", // Google Fonts
    ],

    // Images: Allow self, data URIs, and blob URIs
    'img-src': [
      "'self'",
      "data:",
      "blob:",
      "https:", // Allow HTTPS images (for external sources)
    ],

    // Fonts: Allow self and Google Fonts
    'font-src': [
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
    ],

    // API/Fetch connections: Allow self and specific APIs
    'connect-src': [
      "'self'",
      isDevelopment ? "ws://localhost:*" : "", // WebSocket for dev hot reload
      isDevelopment ? "http://localhost:*" : "", // HTTP for dev
      "https://api.resend.com", // Email service
    ].filter(Boolean),

    // Frames: Prevent clickjacking by not allowing framing
    'frame-ancestors': ["'none'"],

    // Forms: Only allow same-origin form submissions
    'form-action': ["'self'"],

    // Base URI: Restrict base tag URLs
    'base-uri': ["'self'"],

    // Object/Embed: Disable plugins
    'object-src': ["'none'"],

    // Media: Allow self-hosted media
    'media-src': ["'self'"],

    // Manifest: Allow self
    'manifest-src': ["'self'"],
  }

  // Convert policies object to CSP string
  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * Get all security headers for Next.js configuration
 *
 * @param isDevelopment - Whether running in development mode
 * @returns Array of security header objects
 */
export function getSecurityHeaders(isDevelopment = false): SecurityHeaders[] {
  return [
    // Content Security Policy
    {
      key: 'Content-Security-Policy',
      value: getContentSecurityPolicy(isDevelopment),
    },

    // Prevent clickjacking by not allowing the site to be framed
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },

    // Prevent MIME type sniffing
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },

    // Control referrer information sent to other sites
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },

    // Disable browser features that aren't needed
    {
      key: 'Permissions-Policy',
      value: [
        'camera=()',          // Disable camera
        'microphone=()',      // Disable microphone
        'geolocation=()',     // Disable geolocation
        'interest-cohort=()', // Disable FLoC tracking
        'payment=()',         // Disable payment API
        'usb=()',             // Disable USB
      ].join(', '),
    },

    // Force HTTPS (only in production)
    ...(isDevelopment ? [] : [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
    ]),

    // Prevent XSS attacks (legacy, but still good for older browsers)
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },

    // Disable DNS prefetching for privacy
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'off',
    },
  ]
}

/**
 * Middleware helper to add security headers to response
 *
 * @param response - NextResponse object
 * @param isDevelopment - Whether running in development mode
 * @returns Response with security headers added
 */
export function addSecurityHeaders(
  response: Response,
  isDevelopment = false
): Response {
  const headers = getSecurityHeaders(isDevelopment)

  headers.forEach(({ key, value }) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Check if CSP is being violated (for development debugging)
 * This can be used in a CSP report endpoint
 */
export interface CSPViolationReport {
  'csp-report': {
    'document-uri': string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    'blocked-uri': string
    'status-code': number
  }
}

/**
 * CSP Report URI endpoint handler
 * Use this to log CSP violations in development
 *
 * Example usage in API route:
 * ```typescript
 * export async function POST(req: Request) {
 *   const report = await req.json() as CSPViolationReport
 *   logCSPViolation(report)
 *   return new Response('OK', { status: 200 })
 * }
 * ```
 */
export function logCSPViolation(report: CSPViolationReport): void {
  console.warn('[CSP Violation]', {
    document: report['csp-report']['document-uri'],
    directive: report['csp-report']['violated-directive'],
    blocked: report['csp-report']['blocked-uri'],
  })
}
