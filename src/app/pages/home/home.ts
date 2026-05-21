import { Component, inject, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { DOCUMENT, SlicePipe } from '@angular/common';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import {
  AuroraBackgroundDirective,
  MouseFollowGlowDirective,
  ScrollTriggerDirective,
  MagneticButtonDirective,
  GridBackgroundDirective,
  FloatingTextDirective,
} from '../../shared/directives';
import {
  ParticleNetworkComponent,
  ScrollProgressComponent,
  CustomCursorComponent,
} from '../../shared/components';

@Component({
  selector: 'app-home',
  imports: [
    // Directives
    AuroraBackgroundDirective,
    MouseFollowGlowDirective,
    ScrollTriggerDirective,
    MagneticButtonDirective,
    GridBackgroundDirective,
    FloatingTextDirective,
    // Components
    ParticleNetworkComponent,
    ScrollProgressComponent,
    CustomCursorComponent,
    SlicePipe,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit {
  protected readonly pds = inject(PortfolioDataService);
  private readonly doc = inject(DOCUMENT);

  ngAfterViewInit() {
    // Defer external script loading until after view is rendered
    // This prevents blocking the main thread and improves FCP/LCP metrics
    if (!this.doc.getElementById('elfsight-script')) {
      const s = this.doc.createElement('script');
      s.id = 'elfsight-script';
      s.src = 'https://static.elfsight.com/platform/platform.js';
      s.async = true;
      s.defer = true;
      // Use requestIdleCallback for non-critical script loading
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.doc.body.appendChild(s);
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          this.doc.body.appendChild(s);
        }, 2000);
      }
    }
  }
}





