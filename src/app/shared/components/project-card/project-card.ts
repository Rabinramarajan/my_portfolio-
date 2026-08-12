import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { DeviceCapability } from '../../../core/services/device-capability';
import { CursorTarget } from '../../directives/cursor-target';
import { CursorInteractive } from '../../directives/cursor-interactive';
import { MediaImage } from '../media-image/media-image';
import { Reveal } from '../../directives/reveal';
import type { PortfolioProject } from '../../../core/models/portfolio.models';

/** Max pitch/yaw of the card toward the pointer, in degrees. Kept deliberately
 *  small so the effect reads as dimensional paper, not a dancing interface. */
const TILT_MAX_DEG = 2;
/** The card rises this many pixels on hover; the tilt keeps the same lift. */
const CARD_LIFT_PX = 6;

/**
 * Project card used on the home reel and the work index.
 *
 * The whole card is one anchor — hover metadata and 3D tilt are decoration on
 * top of a single, obvious link target rather than a nest of clickable regions.
 */
@Component({
  selector: 'app-project-card',
  imports: [RouterLink, MediaImage, Reveal, CursorTarget, CursorInteractive],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<PortfolioProject>();
  /** Display index shown in the corner, e.g. "01". */
  readonly index = input<string>();
  readonly priority = input(false);
  readonly layout = input<'tall' | 'wide'>('tall');
  /**
   * Level for the card's title. Defaults to 3, which is right under a section
   * heading; the /work index passes 2 because there the page heading is the
   * `h1` directly above the grid.
   */
  readonly headingLevel = input<2 | 3>(3);

  private readonly device = inject(DeviceCapability);
  private readonly destroyRef = inject(DestroyRef);
  private readonly link = viewChild<ElementRef<HTMLElement>>('link');

  constructor() {
    // Pointer-driven tilt is for fine pointers only — touch gets the plain
    // tap-through — and never for reduced-motion visitors. A `transition` on
    // `.pc__link` eases the inline transforms, so the reset is already smooth.
    afterNextRender(() => {
      const link = this.link()?.nativeElement;
      if (!link) return;
      if (!this.device.animationsEnabled() || !this.device.hasPrecisePointer()) return;
      this.destroyRef.onDestroy(this.attachTilt(link));
    });
  }

  /** Subtle 3D follow: the card pitches and yaws up to ±2° with the pointer,
   *  compositor-only (single transform, rAF-throttled), and eases back flat
   *  when the pointer leaves. */
  private attachTilt(link: HTMLElement): () => void {
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let hovering = false;

    const apply = () => {
      frame = 0;
      if (!hovering) return;
      const rect = link.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = (pointerX - rect.left) / rect.width - 0.5;
      const ny = (pointerY - rect.top) / rect.height - 0.5;
      const rotateX = (-ny * TILT_MAX_DEG * 2).toFixed(2);
      const rotateY = (nx * TILT_MAX_DEG * 2).toFixed(2);
      link.style.transform =
        `translateY(-${CARD_LIFT_PX}px) perspective(900px) ` +
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onEnter = () => {
      hovering = true;
    };

    const onLeave = () => {
      hovering = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      link.style.transform = '';
    };

    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('pointermove', onMove);
    link.addEventListener('pointerleave', onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      link.removeEventListener('pointerenter', onEnter);
      link.removeEventListener('pointermove', onMove);
      link.removeEventListener('pointerleave', onLeave);
      link.style.transform = '';
    };
  }
}
