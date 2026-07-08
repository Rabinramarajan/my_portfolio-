import { Injectable, inject } from '@angular/core';
import { GsapService } from '../../../shared/services/gsap.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HomeAnimationsService {
  private readonly gsapService = inject(GsapService);

  async initialize(): Promise<void> {
    try {
      await this.gsapService.init();
      if (!this.gsapService.isLoaded) return;

      this.setupScrollTriggers();
    } catch (e) {
      if (!environment.production) {
        console.warn('GSAP initialization failed, animations will degrade gracefully', e);
      }
    }
  }

  private setupScrollTriggers(): void {
    if (!this.gsapService.gsap) return;

    this.gsapService.gsap.from('.timeline-line', {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    this.gsapService.staggerIn('.skill-card', 0.06);
    this.gsapService.staggerIn('.proj-card-enhanced', 0.12);
    this.gsapService.staggerIn('.testi-card', 0.1);
  }

  triggerDeferredComponentAnimations(selector: string, delay: number = 0.06): void {
    this.gsapService.staggerIn(selector, delay);
  }

  cleanup(): void {
    this.gsapService.killAll();
  }
}
