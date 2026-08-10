import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, timeout } from 'rxjs';

import type { ContactRequest, ContactResponse } from '../models/contact.models';

const ENDPOINT = '/api/contact';
const TIMEOUT_MS = 15_000;

/**
 * The one place the app talks to the contact backend.
 *
 * RxJS is the right tool here — this is a cancellable async HTTP call — but the
 * stream stops at this boundary: the form component projects it into signals.
 */
@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly http = inject(HttpClient);

  send(payload: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(ENDPOINT, payload).pipe(
      timeout(TIMEOUT_MS),
      // The server never returns internal detail; anything unexpected here is
      // reduced to a message safe to show a stranger.
      catchError((error: unknown) => of(this.toResponse(error))),
    );
  }

  private toResponse(error: unknown): ContactResponse {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as Partial<ContactResponse> | null;
      if (error.status === 429) {
        return {
          success: false,
          message: 'Too many messages from this address. Please try again in a little while.',
        };
      }
      if (error.status === 400 && body?.errors) {
        return {
          success: false,
          message: body.message ?? 'Please check the highlighted fields.',
          errors: body.errors,
        };
      }
      if (error.status === 0) {
        return {
          success: false,
          message: `Couldn't reach the server. Check your connection, or email me directly.`,
        };
      }
    }
    return {
      success: false,
      message: `Something went wrong sending your message. Please email me directly instead.`,
    };
  }
}
