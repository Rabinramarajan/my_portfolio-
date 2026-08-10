import nodemailer, { type Transporter } from 'nodemailer';

import { config } from './config.js';
import { escapeHtml, stripNewlines } from './sanitize.js';
import type { ContactPayload } from './contact.schema.js';

let transporter: Transporter | null = null;

/** Created lazily and reused — a pooled connection beats one per submission. */
function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE || config.SMTP_PORT === 465,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    pool: true,
    maxConnections: 2,
  });
  return transporter;
}

/** Verifies SMTP credentials at boot so failures surface before real traffic. */
export async function verifyTransport(): Promise<void> {
  await getTransporter().verify();
}

/**
 * Owner-facing email for a new inquiry. Always sent *from* our own
 * authenticated identity: putting the enquirer's address in From would fail
 * SPF/DKIM and land the mail in spam, so they are reached via replyTo.
 */
export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const name = stripNewlines(payload.name);
  const email = stripNewlines(payload.email);

  await getTransporter().sendMail({
    from: `"Portfolio enquiry" <${config.CONTACT_SENDER_EMAIL ?? config.SMTP_USER}>`,
    to: config.CONTACT_RECEIVER_EMAIL,
    replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
    subject: `New Project Inquiry — ${stripNewlines(payload.projectType)} — ${name}`,
    text: toPlainText(payload),
    html: toHtml(payload),
  });
}

/**
 * Confirmation sent to the client after a successful submission. Confirms the
 * inquiry was received, restates the captured details, sets response
 * expectations and leaves the next step unambiguous.
 */
export async function sendAutoReply(payload: ContactPayload): Promise<void> {
  const name = payload.name.trim() || 'there';

  await getTransporter().sendMail({
    from: `"${config.CONTACT_SENDER_NAME ?? 'Rabin R'}" <${config.CONTACT_SENDER_EMAIL ?? config.SMTP_USER}>`,
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
  const lines = [
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
  ];
  return lines.join('\n');
}

function autoReplyHtml(p: ContactPayload, name: string): string {
  const rows = [
    ...(p.service ? [`${escapeHtml(p.service)}`] : []),
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
