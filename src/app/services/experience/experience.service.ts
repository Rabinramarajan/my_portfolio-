// experience.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {

  constructor() { }

  /**
   * Calculate experience in years (decimal) from a given start date
   * @param startDate - The date when you started your experience
   */
  getExperienceYears(startDate: Date): string {
    debugger
    const now = new Date();
    const start = new Date(startDate);

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    // Adjust if months or days are negative
    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); // days in previous month
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Convert to decimal years (2 decimals)
    const experience = years + months / 12;
    return experience.toFixed(1); // e.g., "3.4"
  }
}
