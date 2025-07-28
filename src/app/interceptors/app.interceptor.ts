import {
  HttpHandlerFn,
  HttpHeaders,
  HttpInterceptorFn,
  HttpRequest
} from "@angular/common/http";
import { inject } from "@angular/core";
import {
  catchError,
  finalize,
  throwError
} from "rxjs";

import { AppSettingsService } from "../services/app-settings/app-settings.service";

export const AppInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const appSetting = inject(AppSettingsService);

  // Clone request with new headers
  const newRequest = req.clone({
    headers: req.headers
      .set('ngrok-skip-browser-warning', 'true')
      .set('Authorization', 'Bearer ' + (appSetting.environment?.token || ''))
      .set('X-Tenant-Code', appSetting.environment?.clientCode || '')
      .set('X-Correlation-Id', appSetting.environment?.correlationId || '')
  });

  return next(newRequest).pipe(
    finalize(() => {
      // Cleanup actions here (e.g., hide spinner)
    }),
    catchError((error) => {
      // Handle/log errors here
      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
