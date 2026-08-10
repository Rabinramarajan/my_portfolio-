import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { Motion } from '../../core/services/motion';
import { asyncTeardown } from '../utils/async-teardown';

/**
 * Scroll parallax driven entirely by ScrollTrigger's scrub, so the browser owns
 * the timing and we never run a scroll listener of our own.
 */
@Directive({ selector: '[appParallax]' })
export class Parallax {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();

  /** Pixels of travel across the full scroll of the trigger. Negative moves up. */
  readonly distance = input(-90, { alias: 'appParallax' });
  /** Optional scale applied alongside the translation, for image containers. */
  readonly scale = input(1);

  constructor() {
    afterNextRender(() => void this.attach());
  }

  private async attach(): Promise<void> {
    // A zero distance is a legitimate "off" switch from a bound expression;
    // bail before creating a ScrollTrigger that would do nothing.
    if (this.distance() === 0) return;

    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const element = this.host.nativeElement;
    const tween = gsap.fromTo(
      element,
      { y: -this.distance() / 2, scale: this.scale() },
      {
        y: this.distance() / 2,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: element.parentElement ?? element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );

    this.teardown.register(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }
}
