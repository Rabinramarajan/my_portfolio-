import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import emailjs from '@emailjs/browser';
import { environment } from '@environments/environment';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  // EmailJS Configuration from environment
  private readonly SERVICE_ID = environment.emailjs.serviceId;
  private readonly TEMPLATE_ID = environment.emailjs.templateId;
  private readonly PUBLIC_KEY = environment.emailjs.publicKey;
  private readonly RECIPIENT_EMAIL = environment.emailjs.recipientEmail;
  
  private lastSubmitTime = 0;
  private isInitialized = false;

  constructor() {
    this.initializeEmailJS();
  }

  /**
   * Initialize EmailJS with public key
   */
  private initializeEmailJS(): void {
    try {
      // Check if credentials are configured
      if (this.PUBLIC_KEY === 'your_public_key') {
        console.warn('EmailJS not configured. Please set your credentials in src/environments/environment.ts');
        return;
      }
      
      emailjs.init(this.PUBLIC_KEY);
      this.isInitialized = true;
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('EmailJS initialization failed:', error);
    }
  }

  /**
   * Submit contact form via EmailJS
   */
  submitContact(data: ContactFormData): Observable<ContactResponse> {
    // Rate limit: 1 submit per 30 seconds
    const now = Date.now();
    if (now - this.lastSubmitTime < 30000) {
      return throwError(() => ({
        success: false,
        message: 'Please wait 30 seconds before sending another message.'
      }));
    }

    if (!this.isInitialized) {
      return throwError(() => ({
        success: false,
        message: 'Email service is not configured. Please try again later.'
      }));
    }

    this.lastSubmitTime = now;

    // Prepare template parameters
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      to_email: this.RECIPIENT_EMAIL,
      subject: data.subject,
      message: data.message,
      reply_to: data.email,
      timestamp: new Date().toISOString(),
    };

    // Send email using EmailJS
    return from(
      emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      )
    ).pipe(
      timeout(15000),
      map((response) => {
        if (response.status === 200) {
          return {
            success: true,
            message: 'Message sent successfully! I\'ll get back to you soon.'
          };
        }
        return {
          success: false,
          message: 'Failed to send message. Please try again.'
        };
      }),
      catchError((error) => {
        console.error('EmailJS Error:', error);
        let message = 'Unable to send message. Please try again later.';
        
        if (error.name === 'TimeoutError') {
          message = 'Request timeout. Please try again.';
        } else if (error.text === 'Forbidden') {
          message = 'Email service configuration error. Contact the site owner.';
        } else if (error.status === 0) {
          message = 'Network error. Please check your connection.';
        }
        
        return throwError(() => ({
          success: false,
          message
        }));
      })
    );
  }

  /**
   * Send email programmatically (optional utility method)
   */
  sendCustomEmail(recipient: string, subject: string, htmlContent: string): Observable<ContactResponse> {
    if (!this.isInitialized) {
      return throwError(() => ({
        success: false,
        message: 'Email service not initialized'
      }));
    }

    const templateParams = {
      to_email: recipient,
      subject: subject,
      html_content: htmlContent,
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
        message: 'Email sent successfully'
      })),
      catchError((error) => {
        console.error('Custom email error:', error);
        return throwError(() => ({
          success: false,
          message: 'Failed to send email'
        }));
      })
    );
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get EmailJS configuration status
   */
  getConfigStatus(): { configured: boolean; initialized: boolean } {
    return {
      configured: this.PUBLIC_KEY !== 'your_public_key' && 
                  this.SERVICE_ID !== 'service_your_service_id' &&
                  this.TEMPLATE_ID !== 'template_your_template_id',
      initialized: this.isInitialized
    };
  }
}
