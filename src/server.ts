/**
 * Security Headers Configuration for Angular Universal SSR
 * Apply these headers to your Express server or hosting platform
 */

export const securityHeaders = {
  // Strict-Transport-Security: Force HTTPS (365 days)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // X-Frame-Options: Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // X-Content-Type-Options: Prevent MIME-type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Referrer-Policy: Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions-Policy: Disable unnecessary APIs
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

  // Content-Security-Policy: Prevent XSS and other injection attacks
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.emailjs.com https://www.google-analytics.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",

  // Additional headers for better privacy
  'X-DNS-Prefetch-Control': 'off',
  'X-XSS-Protection': '1; mode=block',
};

/**
 * Usage in Express Server:
 *
 * import express from 'express';
 * import { securityHeaders } from './server';
 *
 * const app = express();
 *
 * app.use((req, res, next) => {
 *   Object.entries(securityHeaders).forEach(([key, value]) => {
 *     res.setHeader(key, value);
 *   });
 *   next();
 * });
 *
 * // Rest of server configuration...
 */
