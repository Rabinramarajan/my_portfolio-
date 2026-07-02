# Portfolio Contact API (Local Dev)

Express server mirroring production `api/contact.js` for local Angular development.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Submit contact form |

## Environment variables

See `.env.example`. Use a Gmail app-specific password for `EMAIL_PASSWORD`.
