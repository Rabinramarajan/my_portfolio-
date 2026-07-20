import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { MOTION, gsap, prefersReducedMotion } from './gsap.core';

/**
 * Reveals a set of elements in a staggered cascade. Replaces the former
 * `@staggerList` trigger — apply it to the container, not the children:
 *
 * `<ul appStagger> @for (…) { <li>…</li> } </ul>`
 *
 * By default the host's direct children are animated. When the items are nested
 * (e.g. projected through a component) pass a selector to target them instead:
 *
 * `<app-timeline appStagger="app-timeline-item"> … </app-timeline>`
 *
 * The initial set animates once the container scrolls into view. Items added
 * later (filtered lists, search results, tab switches) animate immediately as
 * they enter the DOM, so dynamic content keeps its motion.
 */
@Directive({ selector: '[appStagger]' })
export class Stagger {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Optional CSS selector for nested items; empty = direct children. */
  readonly select = input('', { alias: 'appStagger' });

  /** Every tween this directive creates, so all can be killed on destroy. */
  private readonly tweens = new Set<gsap.core.Tween>();

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      if (prefersReducedMotion()) return;

      const selector = this.select();
      const initial = this.collect(el, selector);
      if (initial.length) {
        this.tweens.add(
          gsap.from(initial, {
            opacity: 0,
            y: MOTION.rise,
            duration: MOTION.duration.slow,
            ease: MOTION.ease.decelerate,
            stagger: MOTION.stagger,
            scrollTrigger: { trigger: el, start: MOTION.triggerStart, once: true },
          }),
        );
      }

      // Animate items added after the initial render (e.g. filter/search).
      const observer = new MutationObserver((records) => {
        const added: HTMLElement[] = [];
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            if (!selector || node.matches(selector)) {
              added.push(node);
            } else {
              added.push(...Array.from(node.querySelectorAll<HTMLElement>(selector)));
            }
          });
        }
        if (added.length) {
          const tween = gsap.from(added, {
            opacity: 0,
            y: MOTION.rise,
            duration: MOTION.duration.slow,
            ease: MOTION.ease.decelerate,
            stagger: MOTION.stagger,
            // Drop finished tweens so the set doesn't grow across many filter passes.
            onComplete: () => this.tweens.delete(tween),
          });
          this.tweens.add(tween);
        }
      });
      observer.observe(el, { childList: true, subtree: !!selector });

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        for (const tween of this.tweens) {
          tween.scrollTrigger?.kill();
          tween.kill();
        }
        this.tweens.clear();
      });
    });
  }

  /** Resolve the elements to stagger: nested by selector, else direct children. */
  private collect(el: HTMLElement, selector: string): HTMLElement[] {
    return selector
      ? Array.from(el.querySelectorAll<HTMLElement>(selector))
      : (Array.from(el.children) as HTMLElement[]);
  }
}
