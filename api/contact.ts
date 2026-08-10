import type { IncomingMessage, ServerResponse } from 'node:http';

import nodemailer, { type Transporter } from 'nodemailer';
import { z } from 'zod';

/**
 * Production contact endpoint.
 *
 * The site deploys to Vercel as a static prerender (`dist/web/browser`), so the
 * Express app under `server/` never ships — it is the local development
 * backend. This function is what `/api/contact` actually hits in production,
 * and it restates the same contract: validate, honeypot, rate limit, mail.
 *
 * Kept deliberately self-contained. It runs from the *root* package and
 * tsconfig, whereas `server/` is a separate ESM package with its own
 * dependencies and `NodeNext` extension rules; importing across that boundary
 * costs more than the duplication does. The two must be changed together —
 * `server/src/contact.schema.ts` is the mirror of the schema below.
 */

const PROJECT_TYPES = [
  'Website',
  'Portfolio',
  'E-commerce',
  'SaaS',
  'Dashboard',
  'Admin Portal',
  'Mobile App',
  'UI Engineering',
  'Performance / SEO',
  'Custom Application',
  'Other',
] as const;

const BUDGET_RANGES = [
  'Under ₹25,000',
  '₹25,000 – ₹50,000',
  '₹50,000 – ₹1,00,000',
  '₹1,00,000 – ₹2,50,000',
  '₹2,50,000 – ₹5,00,000',
  '₹5,00,000+',
  'Not sure yet',
] as const;

const TIMELINES = ['ASAP', '1–2 weeks', '2–4 weeks', '1–2 months', '2–3 months', 'Flexible'] as const;

const ADDONS_MAX = 12;

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(160),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  /** Website / existing product URL — never the honeypot field. */
  url: z.string().trim().max(300).optional().or(z.literal('')),
  /** Selected service from the Hire Me page, e.g. "Premium Website". */
  service: z.string().trim().max(120).optional().or(z.literal('')),
  projectType: z.enum(PROJECT_TYPES),
  budget: z.enum(BUDGET_RANGES),
  timeline: z.enum(TIMELINES).optional(),
  addOns: z.array(z.string().trim().min(1).max(80)).max(ADDONS_MAX).default([]),
  message: z.string().trim().min(30).max(3000),
  /** Honeypot: any value at all means a bot filled a field humans cannot see. */
  website: z.string().max(0).optional().or(z.literal('')),
});

type ContactPayload = z.infer<typeof contactSchema>;

/** Flattens Zod issues into the `{ field: message }` shape the client renders. */
function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'form';
    errors[field] ??= issue.message;
  }
  return errors;
}

/* ------------------------------------------------------------------ config */

const envSchema = z.object({
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
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
});

type Env = z.infer<typeof envSchema>;

/**
 * Unlike the long-lived Express server, a function cannot fail at boot — there
 * is no boot a human watches. Config is resolved per invocation and a bad
 * environment becomes a 502 with a log line, never an unhandled crash.
 */
function readEnv(): Env | null {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return parsed.data;
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  console.error(`[contact] invalid or missing environment configuration: ${missing}`);
  return null;
}

/* ---------------------------------------------------------------- sanitize */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!);
}

/** Strips CR/LF so a value can never inject an extra SMTP header. */
function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/** Collapses control characters and clamps length before anything is logged. */
function forLog(value: string, max = 120): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\x00-\x1f\x7f]/g, ' ').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}

/* ------------------------------------------------------------ rate limiting */

const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort throttle. Each warm instance keeps its own counter, so a burst
 * spread across instances can exceed the limit — this raises the cost of
 * scripted abuse rather than eliminating it. The honeypot and SMTP provider
 * quota are the other two layers.
 */
function rateLimited(key: string, env: Env): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW_MINUTES * 60_000 });
    // The map is unbounded across a warm instance's lifetime; drop expired keys
    // opportunistically so it tracks active senders, not every sender ever.
    if (hits.size > 500) {
      for (const [existing, value] of hits) {
        if (now > value.resetAt) hits.delete(existing);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > env.RATE_LIMIT_MAX;
}

/** Vercel sits behind a proxy, so the socket address is always the edge. */
function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

/* ------------------------------------------------------------------ mailer */

let transporter: Transporter | null = null;

/** Created lazily and reused — warm instances keep the connection pooled. */
function getTransporter(env: Env): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE || env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    pool: true,
    maxConnections: 2,
  });
  return transporter;
}

