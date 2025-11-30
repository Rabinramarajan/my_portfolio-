import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'portfolio-theme';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  
  private isDarkMode = signal<boolean>(this.getInitialTheme());
  
  readonly theme = computed(() => this.isDarkMode() ? 'dark' : 'light');
  readonly isDark = computed(() => this.isDarkMode());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const theme = this.isDarkMode() ? 'dark' : 'light';
        this.document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.THEME_KEY, theme);
      }
    });
  }

  private getInitialTheme(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
  }

  setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
  }
}
