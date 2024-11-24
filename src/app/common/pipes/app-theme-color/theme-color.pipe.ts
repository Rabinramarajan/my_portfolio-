import { Pipe, PipeTransform } from '@angular/core';

interface ThemeColors {
  [key: string]: string;
}

@Pipe({
  name: 'themeColors',
  standalone: true
})
export class ThemeColorsPipe implements PipeTransform {
  transform(isDarkTheme: boolean): ThemeColors {
    return isDarkTheme ? this.darkThemeColors() : this.lightThemeColors();
  }

  private darkThemeColors(): ThemeColors {
    return {
      'primary-color': '#F9FAFB',
      'secondary-color': '#374151',
      'background-color': '#030712',
      'text-color': '#D1D5DB',
      'btn-text-color': 'rgba(17, 24, 39, 1)',
      'logo-color': 'rgba(249, 250, 251, 1)',
      'bg-color-1': '#030712',
      'bg-color-2': '#111827'
    };
  }

  private lightThemeColors(): ThemeColors {
    return {
      'primary-color': '#111827',
      'secondary-color': '#E5E7EB',
      'background-color': '#ffffff',
      'text-color': '#4B5563',
      'btn-text-color': 'rgba(249, 250, 251, 1)',
      'logo-color': 'rgba(17, 24, 39, 1)',
      'bg-color-1': '#FFFFFF',
      'bg-color-2': '#F9FAFB'
    };
  }
}
