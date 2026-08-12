import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DeviceCapability } from '../../core/services/device-capability';
import { Motion } from '../../core/services/motion';
import { asyncTeardown } from '../utils/async-teardown';

/**
 * Magnetic hover for primary CTAs: the button drifts toward the pointer while
 * it is nearby, its label trails a beat behind and the arrow leads the label —
 * all capped at `maxPx` so the effect stays subtle on wide buttons.
 *
 * Pointer events are read on the element itself and every write goes through
 * GSAP's quickTo, so we stay on the compositor and never read layout during
 * the move. Precise pointers only, and reduced motion disables it via the
 * Motion service.
 */
@Directive({ selector: '[appMagnetic]' })
export class Magnetic {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(Motion);
  private readonly device = inject(DeviceCapability);
  private readonly teardown = asyncTeardown();

  /** 0–1. How eagerly the element follows the pointer across its own bounds. */
  readonly strength = input(0.35);
  /** Hard ceiling on the drift in px, so wide buttons cannot leap. */
  readonly maxPx = input(8);
  /** Inner label that trails the container for depth. */
  readonly trail = input<string>('[data-magnetic-trail]');
  /** Inner icon that leads the label, following the pointer faster. */
  readonly lead = input<string>('[data-magnetic-lead]');
  /** Adds `.is-magnet` while the pointer is near, so CSS can lift the glow. */
  readonly glow = input(false);

  constructor() {
    afterNextRender(() => void this.attach());
  }

  private async attach(): Promise<void> {
    if (!this.device.hasPrecisePointer() || this.strength() <= 0) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const element = this.host.nativeElement;
    const trailEl = element.querySelector<HTMLElement>(this.trail());
    const leadEl = element.querySelector<HTMLElement>(this.lead());

    const to = {
      x: gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' }),
      y: gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' }),
    };
    const trailTo = trailEl
      ? {
          x: gsap.quickTo(trailEl, 'x', { duration: 0.65, ease: 'power3.out' }),
          y: gsap.quickTo(trailEl, 'y', { duration: 0.65, ease: 'power3.out' }),
        }
      : null;
    const leadTo = leadEl
      ? {
          x: gsap.quickTo(leadEl, 'x', { duration: 0.45, ease: 'power3.out' }),
          y: gsap.quickTo(leadEl, 'y', { duration: 0.45, ease: 'power3.out' }),
        }
      : null;

    const clamp = (v: number) => Math.min(this.maxPx(), Math.max(-this.maxPx(), v));
    const setGlow = (on: boolean) => {
      if (this.glow()) element.classList.toggle('is-magnet', on);
    };

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const dx = clamp((event.clientX - (rect.left + rect.width / 2)) * this.strength());
      const dy = clamp((event.clientY - (rect.top + rect.height / 2)) * this.strength());
      to.x(dx);
      to.y(dy);
      trailTo?.x(dx * -0.18);
      trailTo?.y(dy * -0.18);
      leadTo?.x(dx * 0.15);
      leadTo?.y(dy * 0.15);
    };

    const onEnter = () => setGlow(true);
    const onLeave = () => {
      to.x(0);
      to.y(0);
      trailTo?.x(0);
      trailTo?.y(0);
      leadTo?.x(0);
      leadTo?.y(0);
      setGlow(false);
    };

    element.addEventListener('pointerenter', onEnter, { passive: true });
    element.addEventListener('pointermove', onMove, { passive: true });
    element.addEventListener('pointerleave', onLeave, { passive: true });

    this.teardown.register(() => {
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(element);
      if (trailEl) gsap.killTweensOf(trailEl);
      if (leadEl) gsap.killTweensOf(leadEl);
      element.classList.remove('is-magnet');
    });
  }
}
