/**
 * Vercel Serverless Function — /api/contact
 *
 * Required Vercel environment variables (set in Vercel dashboard):
 *   EMAIL_USER       – Gmail address used to send mail
 *   EMAIL_PASSWORD   – Gmail app-specific password
 *   RECIPIENT_EMAIL  – Address that receives portfolio contact messages
 *   ALLOWED_ORIGIN   – (optional) your domain, e.g. https://rabinr.dev
 */

const nodemailer = require('nodemailer');

// In-memory rate limit: 1 request per IP per 60 s (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_MS) return true;
  rateLimitMap.set(ip, now);
  return false;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escape(str) {
  return String(str || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])).slice(0, 4000);
}

module.exports = async function handler(req, res) {
  const origin = process.env['ALLOWED_ORIGIN'] || 'https://rabinr.dev';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait a minute before trying again.' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (!emailRe.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }
  if (String(message).length < 10) {
    return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
  }

  const n = escape(name);
  const s = escape(subject);
  const m = escape(message);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env['EMAIL_USER'],
      pass: process.env['EMAIL_PASSWORD'],
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env['EMAIL_USER']}>`,
      to: process.env['RECIPIENT_EMAIL'],
      replyTo: email,
      subject: `[Portfolio] ${s}`,
      html: `
        <h2 style="color:#6366f1">New message from ${n}</h2>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${s}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${m.replace(/\n/g, '<br>')}</p>
        <hr>
        <small>Sent via portfolio contact form · ${new Date().toUTCString()}</small>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
    });
  } catch (err) {
    console.error('[api/contact] mail error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};
