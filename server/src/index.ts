import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config, isProduction } from './config.js';
import { contactRouter } from './contact.route.js';
import { verifyTransport } from './mailer.js';

const app = express();

// Behind a reverse proxy the rate limiter must key on the forwarded client IP,
// not the proxy's. One hop only — trusting the whole chain is spoofable.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin or a non-browser client (curl, health
      // check). Browsers always send one for the cross-origin case we gate.
      if (!origin || config.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error('Origin not allowed'));
    },
    methods: ['POST', 'OPTIONS'],
    maxAge: 86_400,
  }),
);

// A contact message has a hard ceiling; anything larger is not a real enquiry.
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', contactRouter);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Final guard: an unhandled error must never leak a stack trace to a client.
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[server] unhandled error', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  },
);

async function start(): Promise<void> {
  try {
    await verifyTransport();
    console.info('[server] SMTP transport verified');
  } catch (error) {
    console.error('[server] SMTP verification failed', error);
    // In production a broken mailer means the form silently fails — refuse to
    // start rather than accept enquiries we cannot deliver.
    if (isProduction) process.exit(1);
  }

  app.listen(config.PORT, () => {
    console.info(`[server] contact API listening on :${config.PORT}`);
  });
}

void start();

export { app };
