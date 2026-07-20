import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { MOTION, gsap, prefersReducedMotion } from './gsap.core';

/**
 * Fade + rise the host element in once it scrolls into view.
 * Replaces the former `@fadeInUp` trigger. Above-the-fold hosts (heroes) are
 * already within the trigger window on load, so they play immediately.
 *
 * Usage: `<section appReveal>…</section>`
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      if (prefersReducedMotion()) return;

      const tween = gsap.from(el, {
        opacity: 0,
        y: MOTION.rise,
        duration: MOTION.duration.slow,
        ease: MOTION.ease.decelerate,
        scrollTrigger: { trigger: el, start: MOTION.triggerStart, once: true },
      });

      this.destroyRef.onDestroy(() => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    });
  }
}
