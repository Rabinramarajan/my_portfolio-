import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PortfolioStore } from '../../../../../core/services/portfolio-store';

/**
 * Technology ticker under the hero ï¿½?" the "animated skill language" of the
 * page. Purely CSS: two bands translate via compositor-only `translate3d`
 * keyframes in opposite directions, pause on hover, and stop outright for
 * reduced motion. No per-frame JavaScript, no signal writes.
 */
@Component({
  selector: 'app-hero-ticker',
  standalone: true,
  template: `
    <aside class="hero-ticker" aria-hidden="true">
      <div class="hero-ticker__row hero-ticker__row--a">
        <div class="hero-ticker__band">
          @for (item of items(); track item) {
            <span class="hero-ticker__item">{{ item }}<span class="hero-ticker__sep">âœ¦</span></span>
          }
          @for (item of items(); track item) {
            <span class="hero-ticker__item">{{ item }}<span class="hero-ticker__sep">âœ¦</span></span>
          }
        </div>
      </div>
      <div class="hero-ticker__row hero-ticker__row--b">
        <div class="hero-ticker__band">
          @for (item of items(); track item) {
            <span class="hero-ticker__item">{{ item }}<span class="hero-ticker__sep">âœ¦</span></span>
          }
          @for (item of items(); track item) {
            <span class="hero-ticker__item">{{ item }}<span class="hero-ticker__sep">âœ¦</span></span>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        border-block: 1px solid rgba(255, 255, 255, 0.06);
        padding-block: 0.9rem;
        background: rgb(255 255 255 / 1.5%);
      }

      .hero-ticker {
        display: grid;
        gap: 0.7rem;
      }

      .hero-ticker__row {
        overflow: hidden;
        mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
      }

      .hero-ticker__row--b {
        opacity: 0.7;
      }

      .hero-ticker__band {
        display: flex;
        align-items: center;
        width: max-content;
        will-change: transform;
        animation: hero-ticker-scroll 34s linear infinite;
      }

      .hero-ticker__row--b .hero-ticker__band {
        animation-direction: reverse;
        animation-duration: 40s;
      }

      .hero-ticker__item {
        font-family: var(--font-display);
        font-size: clamp(0.9rem, 1.4vw, 1.25rem);
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        white-space: nowrap;
        transition: color 0.4s var(--ease-out-expo);
      }

      .hero-ticker__sep {
        display: inline-block;
        margin-inline: 1.6rem;
        color: var(--color-accent);
        font-size: 0.7em;
      }

      @media (hover: hover) and (pointer: fine) {
        .hero-ticker__row:hover .hero-ticker__band {
          animation-play-state: paused;
        }

        .hero-ticker__row--a:hover .hero-ticker__item {
          color: var(--color-text);
        }
      }

      @keyframes hero-ticker-scroll {
        to {
          transform: translate3d(-50%, 0, 0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-ticker__band {
          animation: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroTicker {
  private readonly store = inject(PortfolioStore);

  protected readonly items = computed(() => this.store.hero().technologies);
}