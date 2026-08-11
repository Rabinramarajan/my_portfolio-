import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PortfolioStore } from '../../../../../core/services/portfolio-store';

@Component({
  selector: 'app-engineering-stack',
  standalone: true,
  template: `
    <div class="stack">
      <span class="stack__eyebrow">{{ about().stackEyebrow }}</span>

      <div class="stack__flow">
        @for (tech of stack(); track tech; let i = $index) {
          <span
            class="stack__item"
            [class.stack__item--active]="activeTech() === tech"
            (mouseenter)="activeTech.set(tech)"
            (mouseleave)="activeTech.set(null)"
          >
            <span class="stack__dot"></span>
            <span class="stack__name">{{ tech }}</span>
          </span>
        }
      </div>
    </div>
  `,
  styles: [`
    .stack {
      margin-block-end: var(--space-12);
    }

    .stack__eyebrow {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-text-faint);
      display: block;
      margin-block-end: var(--space-5);
    }

    .stack__flow {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3) var(--space-6);
      align-items: center;
    }

    .stack__item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-display);
      font-size: clamp(1.1rem, 2vw, 1.6rem);
      font-weight: 500;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: color 0.3s ease, transform 0.3s ease;
      user-select: none;

      &:hover,
      &--active {
        color: var(--color-text);
        transform: translateY(-2px);

        .stack__dot {
          background: var(--color-accent);
          box-shadow: 0 0 10px var(--color-accent);
        }
      }
    }

    .stack__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    .stack__name {
      letter-spacing: -0.01em;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringStack {
  private readonly store = inject(PortfolioStore);
  protected readonly about = this.store.about;

  protected readonly stack = computed(() => this.about().engineeringStack);
  protected readonly activeTech = signal<string | null>(null);
}
