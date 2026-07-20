import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type HeadingLevel = 1 | 2 | 3;

/**
 * Section heading with a plain lead and a gradient-highlighted tail,
 * e.g. `lead="My Experience"` `highlight="Journey"`.
 * Renders a semantically correct heading element based on `level`.
 */
@Component({
  selector: 'app-gradient-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (level()) {
      @case (1) {
        <h1 class="gt">
          {{ lead() }} <span class="text-gradient-brand">{{ highlight() }}</span>
        </h1>
      }
      @case (2) {
        <h2 class="gt">
          {{ lead() }} <span class="text-gradient-brand">{{ highlight() }}</span>
        </h2>
      }
      @default {
        <h3 class="gt">
          {{ lead() }} <span class="text-gradient-brand">{{ highlight() }}</span>
        </h3>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .gt {
      margin: 0;
      font-size: 2.25rem;
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    @media (min-width: 768px) {
      .gt {
        font-size: 3rem;
      }
    }
  `,
})
export class GradientTitle {
  /** Plain leading text. */
  readonly lead = input.required<string>();

  /** Gradient-highlighted trailing text. */
  readonly highlight = input('');

  /** Semantic heading level. */
  readonly level = input<HeadingLevel>(1);
}
