import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'experience',
  pure: true
})
export class ExperienceYearsPipe implements PipeTransform {

  transform(startDate: string | Date, showYears: boolean = true): string {
    if (!startDate) return showYears ? '0+ years' : '0';

    const start = new Date(startDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const total = years + months / 12;

    return showYears ? `${total.toFixed(1)}+ years` : `${total.toFixed(1)}+`;
  }
}
