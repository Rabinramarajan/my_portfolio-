import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DeviceCapability } from '../../core/services/device-capability';
import { EASE_CSS } from '../../core/services/motion-tokens';
import { asyncTeardown } from '../utils/async-teardown';

export type RevealVariant = 'fade' | 'rise' | 'mask' | 'lines' | 'stagger';

/**
 * Scroll-entrance animation.
 *
 * The element is authored in its *final* state in CSS; this directive applies
 * the "from" state only once the browser is running and the element is about
 * to enter the viewport. That ordering matters: SSR markup and reduced-motion
 * users get fully visible content with no chance of a flash of hidden text,
 * which is the usual failure mode of reveal effects.
 *
 * The reveal is driven entirely by `IntersectionObserver` — no scroll event
 * listeners — and plays once through the Web Animations API before handing the
 * element back to its stylesheet, so it never fights hover states or repeated
 * scroll passes.
 */
@Directive({
  selector: '[appReveal]',
  host: { '[attr.data-reveal]': 'variant()' },
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly device = inject(DeviceCapability);
  private readonly teardown = asyncTeardown();

  readonly variant = input<RevealVariant>('rise', { alias: 'appReveal' });
  /**
   * Seconds of delay before the element animates in.
   *
   * Every reveal owns its own trigger, so a delay only reads as *sequencing*
   * between elements that come into view together — a side-by-side pair, or a
   * hero whose parts all fire on load. Giving stacked, separately-triggered
   * blocks the same delay buys no sequence at all, just a uniformly later
   * entrance, so leave it at zero there.
   */
  readonly delay = input(0);
  /** Selector for children animated in sequence (used by `stagger` and `lines`). */
  readonly items = input<string>('[data-reveal-item]');
  /**
   * Viewport position that triggers the reveal, in `top N%` notation. Each
   * child holds its "from" state while it waits for its turn in a stagger.
   */
  readonly start = input('top 96%');

  constructor() {
    afterNextRender(() => void this.setup());
  }

  private setup(): void {
    const element = this.host.nativeElement;
    if (!this.device.animationsEnabled()) {
      this.release();
      return;
    }

    const rect = element.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

    // Scroll restoration can land mid-page. Never animate content the visitor
    // is already reading — show it and move on.
    if (inViewport && window.scrollY > 40) {
      this.release();
      return;
    }

    // Above the fold on load: play the entrance immediately rather than
    // waiting for a scroll trigger that will already have passed.
    if (inViewport) {
      this.animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          this.animate();
        }
      },
      { rootMargin: this.rootMargin() },
    );
    observer.observe(element);
    this.teardown.register(() => observer.disconnect());
  }

  private animate(): void {
    const element = this.host.nativeElement;
    const staggered = this.variant() === 'stagger' || this.variant() === 'lines';
    const targets = staggered
      ? (Array.from(element.querySelectorAll(this.items())) as HTMLElement[])
      : [element];
    if (targets.length === 0) return this.release();

    const keyframes = KEYFRAMES[this.variant() === 'fade' ? 'fade' : 'premium'];
    const baseDelay = this.delay() * 1000;

    for (const [index, target] of targets.entries()) {
      const animation = target.animate(keyframes, {
        duration: DURATION_MS,
        // Children enter at 100ms intervals, holding their "from" state while
        // they wait (the `backwards` fill) instead of flashing visible early.
        delay: baseDelay + index * STAGGER_MS,
        easing: EASING,
        fill: 'backwards',
      });
      this.teardown.register(() => animation.cancel());
    }

    this.release();
  }

  /** Reveal trigger line → IntersectionObserver root margin. */
  private rootMargin(): string {
    const match = /^top\s+(\d+(?:\.\d+)?)%$/.exec(this.start());
    if (!match) return '0px 0px 4% 0px';
    return `0px 0px ${100 - Number(match[1])}% 0px`;
  }

  /** Hands the element back to its stylesheet once revealed. */
  private release(): void {
    this.host.nativeElement.setAttribute('data-revealed', '');
  }
}

const DURATION_MS = 700;
const STAGGER_MS = 100;
const BLUR_PX = 6;
const RISE_PX = 30;
const EASING = EASE_CSS.expo;

/** A soft rise out of a blur — the signature entrance across every section. */
const PREMIUM: [Keyframe, Keyframe] = [
  { opacity: 0, transform: `translateY(${RISE_PX}px)`, filter: `blur(${BLUR_PX}px)` },
  { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
];

/** Eyebrows and micro-labels settle in place rather than climbing. */
const FADE: [Keyframe, Keyframe] = [
  { opacity: 0, filter: `blur(${BLUR_PX}px)` },
  { opacity: 1, filter: 'blur(0px)' },
];

const KEYFRAMES: Record<'fade' | 'premium', [Keyframe, Keyframe]> = {
  fade: FADE,
  premium: PREMIUM,
};
