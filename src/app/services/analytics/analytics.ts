import { Injectable, inject } from '@angular/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // use inject() instead of constructor injection (Angular 20 guidance)
  private readonly ga = inject(GoogleAnalyticsService);

  /**
   * Send a GA event. Wraps ngx-google-analytics `event` call and provides
   * a typed, defensive interface.
   *
   * @param action required event action (e.g. 'click')
   * @param category optional event category (e.g. 'navigation')
   * @param label optional label or extra data; if not a string it will be JSON.stringified
   */
  sendAnalyticEvent(action: string, category?: string, label?: string | number | Record<string, unknown> | null): void {
    const params: Record<string, unknown> = {};

    if (category) {
      params['event_category'] = category;
    }

    if (label !== undefined && label !== null) {
      params['event_label'] = typeof label === 'string' || typeof label === 'number' ? String(label) : JSON.stringify(label);
    }

    // If we have any params, pass them; otherwise call event with just the action
    if (Object.keys(params).length > 0) {
      // ngx-google-analytics typing can be strict; cast to any to pass through
      this.ga.event(action, params as any);
    } else {
      this.ga.event(action);
    }
  }

  /**
   * Send a pageview to Google Analytics.
   * @param path path/URL of the page (e.g. '/about')
   * @param title optional page title
   */
  sendAnalyticPageView(path: string, title?: string): void {
    this.ga.pageView(path, title);
  }

}