/**
 * Owner-facing email for a new inquiry. Always sent *from* our own
 * authenticated identity: putting the enquirer's address in From would fail
 * SPF/DKIM and land the mail in spam, so they are reached via replyTo.
 */
async function sendContactEmail(payload: ContactPayload, env: Env): Promise<void> {
  const name = stripNewlines(payload.name);
  const email = stripNewlines(payload.email);

  await getTransporter(env).sendMail({
    from: `"Portfolio enquiry" <${env.CONTACT_SENDER_EMAIL ?? env.SMTP_USER}>`,
    to: env.CONTACT_RECEIVER_EMAIL,
    replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
    subject: `New Project Inquiry — ${stripNewlines(payload.projectType)} — ${name}`,
    text: toPlainText(payload),
    html: toHtml(payload),
  });
}

/** Confirmation to the enquirer, restating what was captured. */
async function sendAutoReply(payload: ContactPayload, env: Env): Promise<void> {
  const name = payload.name.trim() || 'there';

  await getTransporter(env).sendMail({
    from: `"${env.CONTACT_SENDER_NAME ?? 'Rabin R'}" <${env.CONTACT_SENDER_EMAIL ?? env.SMTP_USER}>`,
    to: payload.email,
    subject: 'Thanks for reaching out — Project Inquiry Received',
    text: autoReplyText(payload),
    html: autoReplyHtml(payload, name),
  });
}

