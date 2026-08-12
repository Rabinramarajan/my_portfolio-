import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
} from '@angular/core';

import { DeviceCapability } from '../../../../../core/services/device-capability';
import { Motion } from '../../../../../core/services/motion';
import { asyncTeardown } from '../../../../../shared/utils/async-teardown';

@Component({
  selector: 'app-hero-visual',
  standalone: true,
  templateUrl: './hero-visual.html',
  styleUrl: './hero-visual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroVisual {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly device = inject(DeviceCapability);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();

  constructor() {
    afterNextRender(() => void this.attachParallax());
  }

  private async attachParallax(): Promise<void> {
    if (!this.device.hasPrecisePointer()) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const root = this.host.nativeElement;
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    if (layers.length === 0) return;

    const depthOf = new Map<HTMLElement, number>();
    const to = new Map<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();
    for (const layer of layers) {
      depthOf.set(layer, Number(layer.dataset['depth'] ?? 1));
      to.set(layer, {
        x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
        y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
      });
    }

    const MAX = 16;
    const onMove = (event: PointerEvent) => {
      const dx = (event.clientX / window.innerWidth - 0.5) * 2;
      const dy = (event.clientY / window.innerHeight - 0.5) * 2;
      for (const layer of layers) {
        const depth = depthOf.get(layer) ?? 1;
        const strength = (depth * depth) / 4;
        const target = to.get(layer);
        if (!target) continue;
        target.x(Math.max(-MAX, Math.min(MAX, dx * 12 * strength)));
        target.y(Math.max(-MAX, Math.min(MAX, dy * 8 * strength)));
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    this.teardown.register(() => {
      window.removeEventListener('pointermove', onMove);
      layers.forEach((layer) => gsap.killTweensOf(layer));
    });
  }
}