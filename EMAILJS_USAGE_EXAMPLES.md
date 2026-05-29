# EmailJS Usage Examples

## Basic Contact Form (Built-in)

This is already implemented in the home page:

```typescript
// In home.ts
this.contactService.submitContact({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Inquiry about services',
  message: 'I would like to discuss a project...'
}).subscribe({
  next: (response) => {
    console.log('Email sent!', response.message);
    // Show success toast
  },
  error: (error) => {
    console.error('Email failed!', error.message);
    // Show error toast
  }
});
```

---

## Custom Email Sending

Use `sendCustomEmail()` for other purposes:

### Example 1: Auto-Reply to Visitor

```typescript
// In contact.service.ts or anywhere you inject it

// After receiving contact form, send auto-reply
this.contactService.sendCustomEmail(
  data.email,  // Send TO visitor
  'Thank you for contacting me!',
  `
    <h2>Thank you for reaching out!</h2>
    <p>Hi ${data.name},</p>
    <p>I received your message and will get back to you soon.</p>
    <hr>
    <p>Your message:</p>
    <blockquote>${data.message}</blockquote>
  `
).subscribe({
  next: () => console.log('Auto-reply sent'),
  error: (err) => console.error('Auto-reply failed:', err)
});
```

### Example 2: Send Newsletter

```typescript
// Send newsletter to subscriber
sendNewsletter(email: string, month: string) {
  const htmlContent = `
    <h1>Monthly Newsletter - ${month}</h1>
    <h2>Latest Blog Posts</h2>
    <ul>
      <li><a href="...">Article 1</a></li>
      <li><a href="...">Article 2</a></li>
    </ul>
  `;

  this.contactService.sendCustomEmail(
    email,
    `${month} Newsletter`,
    htmlContent
  ).subscribe(
    response => console.log('Newsletter sent!'),
    error => console.error('Newsletter failed!')
  );
}
```

### Example 3: Send Notification

```typescript
// Notify admin of new subscriber
notifyAdminOfNewSubscriber(email: string, name: string) {
  return this.contactService.sendCustomEmail(
    'your-email@gmail.com',  // Send TO your email
    'New Subscriber Alert!',
    `
      <h2>New Subscriber</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `
  );
}
```

---

## Advanced: Custom Service Method

Create a utility method in your service:

```typescript
// Add to contact.service.ts

/**
 * Send promotional email with tracking
 */
sendPromoEmail(
  recipientEmail: string, 
  promoCode: string, 
  discount: number
): Observable<ContactResponse> {
  const templateParams = {
    to_email: recipientEmail,
    subject: `Exclusive ${discount}% off - Code: ${promoCode}`,
    html_content: `
      <h1>Exclusive Offer!</h1>
      <p>Get ${discount}% off with code: <strong>${promoCode}</strong></p>
      <a href="https://yoursite.com?promo=${promoCode}">Claim Your Discount</a>
    `,
    timestamp: new Date().toISOString(),
  };

  return from(
    emailjs.send(
      this.SERVICE_ID,
      this.TEMPLATE_ID,
      templateParams
    )
  ).pipe(
    timeout(10000),
    map(() => ({
      success: true,
      message: `Promo email sent to ${recipientEmail}`
    })),
    catchError(error => 
      throwError(() => ({
        success: false,
        message: 'Failed to send promo email'
      }))
    )
  );
}
```

Usage:
```typescript
this.contactService.sendPromoEmail('user@example.com', 'SUMMER50', 50)
  .subscribe(response => console.log(response));
```

---

## EmailJS Template Variables

When creating templates in EmailJS dashboard, use these variables:

### For Contact Form
```
{{from_name}}       - Visitor's name
{{from_email}}      - Visitor's email
{{to_email}}        - Your email
{{subject}}         - Form subject
{{message}}         - Form message
{{reply_to}}        - Auto-reply address
{{timestamp}}       - Submission time
```

### For Custom Emails
```
{{to_email}}        - Recipient
{{subject}}         - Email subject
{{html_content}}    - HTML body
{{timestamp}}       - Send time
```

### Example Template
```
From: {{from_name}} <{{from_email}}>
To: {{to_email}}
Subject: {{subject}}
Date: {{timestamp}}

---MESSAGE---
{{message}}

---
Reply to: {{reply_to}}
```

---

