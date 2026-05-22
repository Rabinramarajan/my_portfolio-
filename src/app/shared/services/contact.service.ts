import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  contactId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = '/api/contact'; // Will proxy to backend

  constructor(private http: HttpClient) {}

  submitContact(data: ContactFormData): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data).pipe(
      timeout(30000),
      retry(1),
      catchError((err) => {
        const message = err?.error?.message || 'Unable to send message at this time.';
        return throwError(() => ({ success: false, message }));
      })
    );
  }
}
