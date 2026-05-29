# EmailJS Setup Quick Reference Card 📋

## Configuration Checklist

### From EmailJS Dashboard

| Item | Location | Copy This |
|------|----------|-----------|
| **Service ID** | Email Services → Your Service | `service_abc123xyz` |
| **Template ID** | Email Templates → Your Template | `template_abc123xyz` |
| **Public Key** | Account → API Keys | `your_abc123xyz` |
| **Recipient Email** | Your email | `your-email@gmail.com` |

---

## Configuration File Template

**File**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  emailjs: {
    serviceId: 'service_',           // ← Paste Service ID here
    templateId: 'template_',          // ← Paste Template ID here
    publicKey: 'your_',               // ← Paste Public Key here
    recipientEmail: ''                // ← Your email here
  }
};
```

---

## EmailJS Template Setup

**In EmailJS Dashboard:**

1. **Template Name**: `portfolio_contact`
2. **Subject**: `Contact Form: {{subject}}`
3. **Body**:

```
From: {{from_name}} <{{from_email}}>
To: {{to_email}}
Subject: {{subject}}
Date: {{timestamp}}

Message:
{{message}}

---
Reply to: {{reply_to}}
```

---

## Production Deployment

### Vercel Environment Variables

Add to Vercel Project Settings → Environment Variables:

```
EMAILJS_SERVICE_ID=service_abc123xyz
EMAILJS_TEMPLATE_ID=template_abc123xyz
EMAILJS_PUBLIC_KEY=your_abc123xyz
EMAILJS_RECIPIENT_EMAIL=your-email@gmail.com
```

### Update Code for Production

In `contact.service.ts`:
```typescript
private readonly SERVICE_ID = process.env['NG_APP_EMAILJS_SERVICE_ID']!;
private readonly TEMPLATE_ID = process.env['NG_APP_EMAILJS_TEMPLATE_ID']!;
private readonly PUBLIC_KEY = process.env['NG_APP_EMAILJS_PUBLIC_KEY']!;
private readonly RECIPIENT_EMAIL = process.env['NG_APP_EMAILJS_RECIPIENT_EMAIL']!;
```

---

## Testing Commands

```bash
# Start development server
npm start

# Build for production
npm build

# Check dependencies
npm list @emailjs/browser

# View current config status
# Open browser console and check logs
```

---

## File Locations

| Purpose | Path |
|---------|------|
| Contact Service | `src/app/shared/services/contact.service.ts` |
| Development Config | `src/environments/environment.ts` |
| Production Config | `src/environments/environment.prod.ts` |
| Documentation | `EMAIL_JS_SETUP.md` |
| Quick Setup | `EMAILJS_QUICK_SETUP.md` |
| Code Examples | `EMAILJS_USAGE_EXAMPLES.md` |

---

## Troubleshooting

### ❌ "Not configured" Error
```
✅ Check: environment.ts has all 4 values
✅ Verify: Values are NOT placeholder text
✅ Ensure: No spaces before/after values
```

### ❌ Email Not Received
```
✅ Check: Email sent successfully (green check)
✅ Look: Spam/junk folder
✅ Verify: Recipient email is correct
✅ Monitor: EmailJS dashboard activity
```

### ❌ "Forbidden" Error
```
✅ Solution: Add domain to EmailJS security whitelist
1. EmailJS Dashboard → Account → Security
2. Add your domain (e.g., portfolio.com)
```

### ❌ Cannot Find Module
```
✅ Reinstall: npm install @emailjs/browser
✅ Update: npm update
✅ Check: src/environments/environment.ts exists
```

---

## Key Limits & Features

| Feature | Limit | Notes |
|---------|-------|-------|
| Free Tier | 200 emails/month | Plenty for portfolio |
| Rate Limit | 1 email / 30 sec | Per user session |
| Timeout | 15 seconds | Per email send |
| Template Size | Unlimited | HTML supported |
| Recipients | Unlimited | Multiple emails |
| Storage | 30 days | Activity logs kept |

---

## Security Reminders

✅ **DO**
- Use environment variables for credentials
- Keep Public Key in code, Secret Key private
- Enable domain whitelist
- Monitor activity logs
- Validate user inputs

❌ **DON'T**
- Commit real credentials to Git
- Expose Secret Key
- Disable rate limiting
- Ignore error messages
- Store user data unnecessarily

---

## Next Steps

1. ✅ Get EmailJS credentials (5 min)
2. ✅ Update environment.ts (2 min)
3. ✅ Test locally with `npm start` (5 min)
4. ✅ Deploy to production (varies)
5. ✅ Monitor via EmailJS dashboard (ongoing)

---

## Support

| Need | Resource |
|------|----------|
| Quick Setup | [EMAILJS_QUICK_SETUP.md](EMAILJS_QUICK_SETUP.md) |
| Detailed Guide | [EMAIL_JS_SETUP.md](EMAIL_JS_SETUP.md) |
| Code Examples | [EMAILJS_USAGE_EXAMPLES.md](EMAILJS_USAGE_EXAMPLES.md) |
| Full Details | [EMAILJS_IMPLEMENTATION.md](EMAILJS_IMPLEMENTATION.md) |
| Official Docs | https://www.emailjs.com/docs/ |

---

## Status

| Component | ✅ Status |
|-----------|-----------|
| EmailJS Library | ✅ Installed (v4.4.1) |
| Contact Service | ✅ Implemented |
| Environment Files | ✅ Created |
| Build | ✅ Successful |
| Documentation | ✅ Complete |
| Ready for Use | ✅ Yes (after config) |

---

**Print this card and follow the checklist above to complete your setup!** 📋

Time to setup: **~15 minutes** ⏱️
