import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment is validated once, at boot.
 *
 * A misconfigured mail server should fail loudly on startup rather than
 * silently swallowing the first real enquiry.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),

  CONTACT_RECEIVER_EMAIL: z.email(),
  CONTACT_SENDER_EMAIL: z.email().optional(),
  CONTACT_SENDER_NAME: z.string().optional(),

  /** Comma-separated list of origins permitted to call the API. */
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:4200')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Field names only — never echo values, which would put credentials in logs.
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Invalid or missing environment configuration: ${missing}`);
}

export const config = parsed.data;
export const isProduction = config.NODE_ENV === 'production';
