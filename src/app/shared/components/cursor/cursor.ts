import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';

import { CursorState } from '../../../core/services/cursor-state';
import { DeviceCapability } from '../../../core/services/device-capability';
import { Motion } from '../../../core/services/motion';
import { asyncTeardown } from '../../utils/async-teardown';

/**
 * The single custom-cursor renderer, mounted once at the app root.
 *
 * Position is written with GSAP quickTo outside Angular's knowledge — pointer
 * moves must never touch change detection. Appearance is signal-driven, since
 * that changes rarely.
 */
@Component({
  selector: 'app-cursor',
  templateUrl: './cursor.html',
  styleUrl: './cursor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cursor {
  private readonly state = inject(CursorState);
  private readonly device = inject(DeviceCapability);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();
  private readonly dotRef = viewChild<ElementRef<HTMLElement>>('dot');
  private readonly ringRef = viewChild<ElementRef<HTMLElement>>('ring');

  protected readonly enabled = this.device.customCursorEnabled;
  protected readonly intent = this.state.intent;
  protected readonly visible = this.state.visible;
  protected readonly pressed = this.state.pressed;
  protected readonly label = computed(() => this.state.intent().label);
  protected readonly hasLabel = computed(() => Boolean(this.label()));

  constructor() {
    afterNextRender(() => void this.track());
  }

  private async track(): Promise<void> {
    if (!this.enabled()) return;
    const gsap = await this.motion.load();
    const dot = this.dotRef()?.nativeElement;
    const ring = this.ringRef()?.nativeElement;
    if (!gsap || !dot || !ring || this.teardown.destroyed) return;

    // The ring lags slightly behind the dot — that delta is what reads as weight.
    const move = {
      dotX: gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' }),
      dotY: gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' }),
      ringX: gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' }),
      ringY: gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' }),
    };

    const onMove = (event: PointerEvent) => {
      if (!this.state.visible()) this.state.visible.set(true);
      move.dotX(event.clientX);
      move.dotY(event.clientY);
      move.ringX(event.clientX);
      move.ringY(event.clientY);
    };
    const onLeave = () => this.state.visible.set(false);
    const onDown = () => this.state.pressed.set(true);
    const onUp = () => this.state.pressed.set(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    this.teardown.register(() => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      gsap.killTweensOf([dot, ring]);
    });
  }
}
