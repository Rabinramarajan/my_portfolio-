import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { Motion } from '../../core/services/motion';
import { asyncTeardown } from '../utils/async-teardown';

export type RevealVariant = 'fade' | 'rise' | 'mask' | 'lines' | 'stagger';

/**
 * Scroll-entrance animation.
 *
 * The element is authored in its *final* state in CSS; this directive sets the
 * "from" state only once GSAP has loaded in the browser. That ordering matters:
 * SSR markup and reduced-motion users get fully visible content with no chance
 * of a flash of hidden text, which is the usual failure mode of reveal effects.
 */
@Directive({
  selector: '[appReveal]',
  host: { '[attr.data-reveal]': 'variant()' },
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(Motion);
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
   * Viewport position that triggers the reveal. Deliberately just below the
   * fold: an element should be finishing its entrance as it arrives, not
   * starting one once the reader is already looking at empty space.
   */
  readonly start = input('top 96%');

  constructor() {
    afterNextRender(() => void this.observe());
  }

  private observe(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          void this.animate();
        }
      },
      { rootMargin: '1200px' }
    );
    
    observer.observe(this.host.nativeElement);
    this.teardown.register(() => observer.disconnect());
  }

  private async animate(): Promise<void> {
    const startMs = performance.now();
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return this.release();

    const element = this.host.nativeElement;
    
    // If GSAP loaded late (e.g. slow network) and the element is already painted in the viewport,
    // skip the entrance animation. Otherwise it will flash hidden and ruin LCP.
    if (performance.now() - startMs > 250) {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        return this.release();
      }
    }
    const targets =
      this.variant() === 'stagger' || this.variant() === 'lines'
        ? (Array.from(element.querySelectorAll(this.items())) as HTMLElement[])
        : [element];
    if (targets.length === 0) return this.release();

    const from = FROM[this.variant()];
    const tween = gsap.fromTo(targets, from, {
      // Only the properties this variant actually animates. Setting them all
      // unconditionally left every revealed element with a `clip-path` of its
      // own border box, which silently clipped any child designed to overflow —
      // a badge sitting proud of its card, for instance.
      ...TO[this.variant()],
      // Hand the element back to its stylesheet once revealed: no leftover
      // inline opacity, transform or clip-path to interfere with hover states.
      clearProps: 'all',
      duration: 0.55,
      delay: this.delay(),
      // `amount` caps the *total* sequence rather than paying `each` per item:
      // a nine-card grid used to take 0.72s to even start its last card, which
      // read as a section that simply had not loaded.
      stagger: targets.length > 1 ? { each: 0.05, amount: 0.18 } : 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: this.start(),
        once: true,
        // Snap to the finished state when scrolling faster than ~800px/s: a
        // reader flicking past should never overtake the animation and meet a
        // blank section. The default (`true`) only kicks in around 2500px/s.
        fastScrollEnd: 800,
      },
    });

    // `fromTo` renders its "from" state the moment the tween is built, even
    // with a ScrollTrigger holding playback — so by now the element carries its
    // own hidden state inline and no longer needs the global pre-hide. Handing
    // it back here rather than in `onStart` matters for delayed reveals, where
    // `onStart` does not fire until the delay has elapsed.
    this.release();

    this.teardown.register(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }

  /** Opts this element out of the `data-motion` pre-hide in `styles.scss`. */
  private release(): void {
    this.host.nativeElement.setAttribute('data-revealed', '');
  }
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  fade: { opacity: 0 },
  rise: { opacity: 0, y: 40 },
  mask: { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' },
  lines: { opacity: 0, y: '110%' },
  stagger: { opacity: 0, y: 28 },
};

/** Resting state per variant — the exact inverse of `FROM`, nothing more. */
const TO: Record<RevealVariant, gsap.TweenVars> = {
  fade: { opacity: 1 },
  rise: { opacity: 1, y: 0 },
  mask: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' },
  lines: { opacity: 1, y: '0%' },
  stagger: { opacity: 1, y: 0 },
};
