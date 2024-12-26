import { Component, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { FormsModule } from '@angular/forms';
import { Maintenance } from './common/templates/maintenance';
import Analytics from '@vercel/analytics';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Maintenance, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'myPortfolio';
  
  constructor(public appSetting: AppSettingsService,
    private http: HttpClient,
    private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.trackPageView();
    this.addJsonLd();
  }

  // Track a page view
  trackPageView() {
    Analytics.track('page_view', { path: window.location.pathname });
    console.log('Page view tracked');
  }

  addJsonLd() {
    const jsonLd = {
      "@context": "http://schema.org",
      "@type": "Person",
      "name": "Rabin R",
      "url": "https://rabinr.com",
      "image": "https://rabinr.com/image/png/favicon.png",
      "sameAs": [
        "https://www.linkedin.com/in/rabin-r-0a2407228",
        "https://github.com/Rabinramarajan",
        "https://x.com/BigilRabinrs?t=fpSZYa76XrrYaZbLfCXgCA&s=09"
      ],
      "jobTitle": "Front-End Developer",
      "alumniOf": "National College, Tiruchirapalli",
      "worksFor": { "@type": "Organization", "name": "ITGalax Solution Pvt Ltd" }
    };

    document.head.appendChild(
      Object.assign(document.createElement('script'), { type: 'application/ld+json', textContent: JSON.stringify(jsonLd) })
    );
  }



}
