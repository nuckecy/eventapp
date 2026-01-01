import type { NextConfig } from "next";

/**
 * Next.js Configuration with Security Headers
 *
 * SECURITY ENHANCEMENTS:
 * - Content Security Policy (CSP) to prevent XSS
 * - X-Frame-Options to prevent clickjacking
 * - X-Content-Type-Options to prevent MIME sniffing
 * - Referrer-Policy for privacy
 * - Permissions-Policy to disable unused features
 * - Strict-Transport-Security (HSTS) for HTTPS enforcement
 *
 * OWASP Coverage:
 * - A03:2021 – Injection (XSS prevention via CSP)
 * - A05:2021 – Security Misconfiguration
 * - A08:2021 – Software and Data Integrity Failures
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Content Security Policy (CSP)
 * Defines which resources can be loaded and executed
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' ${isDevelopment ? "'unsafe-eval'" : ""} 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' ${isDevelopment ? "ws://localhost:* http://localhost:*" : ""} https://api.resend.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  media-src 'self';
  manifest-src 'self';
`.replace(/\s{2,}/g, ' ').trim()

/**
 * Security Headers Configuration
 */
const securityHeaders = [
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Disable browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()',
  },
  // Force HTTPS (only in production)
  ...(isDevelopment ? [] : [
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    },
  ]),
  // XSS Protection (legacy, but still useful)
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

const nextConfig: NextConfig = {
  /**
   * Apply security headers to all routes
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },

  /**
   * Enable React strict mode for better error handling
   */
  reactStrictMode: true,

  /**
   * Disable x-powered-by header to avoid exposing Next.js version
   */
  poweredByHeader: false,

  /**
   * Compress responses for better performance
   */
  compress: true,

  /**
   * Additional configuration options
   */
  // Add any additional Next.js config here
};

export default nextConfig;
