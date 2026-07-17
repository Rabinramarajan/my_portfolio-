# Bug #4: Generic Error Message Hides Root Cause

**Severity**: 🔴 CRITICAL - User Experience  
**File**: `src/app/features/contact/contact.ts`  
**Lines**: 71-73  
**Status**: CONFIRMED

---

## Problem

Error catch block discards specific error details and displays a generic message, preventing users from understanding what went wrong.

```typescript
// Line 71-73: Specific error details discarded
try {
  await this.emailService.send({ ...this.model() });
  this.sent.set(true);
  this.model.set({ ...EMPTY });
  this.contactForm().reset();
} catch {
  // ❌ No error parameter - details lost
  this.error.set('Something went wrong while sending your message. Please try again.');
}
```

---

## Impact

**Users Cannot Determine**:

- Is it a temporary network error? (Retry now)
- Is it a rate limit? (Wait and retry)
- Is the email service misconfigured? (Contact owner)
- Is the user's email invalid? (Fix email address)
- Is the message too large? (Make it shorter)

**Business Impact**:

- Users abandon form without knowing why
- Recruiter cannot contact you due to error
- No way to log/debug production issues
- No feedback for portfolio owner about problems

---

## Root Cause

The catch block (`catch { }`) doesn't capture the error parameter, so error details are unavailable. EmailJS throws `EmailJSResponseStatus` with specific error codes and messages that should be used to provide actionable feedback.

---

## Solution

Capture and analyze the error, then provide specific error messages:

```typescript
import { EmailJSResponseStatus } from '@emailjs/browser';

protected async onSubmit(): Promise<void> {
  this.sending.set(true);
  this.sent.set(false);
  this.error.set(null);

  await submit(this.contactForm, async () => {
    if (!this.emailService.isConfigured) {
      this.error.set('Email service is not configured yet. Please try again later.');
      return undefined;
    }

    try {
      await this.emailService.send({ ...this.model() });
      this.sent.set(true);
      this.model.set({ ...EMPTY });
      this.contactForm().reset();
    } catch (err) {
      // Capture error and provide specific message
      const message = this.getErrorMessage(err);
      this.error.set(message);
      console.error('Contact form submission error:', err); // Log for debugging
    }

    return undefined;
  });

  this.sending.set(false);
}

/** Parse EmailJS error and return user-friendly message. */
private getErrorMessage(error: unknown): string {
  // EmailJSResponseStatus errors
  if (error instanceof EmailJSResponseStatus) {
    // Status code 400-499: Client errors (user's fault)
    if (error.status >= 400 && error.status < 500) {
      if (error.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      return 'Invalid email configuration. Please contact the site owner.';
    }

    // Status code 500+: Server errors (temporary, retry)
    if (error.status >= 500) {
      return 'Email service unavailable. Please try again in a few moments.';
    }
  }

  // Network errors (no response)
  if (error instanceof Error) {
    if (error.message.includes('Network') || error.message.includes('Failed')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }

  // Fallback
  return 'Something went wrong. Please try again or contact the site owner.';
}
```

### Alternative: Simple Error Logging

Minimal fix (if you don't want to show detailed messages to users):

```typescript
try {
  await this.emailService.send({ ...this.model() });
  this.sent.set(true);
  this.model.set({ ...EMPTY });
  this.contactForm().reset();
} catch (err) {
  // Log the error for debugging
  console.error('Contact form error:', err);

  // Show generic message to user
  this.error.set('Something went wrong while sending your message. Please try again.');

  // Optionally: Send error to analytics/logging service
  // this.analyticsService.logError('contact_form_submission', err);
}
```

---

## EmailJS Error Codes Reference

| Status        | Meaning               | User Action              |
| ------------- | --------------------- | ------------------------ |
| 200           | Success               | ✅ Message sent          |
| 400           | Invalid parameters    | ❌ Configuration error   |
| 401           | Unauthorized          | ❌ Service key invalid   |
| 429           | Too many requests     | ⏱️ Wait and retry        |
| 500           | Service error         | ⏱️ Retry later           |
| Network error | Connection failed     | ⏱️ Check internet, retry |
| Timeout       | Request took too long | ⏱️ Retry                 |

---

## Testing

Test different error scenarios:

```typescript
// Test network error
// DevTools > Network > Offline, then submit form

// Test timeout
// DevTools > Network > Throttle to Slow 3G, then submit

// Test invalid config
// Remove API key, verify error message

// Test rate limit
// Submit form 10+ times quickly, verify 429 error
```

---

## Logging Best Practices

Add structured logging for monitoring:

```typescript
private log(level: 'info' | 'error', message: string, data?: any): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    userAgent: navigator.userAgent,
  };

  // Log to console in dev
  if (this.isDev) {
    console[level === 'error' ? 'error' : 'log'](logEntry);
  }

  // Send to analytics/logging service in prod
  // this.analyticsService.log(logEntry);
}
```

---

## Related

- EmailJS documentation
- Error handling patterns
- User feedback best practices
- Logging and monitoring
