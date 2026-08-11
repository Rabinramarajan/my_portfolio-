import { Injectable, signal } from '@angular/core';

/**
 * Injectable "now" so time-dependent copy (the footer's legal year) is
 * deterministic in tests and SSR instead of being read from the wall clock at
 * random moments. Defaults to the current year; tests can `setNow`.
 */
@Injectable({ providedIn: 'root' })
export class LocalClock {
  private readonly year = signal(new Date().getFullYear());

  readonly currentYear = this.year.asReadonly();

  setNow(date: Date): void {
    this.year.set(date.getFullYear());
  }
}
