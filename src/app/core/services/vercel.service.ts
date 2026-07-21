import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VercelService {
  constructor() {
    if (!isDevMode() && typeof window !== 'undefined') {
      this.initAnalytics();
    }
  }

  private initAnalytics(): void {
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
  }
}
