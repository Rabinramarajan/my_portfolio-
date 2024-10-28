import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderTemplate } from './common/templates/header-template';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Loader } from './common/templates/loader';
import { MaintenanceComponent } from './maintenance/maintenance.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderTemplate, Loader, MaintenanceComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'myPortfolio';
  isDarkTheme = false;
  isLoading = true;

  constructor(public appSetting: AppSettingsService) {
    this.initializeTheme();
  }

  ngOnInit(): void { 
    setTimeout(() => {
      this.isLoading = false;
    }, 6000); // Adjust the time as needed
  }

  toggleTheme(isDarkTheme: boolean): void {
    this.isDarkTheme = isDarkTheme;
    this.applyTheme(isDarkTheme);
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') || this.appSetting.environment.currentTheme;
    this.isDarkTheme = savedTheme === 'Dark';
    this.applyTheme(this.isDarkTheme);
  }

  private applyTheme(isDarkTheme: boolean): void {
    const themeClass = isDarkTheme ? 'dark-theme' : 'light-theme';

    // Remove both classes first
    document.body.classList.remove('dark-theme', 'light-theme');

    // Add the selected theme class
    document.body.classList.add(themeClass);

    // Directly set CSS variables based on the theme
    this.setCSSVariables(isDarkTheme);

    // Save to local storage
    localStorage.setItem('theme', isDarkTheme ? 'Dark' : 'Light');
  }

  private setCSSVariables(isDarkTheme: boolean): void {
    if (isDarkTheme) {
      document.body.style.setProperty('--primary-color', '#F9FAFB');
      document.body.style.setProperty('--secondary-color', '#374151');
      document.body.style.setProperty('--background-color', '#030712');
      document.body.style.setProperty('--text-color', '#D1D5DB');
      document.body.style.setProperty('--btn-text-color', 'rgba(17, 24, 39, 1)');
      document.body.style.setProperty('--logo-color', 'rgba(249, 250, 251, 1)');
    } else {
      document.body.style.setProperty('--primary-color', '#111827');
      document.body.style.setProperty('--secondary-color', '#E5E7EB');
      document.body.style.setProperty('--background-color', '#ffffff');
      document.body.style.setProperty('--text-color', '#4B5563');
      document.body.style.setProperty('--btn-text-color', 'rgba(249, 250, 251, 1)');
      document.body.style.setProperty('--logo-color', 'rgba(17, 24, 39, 1)');
    }
  }

  getCurrentTheme(): boolean {
    return this.isDarkTheme;
  }

  get themeState(): string {
    return this.isDarkTheme ? 'dark' : 'light';
  }
}
