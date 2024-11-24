import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'experienceDuration',
  standalone: true
})
export class ExperienceDurationPipe implements PipeTransform {

  transform(startDate: string, endDate: string = 'Present'): string {
    debugger
    const start = new Date(startDate);
    const end = endDate === 'Present' ? new Date() : new Date(endDate);

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    const totalMonths = years * 12 + months;
    const displayYears = Math.floor(totalMonths / 12);
    const displayMonths = totalMonths % 12;

    const yearText = displayYears > 0 ? `${displayYears} yr${displayYears > 1 ? 's' : ''} ` : '';
    const monthText = displayMonths > 0 ? `${displayMonths} mo${displayMonths > 1 ? 's' : ''}` : '';

    return `${yearText}${monthText}`.trim();
  }
}
