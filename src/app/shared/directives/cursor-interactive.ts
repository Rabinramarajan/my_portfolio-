import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { CursorInteraction } from '../../core/services/cursor-interaction';
import { DeviceCapability } from '../../core/services/device-capability';

/**
 * Marks an element as interactive for cursor reactions: ring expansion and magnetic pull.
 * Apply to buttons, links, and cards to enhance the cursor experience.
 */
@Directive({
  selector: '[appCursorInteractive]',
  host: {
    '(pointerenter)': 'onEnter()',
    '(pointerleave)': 'onLeave()',
  },
})
export class CursorInteractive {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cursor = inject(CursorInteraction);
  private readonly device = inject(DeviceCapability);

  /** Expand ring size: 'sm' (1.2x), 'md' (1.5x), 'lg' (1.8x) */
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Enable magnetic attraction: 0–1 strength */
  readonly magnetic = input(0);

  constructor() {
    afterNextRender(() => {
      if (!this.device.hasPrecisePointer()) return;
      const element = this.host.nativeElement;
      if (this.magnetic() > 0) {
        element.setAttribute('data-magnetic-strong', '');
      }
    });
  }

  onEnter(): void {
    if (!this.device.hasPrecisePointer()) return;

    const scaleMap = { sm: 1.2, md: 1.5, lg: 1.8 };
    const scale = scaleMap[this.size()];

    this.cursor.updateScale(scale);
    if (this.magnetic() > 0) {
      this.cursor.setAttraction(this.host.nativeElement, this.magnetic());
    }
  }

  onLeave(): void {
    this.cursor.updateScale(1);
    this.cursor.setAttraction(null);
  }
}
