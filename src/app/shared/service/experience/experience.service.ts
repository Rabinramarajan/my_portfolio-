// experience.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {

  constructor() { }

  /**
   * Calculate experience duration from a given start date and format it
   * as a human-readable string like "3 years 5 months".
   * - Omits zero units (e.g., "3 years", "5 months")
   * - Uses proper singular/plural ("1 year", "1 month")
   * - For future or same-month dates resulting in < 1 month, returns "0 months"
   * @param startDate - The date when you started your experience
   */
  getExperienceYears(startDate: Date): string {
    const now = new Date();
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      return '';
    }

    // Clamp future dates to "0 months"
    if (start > now) {
      return '0 months';
    }

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    // Adjust if days are negative (borrow from previous month)
    if (days < 0) {
      months -= 1;
      const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += daysInPrevMonth;
    }

    // Adjust if months are negative (borrow from years)
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Format as human-readable string: "X years Y months"
    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    }

    // If both are zero (started this month), show "0 months"
    if (parts.length === 0) {
      return '0 months';
    }

    return parts.join(' ');
  }
}
