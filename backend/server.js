import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const RATE_LIMIT_MS = 60_000;
const rateLimitMap = new Map();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escape(str) {
  return String(str || '')
    .replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))
    .slice(0, 4000);
}

function isRateLimited(ip) {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_MS) return true;
  rateLimitMap.set(ip, now);
  return false;
}

app.post('/api/contact', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a minute before trying again.',
    });
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
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Contact API running on port ${PORT}`);
});
