import {
  Component,
  inject,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
  afterNextRender,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { AnimationService } from '../../../../shared/services/animation.service';

@Component({
  selector: 'app-linkedin-section',
  imports: [],
  templateUrl: './linkedin-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedInSection implements OnDestroy {
  protected readonly pds = inject(PortfolioDataService);
  private readonly doc = inject(DOCUMENT);
  private readonly animation = inject(AnimationService);
  protected readonly widgetLoaded = signal(false);
  private observer: MutationObserver | null = null;
  private intersectionCleanup: (() => void) | null = null;

  constructor() {
    afterNextRender(() => this.setupLazyLoad());
  }

  private setupLazyLoad(): void {
    const section = this.doc.getElementById('linkedin');
    if (!section) return;

    this.intersectionCleanup = this.animation.observeIntersection(
      section,
      (visible) => {
        if (visible) {
          this.loadElfsight();
          this.intersectionCleanup?.();
          this.intersectionCleanup = null;
        }
      },
      { threshold: 0.1 }
    );
  }

  private loadElfsight(): void {
    const widgetId = 'elfsight-app-def48d51-c1c6-4d45-b385-c6fcc8a31a71';
    const container = this.doc.querySelector('.' + widgetId);
    if (!container) return;

    const markLoaded = () => this.widgetLoaded.set(true);

    if (container.children.length > 0) {
      markLoaded();
      return;
    }

    this.observer = new MutationObserver(() => {
      if (container.children.length > 0) {
        markLoaded();
        this.observer?.disconnect();
        this.observer = null;
      }
    });
    this.observer.observe(container, { childList: true, subtree: true });

    if (!this.doc.getElementById('elfsight-script')) {
      const s = this.doc.createElement('script');
      s.id = 'elfsight-script';
      s.src = 'https://static.elfsight.com/platform/platform.js';
      s.async = true;
      s.defer = true;
      this.doc.body.appendChild(s);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.intersectionCleanup?.();
  }
}
