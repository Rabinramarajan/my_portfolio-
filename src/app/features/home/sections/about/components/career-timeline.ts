import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Milestone {
  year: string;
  role: string;
  detail: string;
}

@Component({
  selector: 'app-career-timeline',
  standalone: true,
  template: `
    <div class="timeline">
      <span class="timeline__eyebrow">CAREER MILESTONES</span>

      <div class="timeline__track">
        @for (m of milestones; track m.year) {
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
      margin-block-end: var(--space-12, 3.5rem);
    }

    .timeline__eyebrow {
      font-family: var(--font-mono, monospace);
      font-size: var(--text-xs, 0.75rem);
      letter-spacing: 0.15em;
      color: var(--color-text-dim, #888);
      display: block;
      margin-block-end: var(--space-6, 1.5rem);
    }

    .timeline__track {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: var(--space-6, 1.5rem);

      @media (min-width: 640px) {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-4, 1rem);
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
      margin-block-end: var(--space-3, 0.75rem);
    }

    .timeline__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-accent, #c9f24d);
      box-shadow: 0 0 10px rgba(201, 242, 77, 0.5);
      flex-shrink: 0;
    }

    .timeline__line {
      height: 1px;
      background: linear-gradient(to right, var(--color-accent, #c9f24d), rgba(255, 255, 255, 0.1));
      flex-grow: 1;

      @media (max-width: 639px) {
        display: none;
      }
    }

    .timeline__year {
      font-family: var(--font-mono, monospace);
      font-size: var(--text-xs, 0.75rem);
      color: var(--color-accent, #c9f24d);
      letter-spacing: 0.1em;
      display: block;
      margin-block-end: var(--space-1, 0.25rem);
    }

    .timeline__role {
      font-family: var(--font-display, sans-serif);
      font-size: var(--text-base, 1rem);
      font-weight: 500;
      color: var(--color-text, #fff);
      margin: 0 0 0.25rem 0;
    }

    .timeline__detail {
      font-family: var(--font-body, sans-serif);
      font-size: var(--text-xs, 0.75rem);
      color: var(--color-text-muted, #aaa);
      line-height: 1.5;
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerTimeline {
  protected readonly milestones: readonly Milestone[] = [
    {
      year: '2021',
      role: 'B.Sc. IT Graduate',
      detail: 'Core computer science & web technology foundations.',
    },
    {
      year: '2023',
      role: 'Frontend Developer',
      detail: 'PRIMS Pension Portal & VNPF Ionic cross-platform mobile apps.',
    },
    {
      year: '2024',
      role: 'Senior Angular Engineer',
      detail: 'Fiji Government Immigration Platforms serving 10,000+ users.',
    },
    {
      year: '2026',
      role: 'AI & Frontend Consultant',
      detail: 'Applied AI/ML (IIT Patna) & Senior Angular Architecture Consultant.',
    },
  ];
}
