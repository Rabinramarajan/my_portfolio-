import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DeviceCapability } from '../../core/services/device-capability';
import { Motion } from '../../core/services/motion';
import { asyncTeardown } from '../utils/async-teardown';

/**
 * Magnetic hover: the element drifts toward the pointer while it is nearby.
 *
 * Pointer events are read on the element itself with an enlarged hit area via
 * `strength`, and all movement is written through GSAP's quickTo so we stay on
 * the compositor and never read layout during the move.
 */
@Directive({ selector: '[appMagnetic]' })
export class Magnetic {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(Motion);
  private readonly device = inject(DeviceCapability);
  private readonly teardown = asyncTeardown();

  /** 0–1. How far the element follows the pointer across its own bounds. */
  readonly strength = input(0.35, { alias: 'appMagnetic' });
  /** Optional inner element that moves further than the container, for depth. */
  readonly inner = input<string>('[data-magnetic-inner]');

  constructor() {
    afterNextRender(() => void this.attach());
  }

  private async attach(): Promise<void> {
    if (!this.device.hasPrecisePointer()) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const element = this.host.nativeElement;
    const innerEl = element.querySelector<HTMLElement>(this.inner());
    const to = {
      x: gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' }),
      y: gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' }),
    };
    const innerTo = innerEl
      ? {
          x: gsap.quickTo(innerEl, 'x', { duration: 0.65, ease: 'power3.out' }),
          y: gsap.quickTo(innerEl, 'y', { duration: 0.65, ease: 'power3.out' }),
        }
      : null;

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) * this.strength();
      const dy = (event.clientY - (rect.top + rect.height / 2)) * this.strength();
      to.x(dx);
      to.y(dy);
      innerTo?.x(dx * 0.4);
      innerTo?.y(dy * 0.4);
    };

    const onLeave = () => {
      to.x(0);
      to.y(0);
      innerTo?.x(0);
      innerTo?.y(0);
    };

    element.addEventListener('pointermove', onMove, { passive: true });
    element.addEventListener('pointerleave', onLeave, { passive: true });

    this.teardown.register(() => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(element);
      if (innerEl) gsap.killTweensOf(innerEl);
    });
  }
}
