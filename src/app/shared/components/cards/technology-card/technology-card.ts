import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Technology } from '../../../../core';

export type TechCardVariant = 'tile' | 'plain';

/**
 * Brand-logo technology tile. Renders the logo asset with the tech name as
 * accessible alt text; `label` toggles the caption. Data-driven by Technology.
 */
@Component({
  selector: 'app-technology-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './technology-card.html',
  styles: `
    :host {
      display: block;
    }
    .tc {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      border-radius: 1rem;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-glass);
      padding: 1rem;
      transition: all 0.3s;
    }
    .tc:hover {
      transform: translateY(-0.25rem);
      border-color: rgb(255 255 255 / 20%);
    }
    .tc__logo {
      object-fit: contain;
    }
    .tc__name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-fg);
    }
  `,
})
export class TechnologyCard {
  readonly technology = input.required<Technology>();
  readonly variant = input<TechCardVariant>('tile');
  readonly showLabel = input(true);
  readonly size = input(40);
}
