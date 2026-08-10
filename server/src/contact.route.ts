import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';

import { config } from './config.js';
import { contactSchema, toFieldErrors } from './contact.schema.js';
import { forLog } from './sanitize.js';
import { sendAutoReply, sendContactEmail } from './mailer.js';

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MINUTES * 60_000,
  limit: config.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages from this address. Please try again in a little while.',
  },
});

export const contactRouter = Router();

contactRouter.post('/contact', limiter, async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Please check the highlighted fields.',
      errors: toFieldErrors(parsed.error),
    });
  }

  const payload = parsed.data;

  // Honeypot: answer exactly as we would on success. Telling a bot it was
  // detected only teaches whoever wrote it to stop filling the field.
  if (payload.website) {
    console.warn('[contact] honeypot triggered', { ip: req.ip });
    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  }

  try {
    await sendContactEmail(payload);
    // The confirmation must not fail the submit — the owner's copy is the one
    // that matters. A client without a reply is a lost lead, so keep the
    // enquiry and surface a warning to the log instead.
    sendAutoReply(payload).catch((error) => {
      console.error('[contact] auto-reply failed', error);
    });
    console.info('[contact] delivered', { from: forLog(payload.email), type: payload.projectType });
    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    // SMTP errors routinely contain the host, user and auth detail — they go to
    // the server log and never to the client.
    console.error('[contact] delivery failed', error);
    return res.status(502).json({
      success: false,
      message: 'Your message could not be sent right now. Please email me directly.',
    });
  }
});
