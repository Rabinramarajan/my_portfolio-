import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccentColor } from '../../../../core';

/** Small pill status indicator (New, Featured, Beta, Full Time…). */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge--' + accent()"><ng-content /></span>`,
  styles: `
    :host {
      display: inline-flex;
    }
    .badge {
      --c: var(--color-brand-purple);
      /* Text uses a contrast-safe accent; the tint/border keep the bright --c.
         (raw brand-purple text is 3.58 on the light 10% tint.) */
      --ct: var(--color-link-accent);
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      border: 1px solid color-mix(in srgb, var(--c) 25%, transparent);
      background: color-mix(in srgb, var(--c) 10%, transparent);
      color: var(--ct, var(--c));
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 500;
    }
    .badge--violet {
      --c: var(--color-brand-violet);
      --ct: var(--color-brand-violet);
    }
    .badge--blue {
      --c: var(--color-brand-blue);
      --ct: var(--color-link-blue);
    }
    .badge--cyan {
      --c: var(--color-brand-cyan);
      --ct: var(--color-brand-cyan);
    }
    .badge--green {
      --c: var(--color-success);
      --ct: var(--color-link-success);
    }
    .badge--orange,
    .badge--amber {
      --c: var(--color-warning);
    }
    .badge--red {
      --c: var(--color-danger);
    }
  `,
})
export class Badge {
  readonly accent = input<AccentColor>('purple');
}
