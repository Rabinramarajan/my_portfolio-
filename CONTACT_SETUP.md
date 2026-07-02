# Contact Form Setup

The portfolio contact form posts to **`POST /api/contact`**.

## Production (Vercel)

1. Deploy the repo to Vercel (the `api/contact.js` serverless function is auto-detected).
2. Set these environment variables in the Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | Gmail address used to send mail |
| `EMAIL_PASSWORD` | Gmail [app-specific password](https://support.google.com/accounts/answer/185833) |
| `RECIPIENT_EMAIL` | Inbox that receives contact messages |
| `ALLOWED_ORIGIN` | Your site origin, e.g. `https://rabinr.dev` |

3. Redeploy after adding variables.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and fill in the same values.
2. Start the contact API:
   ```bash
   npm run backend:install
   npm run backend:dev
   ```
3. In another terminal, start Angular (proxies `/api` → `localhost:3000`):
   ```bash
   npm start
   ```

## Security features

- Server-side validation and HTML escaping
- Per-IP rate limiting (60 seconds)
- CORS restricted to `ALLOWED_ORIGIN` in production
- Client-side 30-second submit cooldown

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Network error on submit | Ensure backend is running locally or Vercel function is deployed |
| 429 Too many requests | Wait 60 seconds between attempts |
| 500 Failed to send | Verify Gmail app password and env vars |
