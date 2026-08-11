import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

import { DeviceCapability } from '../../../../../core/services/device-capability';
import { Motion } from '../../../../../core/services/motion';
import { MediaImage } from '../../../../../shared/components/media-image/media-image';
import { asyncTeardown } from '../../../../../shared/utils/async-teardown';
import type { PortfolioMedia } from '../../../../../core/models/portfolio.models';

/**
 * Editorial portrait for the hero.
 *
 * An asymmetric, oversized frame — not a profile card. Cursor movement shifts
 * the image by a few pixels on capable pointers (never on touch or reduced
 * motion), and a slow transform-only zoom answers hover. The critical content
 * (type) is decided first, so the portrait is deliberately lazy.
 */
@Component({
  selector: 'app-hero-portrait',
  standalone: true,
  imports: [MediaImage],
  template: `
    <div class="hero-portrait">
      <div class="hero-portrait__parallax">
        <div class="hero-portrait__zoom">
          <div class="hero-portrait__frame">
            <app-media-image
              class="hero-portrait__img"
              [media]="portrait()"
              sizes="(max-width: 1024px) min(80vw, 360px), clamp(300px, 30vw, 420px)"
            />
            <div class="hero-portrait__stamp" aria-hidden="true">
              <span class="hero-portrait__stamp-name">RABIN R</span>
              <span class="hero-portrait__stamp-line"></span>
              <span class="hero-portrait__stamp-loc">CHENNAI · 13.08°N 80.27°E</span>
            </div>
            <span class="hero-portrait__corner" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .hero-portrait {
        position: relative;
        width: min(100%, 420px);
      }

      .hero-portrait__parallax {
        will-change: transform;
      }

      @media (min-width: 1024px) {
        .hero-portrait {
          width: clamp(300px, 30vw, 420px);
        }
      }

      .hero-portrait__zoom {
        transition: transform 0.9s var(--ease-out-expo);
      }

      @media (hover: hover) and (pointer: fine) {
        .hero-portrait__zoom:hover {
          transform: scale(1.03);
        }
      }

      .hero-portrait__frame {
        position: relative;
        aspect-ratio: 4 / 5;
        background: var(--color-bg-elevated);
      }

      /* Offset engineering frame sitting proud of the image — read separately
         from the hero-type, so it is drawn as a border box, never a photo
         effect. */
      .hero-portrait__frame::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        transform: translate(14px, 14px);
        border: 1px solid rgb(201 242 77 / 28%);
      }

      .hero-portrait__img {
        position: relative;
        display: block;
        transform: scale(1.02);
        transform-origin: 50% 60%;
      }

      .hero-portrait__stamp {
        position: absolute;
        z-index: 2;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
        padding: 1rem 1.1rem;
        font-family: var(--font-mono);
        font-size: 0.62rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgb(236 236 233 / 85%);
        background: linear-gradient(to top, rgb(0 0 0 / 72%), transparent);
      }

      .hero-portrait__stamp-name {
        font-weight: 600;
        color: var(--color-accent);
      }

      .hero-portrait__stamp-line {
        flex: 1;
        height: 1px;
        background: rgb(255 255 255 / 24%);
      }

      .hero-portrait__stamp-loc {
        color: rgb(236 236 233 / 60%);
      }

      .hero-portrait__corner {
        position: absolute;
        z-index: 2;
        top: -1px;
        left: -1px;
        width: 34px;
        height: 34px;
        border-top: 2px solid var(--color-accent);
        border-left: 2px solid var(--color-accent);
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-portrait__zoom {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroPortrait {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly device = inject(DeviceCapability);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();

  readonly portrait = input.required<PortfolioMedia>();

  constructor() {
    afterNextRender(() => void this.attachParallax());
  }

  /** Micro-parallax: the image leans a few pixels toward the pointer. */
  private async attachParallax(): Promise<void> {
    if (!this.device.hasPrecisePointer()) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const target = this.host.nativeElement.querySelector<HTMLElement>(
      '.hero-portrait__parallax',
    );
    if (!target) return;

    const to = {
      x: gsap.quickTo(target, 'x', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(target, 'y', { duration: 0.8, ease: 'power3.out' }),
    };

    const onMove = (event: PointerEvent) => {
      const dx = (event.clientX / window.innerWidth - 0.5) * 2;
      const dy = (event.clientY / window.innerHeight - 0.5) * 2;
      // Cap at ~8px so the depth reads, never distracts.
      to.x(Math.max(-8, Math.min(8, dx * 10)));
      to.y(Math.max(-8, Math.min(8, dy * 6)));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    this.teardown.register(() => {
      window.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(target);
    });
  }
}