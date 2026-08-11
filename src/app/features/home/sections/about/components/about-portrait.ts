import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MediaImage } from '../../../../../shared/components/media-image/media-image';
import type { PortfolioMedia } from '../../../../../core/models/portfolio.models';

@Component({
  selector: 'app-about-portrait',
  standalone: true,
  imports: [MediaImage],
  template: `
    <div class="about-portrait">
      <div class="about-portrait__frame">
        <!-- The sizes attribute is a promise to the browser about the rendered
             width, and 100vw was not true: the column's padding leaves the
             portrait ~90vw on a phone and 42vw above 1024px. The overstatement
             made every mobile visitor fetch the 1122px file for a 370px slot.

             No priority flag either — the portrait sits about a viewport and a
             half down, so eagerly fetching it competed with the hero. -->
        <app-media-image
          class="about-portrait__img"
          [media]="portrait()"
          sizes="(max-width: 1024px) 90vw, 42vw"
        />

        <!-- Editorial Frame Accents -->
        <div class="about-portrait__corner about-portrait__corner--tl"></div>
        <div class="about-portrait__corner about-portrait__corner--br"></div>

        <!-- Overlaid Editorial Metadata -->
        <div class="about-portrait__meta">
          <span class="about-portrait__meta-line about-portrait__name">RABIN R</span>
          <span class="about-portrait__meta-line about-portrait__role">SENIOR FRONTEND ENGINEER</span>
          <div class="about-portrait__meta-divider"></div>
          <span class="about-portrait__meta-line about-portrait__loc">CHENNAI / INDIA</span>
          <span class="about-portrait__meta-line about-portrait__status">
            <span class="about-portrait__dot"></span> AVAILABLE FOR SELECT PROJECTS
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-portrait {
      position: relative;
      width: 100%;
    }

    .about-portrait__frame {
      position: relative;
      overflow: hidden;
      aspect-ratio: 4 / 5;
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-line);

      &:hover .about-portrait__img {
        transform: scale(1.03);
        filter: brightness(1.05);
      }
    }

    .about-portrait__img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition:
        transform var(--duration-slow) var(--ease-out-expo),
        filter var(--duration-slow) ease;
    }

    .about-portrait__corner {
      position: absolute;
      width: 16px;
      height: 16px;
      pointer-events: none;
      z-index: 2;

      &--tl {
        top: 12px;
        left: 12px;
        border-top: 1.5px solid var(--color-accent);
        border-left: 1.5px solid var(--color-accent);
      }

      &--br {
        bottom: 12px;
        right: 12px;
        border-bottom: 1.5px solid var(--color-accent);
        border-right: 1.5px solid var(--color-accent);
      }
    }

    .about-portrait__meta {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: var(--space-5);
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
      font-family: var(--font-mono);
      color: rgba(255, 255, 255, 0.8);
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .about-portrait__meta-line {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .about-portrait__name {
      font-weight: 700;
      color: var(--color-text);
      font-size: 0.75rem;
    }

    .about-portrait__role {
      color: var(--color-accent);
    }

    .about-portrait__meta-divider {
      height: 1px;
      width: 24px;
      background: rgba(255, 255, 255, 0.2);
      margin-block: 0.35rem;
    }

    .about-portrait__loc {
      color: rgba(255, 255, 255, 0.6);
    }

    .about-portrait__status {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .about-portrait__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPortrait {
  readonly portrait = input.required<PortfolioMedia>();
}
