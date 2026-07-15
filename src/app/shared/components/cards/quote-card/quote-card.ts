import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { GlassCard } from '../../ui/glass-card/glass-card';
import { Icon } from '../../ui/icon/icon';

/** Reusable pull-quote card with an opening quote glyph and optional author. */
@Component({
  selector: 'app-quote-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, GlassCard],
  template: `
    <app-glass-card [padding]="compact() ? 'sm' : 'md'">
      <figure class="quote">
        <app-icon name="Quote" [size]="24" class="quote__mark" aria-hidden="true" />
        <blockquote class="quote__text">
          {{ text() }}
        </blockquote>
        @if (author(); as a) {
          <figcaption class="quote__author">— {{ a }}</figcaption>
        }
      </figure>
    </app-glass-card>
  `,
  styles: `
    :host {
      display: block;
    }
    .quote {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .quote__mark {
      color: var(--color-brand-purple);
    }
    .quote__text {
      margin: 0;
      font-size: 1rem;
      line-height: 1.625;
      font-weight: 500;
      color: var(--color-fg);
    }
    .quote__author {
      font-size: 0.875rem;
      color: var(--color-brand-purple);
    }
  `,
})
export class QuoteCard {
  readonly text = input.required<string>();
  readonly author = input<string | null>(null);
  readonly compact = input(false);
}
