import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { DeviceCapability } from '../../../core/services/device-capability';
import { Motion } from '../../../core/services/motion';
import { asyncTeardown } from '../../utils/async-teardown';

/**
 * Counts up to `value` when scrolled into view.
 *
 * The final value is what renders on the server and under reduced motion — the
 * animation is an enhancement layered on a correct static number, never the
 * thing that produces it.
 */
@Component({
  selector: 'app-animated-counter',
  templateUrl: './animated-counter.html',
  styleUrl: './animated-counter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedCounter {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(Motion);
  private readonly device = inject(DeviceCapability);
  private readonly teardown = asyncTeardown();

  readonly value = input.required<number>();
  readonly suffix = input('');
  readonly label = input<string>();

  private readonly current = signal<number | null>(null);
  protected readonly display = computed(() => this.current() ?? this.value());

  constructor() {
    afterNextRender(() => void this.animate());
  }

  private async animate(): Promise<void> {
    if (!this.device.animationsEnabled()) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const counter = { n: 0 };
    this.current.set(0);

    const tween = gsap.to(counter, {
      n: this.value(),
      duration: 1.8,
      ease: 'expo.out',
      onUpdate: () => this.current.set(Math.round(counter.n)),
      onComplete: () => this.current.set(this.value()),
      scrollTrigger: { trigger: this.host.nativeElement, start: 'top 90%', once: true },
    });

    this.teardown.register(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }
}
