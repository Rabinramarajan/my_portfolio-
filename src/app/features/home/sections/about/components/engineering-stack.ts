import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-engineering-stack',
  standalone: true,
  template: `
    <div class="stack">
      <span class="stack__eyebrow">MY ENGINEERING STACK</span>

      <div class="stack__flow">
        @for (tech of stack; track tech; let i = $index) {
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
      margin-block-end: var(--space-12, 3.5rem);
    }

    .stack__eyebrow {
      font-family: var(--font-mono, monospace);
      font-size: var(--text-xs, 0.75rem);
      letter-spacing: 0.15em;
      color: var(--color-text-dim, #888);
      display: block;
      margin-block-end: var(--space-5, 1.25rem);
    }

    .stack__flow {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
      align-items: center;
    }

    .stack__item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.1rem, 2vw, 1.6rem);
      font-weight: 500;
      color: var(--color-text-muted, #777);
      cursor: pointer;
      transition: color 0.3s ease, transform 0.3s ease;
      user-select: none;

      &:hover,
      &--active {
        color: var(--color-text, #fff);
        transform: translateY(-2px);

        .stack__dot {
          background: var(--color-accent, #c9f24d);
          box-shadow: 0 0 10px var(--color-accent, #c9f24d);
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
  protected readonly stack: readonly string[] = [
    'Angular',
    'TypeScript',
    'Signals',
    'Zoneless',
    'SSR',
    'RxJS',
    'Tailwind CSS',
    'Node.js',
    'PostgreSQL',
    'Playwright',
    'Figma',
  ];

  protected readonly activeTech = signal<string | null>(null);
}