## Error Handling

```typescript
// Comprehensive error handling

this.contactService.submitContact(formData).subscribe({
  next: (response) => {
    // Success
    if (response.success) {
      this.showSuccessToast(response.message);
      this.resetForm();
    }
  },
  error: (error) => {
    // Different error types
    if (error.message.includes('timeout')) {
      this.showErrorToast('Request took too long. Try again.');
    } else if (error.message.includes('rate')) {
      this.showErrorToast('Please wait before sending another message.');
    } else if (error.message.includes('configuration')) {
      this.showErrorToast('Email service not configured.');
      console.error('Admin: Configure EmailJS credentials');
    } else {
      this.showErrorToast(error.message || 'Failed to send email');
    }
  }
});
```

---

## Testing the Service

```typescript
// In your component for testing

// Test 1: Check if configured
testConfiguration() {
  const status = this.contactService.getConfigStatus();
  console.log('EmailJS Status:', status);
  // Output: { configured: true/false, initialized: true/false }
}

// Test 2: Validate email
testEmailValidation() {
  console.log(this.contactService.isValidEmail('user@example.com'));    // true
  console.log(this.contactService.isValidEmail('invalid-email'));      // false
}

// Test 3: Send test email
sendTestEmail() {
  this.contactService.sendCustomEmail(
    'your-email@gmail.com',
    'Test Email from Portfolio',
    '<h1>This is a test email</h1><p>If you see this, EmailJS works!</p>'
  ).subscribe(
    response => console.log('✅ Test email sent:', response),
    error => console.error('❌ Test email failed:', error)
  );
}
```

Usage in component:
```typescript
// In your test/debug component
testConfiguration();    // Check if set up
testEmailValidation();  // Test validator
sendTestEmail();        // Send test message
```

---

## Rate Limiting

The service implements automatic rate limiting:

```typescript
// Maximum 1 email per 30 seconds per user session

// First email: ✅ Sent
// Second email (10 sec later): ❌ Rate limited
// Third email (40 sec later): ✅ Sent

// To bypass for testing (NOT recommended):
private lastSubmitTime = 0;  // Reset this to allow testing
```

---

## Monitoring

### Check EmailJS Dashboard

1. Log into EmailJS.com
2. Dashboard → **Email Delivery** section
3. View:
   - ✅ Successful sends
   - ❌ Failed attempts
   - 📊 Daily statistics
   - 📈 Monthly quota usage

### Console Logging

The service logs important events:

```javascript
// When initializing (success)
// ✅ "EmailJS initialized successfully"

// When initializing (warning - not configured)
// ⚠️ "EmailJS not configured. Please set your credentials..."

// On errors
// ❌ "EmailJS Error: {error details}"
// ❌ "Custom email error: {error details}"
```

---

## Best Practices

### ✅ DO
- Use environment variables for credentials
- Validate all user inputs on frontend
- Implement rate limiting (already done)
- Monitor EmailJS activity
- Use HTTPS in production
- Add domain whitelist in EmailJS

### ❌ DON'T
- Hardcode credentials in code
- Expose private/secret keys
- Send emails without rate limiting
- Use untrusted template variables
- Ignore error messages
- Skip validation

---

## Troubleshooting

### Email not sending?

```typescript
// 1. Check configuration
const status = this.contactService.getConfigStatus();
console.log(status);
// Should be: { configured: true, initialized: true }

// 2. Check console for errors
// Look for: "EmailJS Error:" or "Custom email error:"

// 3. Verify credentials in environment.ts
// Check that all 4 values are not placeholders

// 4. Check EmailJS dashboard
// Verify service/template IDs exist
// Check if service is active
```

### Rate limit blocking test emails?

```typescript
// Either:
// 1. Wait 30 seconds between emails
// 2. Use different browser/session
// 3. For development: temporarily adjust rate limit in service

// In contact.service.ts:
// Change: if (now - this.lastSubmitTime < 30000)
// To:     if (now - this.lastSubmitTime < 5000)  // 5 sec for testing
```

---

## Additional Resources

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **Service Code**: `src/app/shared/services/contact.service.ts`
- **Setup Guide**: `EMAILJS_QUICK_SETUP.md`
- **Detailed Guide**: `EMAIL_JS_SETUP.md`

---

Need help? Check the main setup guides or create an issue in the repository!
