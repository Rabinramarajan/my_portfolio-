# EmailJS Integration Setup Guide

## Overview
This project now uses **EmailJS** for sending contact form emails directly from the browser without requiring a backend API.

## Step-by-Step Setup

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Configure Your Email Service

#### Add Email Service
1. Login to EmailJS Dashboard
2. Go to **Email Services**
3. Click **Add Service**
4. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Yahoo**
   - **Custom SMTP**
5. Follow the authentication steps
6. Copy your **Service ID** (e.g., `service_abc123xyz`)

#### Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Name it (e.g., `portfolio_contact`)
4. Set up template variables:

```
From: {{from_name}} <{{from_email}}>
To: {{to_email}}
Subject: {{subject}}
Date: {{timestamp}}

Message:
{{message}}

---
This is an automated message from your portfolio contact form.
```

**Important Template Variables:**
- `{{from_name}}` - Visitor's name
- `{{from_email}}` - Visitor's email
- `{{to_email}}` - Your email address
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{timestamp}}` - Submission time
- `{{reply_to}}` - Auto-reply address

5. Copy your **Template ID** (e.g., `template_abc123xyz`)

### 3. Get Your Public Key
1. Go to **Account** → **API Keys**
2. Copy your **Public Key** (starts with `your_`)

### 4. Update Contact Service

Edit [src/app/shared/services/contact.service.ts](src/app/shared/services/contact.service.ts) and replace:

```typescript
private readonly SERVICE_ID = 'service_your_service_id'; // Your Service ID
private readonly TEMPLATE_ID = 'template_your_template_id'; // Your Template ID
private readonly PUBLIC_KEY = 'your_public_key'; // Your Public Key
```

Also update your recipient email:
```typescript
to_email: 'your-email@example.com', // Replace with your email
```

### 5. Environment Variables (Optional - Recommended)

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  emailjs: {
    serviceId: 'service_your_service_id',
    templateId: 'template_your_template_id',
    publicKey: 'your_public_key',
    recipientEmail: 'your-email@example.com'
  }
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  emailjs: {
    serviceId: 'service_your_service_id',
    templateId: 'template_your_template_id',
    publicKey: 'your_public_key',
    recipientEmail: 'your-email@example.com'
  }
};
```

Then update `contact.service.ts` to use it:

```typescript
import { environment } from '../../../environments/environment';

// In service:
private readonly SERVICE_ID = environment.emailjs.serviceId;
private readonly TEMPLATE_ID = environment.emailjs.templateId;
private readonly PUBLIC_KEY = environment.emailjs.publicKey;
```

### 6. Security Best Practices

⚠️ **Important Security Notes:**

1. **Public Key Only**: Never expose your Secret Key. EmailJS public keys are safe to expose.
2. **Domain Restrictions**: In EmailJS dashboard:
   - Go to **Account** → **Security**
   - Add authorized domains (your portfolio domain)
   - This prevents misuse from other domains

3. **Template Security**: 
   - Don't include sensitive logic in templates
   - Validate all user inputs on frontend
   - Use rate limiting (already implemented in service)

4. **Production Deployment**:
   - Use environment variables in your deployment platform
   - Never commit credentials to git
   - Use `.gitignore` for environment files

### 7. Test the Form

1. Run the development server:
   ```bash
   npm start
   ```

2. Navigate to the Contact section
3. Fill in the form and submit
4. Check your email for the received message

### 8. Troubleshooting

**Issue: "EmailJS initialization failed"**
- Verify Public Key is correct
- Check browser console for error messages
- Ensure @emailjs/browser package is installed

**Issue: "Email service configuration error"**
- Verify Service ID exists in your account
- Check Template ID matches your service
- Ensure email service is active

**Issue: "Forbidden" error**
- Add your domain to EmailJS security settings
- Check if authentication credentials are expired

**Issue: No email received**
- Check your email spam/junk folder
- Verify recipient email address in service
- Check EmailJS dashboard activity logs

### 9. Advanced Features

#### Auto-Reply to Visitor
Create a second template for auto-replies and send it after receiving the contact:

```typescript
// Send confirmation to visitor
emailjs.send(
  SERVICE_ID,
  'template_auto_reply',
  {
    to_email: data.email,
    visitor_name: data.name,
    // ... other params
  }
)
```

#### Custom Email Sending
Use the `sendCustomEmail()` method in service for other purposes:

```typescript
this.contactService.sendCustomEmail(
  'recipient@example.com',
  'Subject',
  '<h1>HTML Content</h1>'
).subscribe(response => {
  console.log(response);
});
```

### 10. Pricing

- **Free Plan**: 200 emails/month ✅ (perfect for portfolios)
- **Pro Plan**: Unlimited emails/month
- No credit card required for free tier

---

## Quick Reference

| Item | Where to Find | Where to Use |
|------|---------------|-------------|
| Service ID | EmailJS Dashboard → Email Services | `SERVICE_ID` in contact.service.ts |
| Template ID | EmailJS Dashboard → Email Templates | `TEMPLATE_ID` in contact.service.ts |
| Public Key | EmailJS Dashboard → Account → API Keys | `PUBLIC_KEY` in contact.service.ts |
| Recipient Email | Your email address | `to_email` in contact.service.ts |

---

## Support

- EmailJS Docs: https://www.emailjs.com/docs/
- GitHub Issues: Create an issue in the repository
- Email: your-contact@example.com
