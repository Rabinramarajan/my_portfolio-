import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface Principle {
  id: string;
  title: string;
  statement: string;
}

@Component({
  selector: 'app-engineering-principles',
  standalone: true,
  template: `
    <section class="principles">
      <div class="principles__header">
        <span class="principles__eyebrow">HOW I THINK</span>
        <h3 class="principles__statement">
          "Good frontend engineering is not just about making interfaces work. It's about making complexity feel simple."
        </h3>
      </div>

      <div class="principles__body">
        <!-- Editorial List (Left) -->
        <ul class="principles__list">
          @for (p of principles; track p.id; let idx = $index) {
            <!-- Pointer users select by hovering; keyboard users need the same
                 control to be reachable and operable. A real <button> inside
                 the <li> gets focus, Enter and Space for free — putting
                 role="button" on the <li> itself would instead make it an
                 invalid child of the list. -->
            <li class="principles__row">
              <button
                type="button"
                class="principles__item"
                [class.principles__item--active]="activeIdx() === idx"
                [attr.aria-pressed]="activeIdx() === idx"
                (mouseenter)="activeIdx.set(idx)"
                (focus)="activeIdx.set(idx)"
                (click)="activeIdx.set(idx)"
              >
                <span class="principles__num">{{ p.id }}</span>
                <span class="principles__title">{{ p.title }}</span>
                <span class="principles__arrow" aria-hidden="true">→</span>
              </button>
            </li>
          }
        </ul>

        <!-- Single Dynamic Supporting Area (Right) -->
        <div class="principles__detail" aria-live="polite">
          <div class="principles__detail-inner">
            <span class="principles__detail-num">{{ activePrinciple().id }}</span>
            <h4 class="principles__detail-title">{{ activePrinciple().title }}</h4>
            <p class="principles__detail-text">
              {{ activePrinciple().statement }}
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .principles {
      margin-block: var(--space-12, 4rem);
      padding-block: var(--space-8, 2.5rem);
      border-block: 1px solid rgba(255, 255, 255, 0.08);
    }

    .principles__eyebrow {
      font-family: var(--font-mono, monospace);
      font-size: var(--text-xs, 0.75rem);
      letter-spacing: 0.15em;
      color: var(--color-accent, #c9f24d);
      display: block;
      margin-block-end: var(--space-3, 0.75rem);
    }

    .principles__statement {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.5rem, 3vw, 2.4rem);
      font-weight: 400;
      line-height: 1.25;
      color: var(--color-text, #fff);
      max-width: 32ch;
      margin-block-end: var(--space-8, 2.5rem);
    }

    .principles__body {
      display: grid;
      gap: var(--space-8, 2.5rem);

      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-10, 3.5rem);
        align-items: center;
      }
    }

    .principles__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 0.5rem);
    }

    .principles__item {
      /* Strips the button chrome so the control looks exactly as the list item
         did, while keeping the semantics a keyboard user needs. */
      appearance: none;
      width: 100%;
      background: none;
      border: 0;
      color: inherit;
      font: inherit;
      text-align: left;

      display: flex;
      align-items: center;
      gap: var(--space-4, 1rem);
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.3s ease, border-color 0.3s ease;

      /* The item is keyboard-operable, so focus has to be visible. */
      &:focus-visible {
        outline: 2px solid var(--color-accent, #c9f24d);
        outline-offset: -2px;
      }

      &:hover,
      &--active {
        background: rgba(255, 255, 255, 0.03);
        border-bottom-color: var(--color-accent, #c9f24d);

        .principles__num {
          color: var(--color-accent, #c9f24d);
        }

        .principles__title {
          color: var(--color-text, #fff);
          transform: translateX(4px);
        }

        .principles__arrow {
          opacity: 1;
          transform: translateX(0);
          color: var(--color-accent, #c9f24d);
        }
      }
    }

    .principles__num {
      font-family: var(--font-mono, monospace);
      font-size: var(--text-sm, 0.875rem);
      color: var(--color-text-dim, #666);
      transition: color 0.3s ease;
    }

    .principles__title {
      font-family: var(--font-display, sans-serif);
      font-size: var(--text-lg, 1.125rem);
      font-weight: 500;
      letter-spacing: 0.08em;
      color: var(--color-text-muted, #aaa);
      transition: color 0.3s ease, transform 0.3s ease;
      flex-grow: 1;
    }

    .principles__arrow {
      opacity: 0;
      transform: translateX(-8px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    /* Single Dynamic Content Area (No Cards) */
    .principles__detail {
      position: relative;
      padding: var(--space-6, 1.5rem);
      border-left: 2px solid var(--color-accent, #c9f24d);
      background: linear-gradient(to right, rgba(201, 242, 77, 0.02), transparent);
    }

    .principles__detail-num {
      font-family: var(--font-mono, monospace);
      font-size: var(--text-xs, 0.75rem);
      color: var(--color-accent, #c9f24d);
      letter-spacing: 0.1em;
    }

    .principles__detail-title {
      font-family: var(--font-display, sans-serif);
      font-size: var(--text-xl, 1.5rem);
      color: var(--color-text, #fff);
      margin-block: var(--space-2, 0.5rem);
    }

    .principles__detail-text {
      font-family: var(--font-body, sans-serif);
      font-size: var(--text-md, 1rem);
      line-height: 1.6;
      color: var(--color-text-muted, #ccc);
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringPrinciples {
  protected readonly principles: readonly Principle[] = [
    {
      id: '01',
      title: 'PRECISION',
      statement:
        'Every spacing value, interaction pattern, and component hierarchy should have a clear architectural reason.',
    },
    {
      id: '02',
      title: 'PERFORMANCE',
      statement:
        'Beautiful interfaces must feel instant — measured by real-world interaction speed, frame rate, and minimal network overhead.',
    },
    {
      id: '03',
      title: 'ACCESSIBILITY',
      statement:
        'Great digital products are accessible-first, ensuring every user regardless of device or ability experiences effortless usability.',
    },
    {
      id: '04',
      title: 'SCALABILITY',
      statement:
        'Frontend architecture should gracefully support tomorrow’s complex requirements without brittle tech debt or refactoring loops.',
    },
  ];

  protected readonly activeIdx = signal(0);
  protected readonly activePrinciple = computed(() => this.principles[this.activeIdx()]);
}
