# EmailJS Quick Setup - 5 Minutes ⚡

## What You Just Got

✅ **Full EmailJS Integration** - Contact form now sends emails directly  
✅ **Secure & Free** - 200 emails/month on free tier  
✅ **Production Ready** - Error handling, rate limiting, validation included  

---

## Quick Start (5 Steps)

### 1️⃣ Go to EmailJS
👉 https://www.emailjs.com/ → Sign up (free account)

### 2️⃣ Create Email Service
- Dashboard → **Email Services** → **Add Service**
- Connect Gmail (or your email provider)
- Copy **Service ID** → Save it

### 3️⃣ Create Email Template
- Dashboard → **Email Templates** → **Create New**
- **Template ID**: `portfolio_contact`
- **Template Content** (copy-paste this):

```
From: {{from_name}} <{{from_email}}>
To: {{to_email}}
Subject: {{subject}}
Date: {{timestamp}}

Message:
{{message}}
```

- Copy **Template ID** → Save it

### 4️⃣ Get Your Keys
- Dashboard → **Account** → **API Keys**
- Copy your **Public Key** (starts with `your_`)

### 5️⃣ Configure Your Portfolio
Edit: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  emailjs: {
    serviceId: 'service_abc123xyz',        // ← Paste Service ID here
    templateId: 'template_abc123xyz',      // ← Paste Template ID here
    publicKey: 'your_abc123xyz',           // ← Paste Public Key here
    recipientEmail: 'your-email@gmail.com' // ← Your email
  }
};
```

**That's it! Your contact form works now.** 🎉

---

## Test It

```bash
npm start
```

1. Open http://localhost:4200
2. Scroll to Contact section
3. Fill form → Click Send
4. Check your email (may take 10-15 seconds)

---

## Environment Variables (For Production)

### On Vercel
1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add these:

```
EMAILJS_SERVICE_ID=service_abc123xyz
EMAILJS_TEMPLATE_ID=template_abc123xyz
EMAILJS_PUBLIC_KEY=your_abc123xyz
EMAILJS_RECIPIENT_EMAIL=your-email@gmail.com
```

### Update service to use them
In `contact.service.ts`:

```typescript
private readonly SERVICE_ID = process.env['NG_APP_EMAILJS_SERVICE_ID']!;
private readonly TEMPLATE_ID = process.env['NG_APP_EMAILJS_TEMPLATE_ID']!;
private readonly PUBLIC_KEY = process.env['NG_APP_EMAILJS_PUBLIC_KEY']!;
```

---

## Features Included

✨ **Form Validation**
- Email format check
- Required field validation
- Real-time error display

🛡️ **Security**
- Rate limiting (30 seconds between messages)
- Input sanitization
- Domain whitelist support

⚡ **Performance**
- 15-second timeout
- Async error handling
- No backend required

📧 **Email Features**
- Custom templates
- Auto-replies (optional)
- Template variables (name, email, subject, message, timestamp)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not configured" | Did you update `environment.ts`? Check all 4 values |
| Email not sent | Check email subject line format in template |
| "Forbidden" error | Add your domain to EmailJS security settings |
| No emails received | Check spam folder + EmailJS activity log |
| Timeout error | Your internet might be slow, try again |

---

## Files Changed

```
src/
├── app/shared/services/
│   └── contact.service.ts          ✅ (Updated with EmailJS)
├── environments/                    ✅ (New - Configuration)
│   ├── environment.ts
│   └── environment.prod.ts
└── app/pages/home/
    └── home.ts                      (No changes needed)

package.json                         ✅ (@emailjs/browser added)
EMAIL_JS_SETUP.md                    ✅ (Detailed guide)
```

---

## Next Steps

### Send Auto-Reply to Visitor (Optional)
Contact service has `sendCustomEmail()` method ready for auto-replies.

### Monitor Emails
EmailJS Dashboard shows:
- ✅ Successful sends
- ❌ Failed attempts
- 📊 Daily stats

### Upgrade Plan
- **Free**: 200/month (plenty for a portfolio!)
- **Pro**: Unlimited emails

---

## Questions?

- 📖 Full Guide: [EMAIL_JS_SETUP.md](EMAIL_JS_SETUP.md)
- 🔗 EmailJS Docs: https://www.emailjs.com/docs/
- 💬 GitHub Issues: Create an issue in repo

---

**You're all set! Start receiving contact messages.** 🚀
