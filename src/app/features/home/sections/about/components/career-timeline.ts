import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PortfolioStore } from '../../../../../core/services/portfolio-store';

@Component({
  selector: 'app-career-timeline',
  standalone: true,
  template: `
    <div class="timeline">
      <span class="timeline__eyebrow">{{ about().milestonesEyebrow }}</span>

      <div class="timeline__track">
        @for (m of milestones(); track m.year) {
          <div class="timeline__item">
            <div class="timeline__marker">
              <div class="timeline__dot"></div>
              <div class="timeline__line"></div>
            </div>
            <div class="timeline__content">
              <span class="timeline__year">{{ m.year }}</span>
              <h4 class="timeline__role">{{ m.role }}</h4>
              <p class="timeline__detail">{{ m.detail }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline {
      margin-block-end: var(--space-12);
    }

    .timeline__eyebrow {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: 0.15em;
      color: var(--color-text-faint);
      display: block;
      margin-block-end: var(--space-6);
    }

    .timeline__track {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: var(--space-6);

      @media (min-width: 640px) {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-4);
      }
    }

    .timeline__item {
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .timeline__marker {
      display: flex;
      align-items: center;
      margin-block-end: var(--space-3);
    }

    .timeline__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-accent);
      box-shadow: 0 0 10px var(--color-accent-glow);
      flex-shrink: 0;
    }

    .timeline__line {
      height: 1px;
      background: linear-gradient(to right, var(--color-accent), var(--color-line-strong));
      flex-grow: 1;

      @media (max-width: 639px) {
        display: none;
      }
    }

    .timeline__year {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-accent);
      letter-spacing: 0.1em;
      display: block;
      margin-block-end: var(--space-1);
    }

    .timeline__role {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--color-text);
      margin: 0 0 0.25rem 0;
    }

    .timeline__detail {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: 1.5;
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerTimeline {
  private readonly store = inject(PortfolioStore);
  protected readonly about = this.store.about;
  protected readonly milestones = computed(() => this.about().careerMilestones);
}
