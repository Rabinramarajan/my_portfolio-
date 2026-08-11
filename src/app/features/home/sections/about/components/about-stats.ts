import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnimatedCounter } from '../../../../../shared/components/animated-counter/animated-counter';

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

@Component({
  selector: 'app-about-stats',
  standalone: true,
  imports: [AnimatedCounter],
  template: `
    <div class="editorial-stats">
      @for (stat of stats(); track stat.label) {
        <div class="editorial-stats__item">
          <app-animated-counter
            [value]="stat.value"
            [suffix]="stat.suffix || ''"
            [label]="stat.label"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    .editorial-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-6);
      padding-block: var(--space-8);
      border-block-start: 1px solid var(--color-line);
      margin-block-end: var(--space-12);

      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .editorial-stats__item {
      display: flex;
      flex-direction: column;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutStats {
  readonly stats = input.required<readonly StatItem[]>();
}
