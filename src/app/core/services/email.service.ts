import { inject, Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';

import { APP_CONFIG } from '../tokens/app-config.token';

/** Payload sent to the EmailJS template. Keys must match the template vars. */
export interface EmailPayload {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

/**
 * Thin wrapper around the EmailJS browser SDK for the contact form.
 * Credentials are supplied via {@link APP_CONFIG} (environment-derived).
 */
@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly config = inject(APP_CONFIG).emailjs;

  /** True when EmailJS credentials have been configured (not placeholders). */
  get isConfigured(): boolean {
    const { serviceId, templateId, publicKey } = this.config;
    return (
      !!serviceId &&
      !!templateId &&
      !!publicKey &&
      !serviceId.startsWith('YOUR_') &&
      !templateId.startsWith('YOUR_') &&
      !publicKey.startsWith('YOUR_')
    );
  }

  /**
   * Send a contact message through EmailJS.
   * @throws EmailJSResponseStatus on failure (non-2xx) — let callers surface it.
   */
  async send(payload: EmailPayload): Promise<EmailJSResponseStatus> {
    const { serviceId, templateId, publicKey } = this.config;
    return emailjs.send(
      serviceId,
      templateId,
      {
        // Visitor's name/email — reply_to lets you reply straight to them.
        // The actual "From" is your connected EmailJS/Gmail account, so we
        // intentionally do not send a from_email that mirrors reply_to.
        from_name: payload.name,
        reply_to: payload.email,
        subject: payload.subject,
        message: payload.message,
      },
      { publicKey },
    );
  }
}
