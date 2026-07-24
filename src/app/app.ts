import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { SupabaseService, ThemeService } from './core/services';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  supabase = inject(SupabaseService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      this.loadProjects();
    }
    // Instantiate eagerly so the theme effect applies before first paint.
    inject(ThemeService);

    // Vercel Web Analytics + Speed Insights — browser-only (skipped during
    // prerender) and enabled solely in production builds.
    if (environment.production && this.isBrowser) {
      injectVercelAnalytics({ mode: 'production' });
      injectSpeedInsights();
    }
  }

  async loadProjects() {
    const { data, error } = await this.supabase.from('projects').select('*');

    if (error) {
      console.error(error);
      return;
    }

    console.log(data);
  }
}