/** The owner reads this on a console, so alignment is done manually. */
function toPlainText(p: ContactPayload): string {
  return [
    'New Project Inquiry',
    '',
    `Client:        ${p.name}`,
    `Email:         ${p.email}`,
    p.company ? `Company:       ${p.company}` : null,
    p.phone ? `Phone:         ${p.phone}` : null,
    p.url ? `Website:       ${p.url}` : null,
    p.service ? `Service:       ${p.service}` : null,
    `Project:       ${p.projectType}`,
    `Budget:        ${p.budget}`,
    p.timeline ? `Timeline:      ${p.timeline}` : null,
    p.addOns.length ? `Add-ons:       ${p.addOns.join(', ')}` : null,
    '',
    'Message:',
    p.message,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function toHtml(p: ContactPayload): string {
  const row = (label: string, value?: string) =>
    value
      ? `<tr><td style="padding:6px 16px 6px 0;color:#666;font-size:13px">${label}</td>
         <td style="padding:6px 0;font-size:14px">${escapeHtml(value)}</td></tr>`
      : '';

  return `<!doctype html>
<html><body style="margin:0;background:#f6f6f4;padding:32px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888">
      New project inquiry
    </p>
    <h1 style="margin:0 0 24px;font-size:22px">${escapeHtml(p.name)}</h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${row('Email', p.email)}
      ${row('Company', p.company)}
      ${row('Phone', p.phone)}
      ${row('Website', p.url)}
      ${row('Service', p.service)}
      ${row('Project', p.projectType)}
      ${row('Budget', p.budget)}
      ${row('Timeline', p.timeline)}
      ${row('Add-ons', p.addOns.join(', '))}
    </table>
    <div style="padding-top:20px;border-top:1px solid #eee">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888">
        Message
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(
        p.message,
      )}</p>
    </div>
  </div>
</body></html>`;
}

function autoReplyText(p: ContactPayload): string {
  return [
    `Hi ${p.name.trim()},`,
    '',
    'Thanks for reaching out — your inquiry has been received.',
    '',
    'Here is what we captured:',
    ...(p.service ? [`Service:  ${p.service}`] : []),
    `Project:  ${p.projectType}`,
    `Budget:   ${p.budget}`,
    ...(p.timeline ? [`Timeline: ${p.timeline}`] : []),
    ...(p.addOns.length ? [`Add-ons:  ${p.addOns.join(', ')}`] : []),
    '',
    'I review every inquiry personally and will reply with a recommended approach and a written proposal within one business day.',
    '',
    'If the project is urgent, emailing directly works too.',
    '',
    'Best regards,',
    'Rabin R',
  ].join('\n');
}

function autoReplyHtml(p: ContactPayload, name: string): string {
  const rows = [
    ...(p.service ? [escapeHtml(p.service)] : []),
    escapeHtml(p.projectType),
    escapeHtml(p.budget),
    ...(p.timeline ? [escapeHtml(p.timeline)] : []),
    ...(p.addOns.length ? [escapeHtml(p.addOns.join(', '))] : []),
  ];

  return `<!doctype html>
<html><body style="margin:0;background:#f6f6f4;padding:32px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#888">
      Project inquiry
    </p>
    <h1 style="margin:0 0 20px;font-size:22px">Thanks for reaching out, ${escapeHtml(name)}.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333">
      Your inquiry has been received. Here is what I captured:
    </p>
    <ul style="margin:0 0 24px;padding:0;list-style:none">
      ${rows.map((item) => `<li style="padding:8px 14px;background:#f6f6f4;border-radius:8px;margin-bottom:8px;font-size:14px;color:#111">${item}</li>`).join('')}
    </ul>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333">
      I review every inquiry personally and will reply with a recommended approach and a written
      proposal within one business day. If the project is urgent, emailing directly works too.
    </p>
    <div style="padding-top:20px;border-top:1px solid #eee;color:#666;font-size:13px">
      Best regards,<br />Rabin R<br /><a href="https://www.rabinr.in" style="color:#666">rabinr.in</a>
    </div>
  </div>
</body></html>`;
}

/* ----------------------------------------------------------------- handler */

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/**
 * Vercel parses JSON bodies for us, but only when the content type says so.
 * Anything else arrives as a string or not at all, and must not throw.
 */
function readBody(req: IncomingMessage & { body?: unknown }): unknown {
  const { body } = req;
  if (typeof body !== 'string') return body ?? {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string },
  res: ServerResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    json(res, 405, { success: false, message: 'Method not allowed.' });
    return;
  }

  const env = readEnv();
  if (!env) {
    json(res, 502, {
      success: false,
      message: 'Your message could not be sent right now. Please email me directly.',
    });
    return;
  }

  const parsed = contactSchema.safeParse(readBody(req));

  if (!parsed.success) {
    json(res, 400, {
      success: false,
      message: 'Please check the highlighted fields.',
      errors: toFieldErrors(parsed.error),
    });
    return;
  }

  const payload = parsed.data;

  // Honeypot: answer exactly as we would on success. Telling a bot it was
  // detected only teaches whoever wrote it to stop filling the field.
  if (payload.website) {
    console.warn('[contact] honeypot triggered', { ip: forLog(clientIp(req)) });
    json(res, 200, { success: true, message: 'Message sent successfully' });
    return;
  }

  // Checked after validation so malformed noise cannot burn a real sender's
  // quota, and keyed by IP because the email field is attacker-controlled.
  if (rateLimited(clientIp(req), env)) {
    json(res, 429, {
      success: false,
      message: 'Too many messages from this address. Please try again in a little while.',
    });
    return;
  }

  try {
    await sendContactEmail(payload, env);
    // The confirmation must not fail the submit — the owner's copy is the one
    // that matters. A client without a reply is a lost lead, so keep the
    // enquiry and surface a warning to the log instead. Awaited rather than
    // detached: a serverless invocation is frozen the moment it responds, so a
    // floating promise here would simply never run.
    try {
      await sendAutoReply(payload, env);
    } catch (error) {
      console.error('[contact] auto-reply failed', error);
    }
    console.info('[contact] delivered', { from: forLog(payload.email), type: payload.projectType });
    json(res, 200, { success: true, message: 'Message sent successfully' });
  } catch (error) {
    // SMTP errors routinely contain the host, user and auth detail — they go to
    // the function log and never to the client.
    console.error('[contact] delivery failed', error);
    json(res, 502, {
      success: false,
      message: 'Your message could not be sent right now. Please email me directly.',
    });
  }
}
