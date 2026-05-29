import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.web3forms.com/submit';
  private readonly accessKey = 'YOUR_WEB3FORMS_ACCESS_KEY';
  private lastSubmitTime = 0;

  submitContact(data: ContactFormData): Observable<ContactResponse> {
    // Rate limit: 1 submit per 30 seconds
    const now = Date.now();
    if (now - this.lastSubmitTime < 30000) {
      return throwError(() => ({
        success: false,
        message: 'Please wait before sending another message.'
      }));
    }
    this.lastSubmitTime = now;

    const payload = {
      access_key: this.accessKey,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      from_name: 'Portfolio Contact Form',
      botcheck: '' // honeypot
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      timeout(15000),
      map(res => ({
        success: res.success === true,
        message: res.success ? 'Message sent successfully! I\'ll get back to you soon.' : (res.message || 'Failed to send message.')
      })),
      catchError(err => {
        const message = err?.error?.message || 'Unable to send message. Please try again later.';
        return throwError(() => ({ success: false, message }));
      })
    );
  }
}
