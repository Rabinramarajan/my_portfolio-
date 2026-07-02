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
  private lastSubmitTime = 0;

  submitContact(data: ContactFormData): Observable<ContactResponse> {
    const now = Date.now();
    if (now - this.lastSubmitTime < 30_000) {
      return throwError(() => ({
        success: false,
        message: 'Please wait 30 seconds before sending another message.',
      }));
    }

    this.lastSubmitTime = now;

    return this.http.post<ContactResponse>('/api/contact', data).pipe(
      timeout(15_000),
      map((response) => ({
        success: response.success,
        message: response.message || 'Message sent successfully!',
      })),
      catchError((error) => {
        let message = 'Unable to send message. Please try again later.';

        if (error.name === 'TimeoutError') {
          message = 'Request timeout. Please try again.';
        } else if (error.status === 429) {
          message = error.error?.message || 'Too many requests. Please wait a minute.';
        } else if (error.status === 400) {
          message = error.error?.message || 'Please check your form inputs.';
        } else if (error.status === 0) {
          message = 'Network error. Please check your connection.';
        } else if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => ({ success: false, message }));
      })
    );
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
