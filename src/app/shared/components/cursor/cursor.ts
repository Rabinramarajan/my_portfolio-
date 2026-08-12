import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { CursorInteraction } from '../../../core/services/cursor-interaction';
import { CursorState } from '../../../core/services/cursor-state';
import { DeviceCapability } from '../../../core/services/device-capability';
import { asyncTeardown } from '../../utils/async-teardown';

/**
 * Custom cursor that follows the mouse on precise pointers only.
 *
 * The dot tracks the pointer instantly; the ring trails a beat behind and
 * expands toward interactive targets. Both are positioned with
 * compositor-only transforms and consume the shared `CursorState` /
 * `CursorInteraction` services — so every `appCursorTarget` and
 * `appCursorInteractive` on the site drives them, the hero's CTAs included.
 *
 * The host renders nothing unless `DeviceCapability` has stamped
 * `data-cursor="custom"` (fine pointer + motion enabled), so touch devices
 * and `prefers-reduced-motion` visitors keep the native cursor.
 */
@Component({
  selector: 'app-cursor',
  templateUrl: './cursor.html',
  styleUrl: './cursor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.cursor--enabled]': 'enabled()',
  },
})
export class Cursor {
  private readonly teardown = asyncTeardown();
  private readonly containerRef = viewChild<ElementRef>('container');
  private readonly state = inject(CursorState);
  private readonly interaction = inject(CursorInteraction);
  private readonly device = inject(DeviceCapability);

  protected readonly enabled = computed(() => this.device.customCursorEnabled());
  protected readonly mode = computed(() => this.state.intent().mode);
  protected readonly label = computed(() => this.state.intent().label);
  protected readonly scale = computed(() => this.interaction.state().scale);
  protected readonly magnetX = computed(() => `${this.interaction.state().magnetX}px`);
  protected readonly magnetY = computed(() => `${this.interaction.state().magnetY}px`);

  constructor() {
    afterNextRender(() => void this.init());
  }

  private init(): void {
    const container = (this.containerRef() as ElementRef<HTMLElement>)?.nativeElement;
    if (!container || this.teardown.destroyed) return;

    const onMove = (event: MouseEvent) => {
      container.style.setProperty('--cursor-x', `${event.clientX}px`);
      container.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    document.addEventListener('mousemove', onMove, { passive: true });

    this.teardown.register(() => {
      document.removeEventListener('mousemove', onMove);
    });
  }
}