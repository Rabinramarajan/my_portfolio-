import {
  HttpContextToken,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  finalize,
  mergeMap,
  throwError,
  timeout,
  retryWhen
} from 'rxjs';
import { timer } from 'rxjs';
import { AppSettingsService } from '../services/app-settings/app-settings.service';

// Context tokens to control interceptor behavior per-request
export const NO_AUTH = new HttpContextToken<boolean>(() => false);
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);
export const RETRY_ATTEMPTS = new HttpContextToken<number>(() => -1); // -1 => use defaults
export const TIMEOUT_MS = new HttpContextToken<number>(() => -1); // -1 => use defaults

// A typed error shape your app can rely on when catching
export interface EnrichedHttpError extends HttpErrorResponse {
  requestId: string;
  correlationId: string;
  userMessage: string;
  backend: any;
}

function uuid(): string {
  try {
    // @ts-ignore - crypto may not be typed on some TS libs but exists in modern browsers
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch { /* noop */ }
  // RFC4122-ish fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isTransient(error: any): boolean {
  // Network error or server/transient statuses
  const status = (error as HttpErrorResponse)?.status ?? -1;
  return (
    status === 0 || // CORS/network
    status === 408 ||
    status === 429 ||
    (status >= 500 && status < 600)
  );
}

function parseRetryAfterMs(err: HttpErrorResponse): number | null {
  const header = err?.headers?.get?.('Retry-After');
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    const diff = dateMs - Date.now();
    return diff > 0 ? diff : 0;
  }
  return null;
}

function defaultMaxRetries(method: string): number {
  // Only retry idempotent methods by default
  const upper = method.toUpperCase();
  return upper === 'GET' || upper === 'HEAD' || upper === 'OPTIONS' ? 2 : 0;
}

function backoffDelayMs(attempt: number, base = 300, cap = 5000): number {
  const jitter = Math.random() * base; // add jitter to reduce bursts
  return Math.min(cap, base * Math.pow(2, attempt) + jitter);
}

function buildUserMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Network error. Check your connection and try again.';
  switch (err.status) {
    case 400:
      return 'Bad request. Please verify the data and try again.';
    case 401:
      return 'You are not authorized. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Requested resource was not found.';
    case 408:
      return 'The request timed out. Please try again.';
    case 409:
      return 'A conflict occurred. Please refresh and try again.';
    case 422:
      return 'Validation failed. Please review and correct the input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      if (err.status >= 500) return 'Server error. Please try again later.';
      return err.message || 'Unexpected error occurred.';
  }
}

function extractBackendDetails(err: HttpErrorResponse): any {
  const body: any = err?.error;
  if (!body) return null;
  if (typeof body === 'string') return { message: body };
  // Common API error shapes
  return {
    code: body.code || body.errorCode || body.status || undefined,
    message:
      body.message || body.error || body.title || body.detail || body.reason || undefined,
    details: body.errors || body.details || undefined,
  };
}

export const AppInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const appSetting = inject(AppSettingsService);
  const env = appSetting?.environment ?? {};

  const noAuth = req.context.get(NO_AUTH);
  const silent = req.context.get(SILENT_ERRORS);
  const customRetries = req.context.get(RETRY_ATTEMPTS);
  const customTimeout = req.context.get(TIMEOUT_MS);

  const requestId = uuid();
  const correlationId = req.headers.get('X-Correlation-Id') || env.correlationId || uuid();

  const setHeaders: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    'X-Request-Id': requestId,
    'X-Correlation-Id': correlationId,
  };
  if (!noAuth && env.token) {
    setHeaders['Authorization'] = 'Bearer ' + env.token;
  }
  if (env.clientCode) {
    setHeaders['X-Tenant-Code'] = env.clientCode;
  }

  const newRequest = req.clone({
    setHeaders,
  });

  const timeoutMs = customTimeout > -1 ? customTimeout : Number(env.httpTimeoutMs) || 15000;
  const maxRetries = customRetries > -1 ? customRetries : defaultMaxRetries(req.method);

  return next(newRequest).pipe(
    timeout(timeoutMs),
    retryWhen((error$) =>
      error$.pipe(
        mergeMap((error: any, attemptIndex: number) => {
          const err = error as HttpErrorResponse;
          const attempt = attemptIndex + 1;
          if (attempt > maxRetries || !isTransient(err)) {
            return throwError(() => err);
          }

          // Respect Retry-After for 429 if present; else exponential backoff
          const retryAfter = err.status === 429 ? parseRetryAfterMs(err) : null;
          const delayMs = retryAfter ?? backoffDelayMs(attempt);
          if (!silent) {
            console.warn(`Retrying request (${attempt}/${maxRetries}) in ${Math.round(delayMs)}ms`, {
              url: req.url,
              method: req.method,
              status: err.status,
              requestId,
            });
          }
          return timer(delayMs);
        })
      )
    ),
    catchError((error: any) => {
      const err = error as HttpErrorResponse;
      const backend = extractBackendDetails(err);
      const userMessage = buildUserMessage(err);
  const enriched: EnrichedHttpError = {
        ...err,
        url: err.url || newRequest.url,
        requestId,
        correlationId,
        userMessage,
        backend,
  };

      if (!silent) {
        console.error('HTTP Error', {
          status: err.status,
          url: enriched.url,
          method: req.method,
          requestId: enriched.requestId,
          correlationId: enriched.correlationId,
          userMessage: enriched.userMessage,
          backend: enriched.backend,
        });
      }

      // Example hooks (extend as needed):
      // if (err.status === 401 && !noAuth) { /* trigger sign-out or refresh */ }

      return throwError(() => enriched);
    }),
    finalize(() => {
      // Cleanup actions here (e.g., hide spinner)
    })
  );
};
