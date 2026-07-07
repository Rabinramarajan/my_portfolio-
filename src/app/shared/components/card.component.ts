import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardVariant = 'surface' | 'glass' | 'interactive';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'card card-' + variant" [class.card-interactive]="interactive" [style.padding]="padding">
      <ng-content />
    </div>
  `,
  styles: [`
    @use '../../../scss/tokens.scss' as *;

    .card {
      border-radius: var(--r-lg);
      border: 1px solid var(--border);
      transition: all var(--dur-fast) var(--ease-out);
      overflow: hidden;

      /* VARIANTS */
      &.card-surface {
        background: var(--surface);
      }

      &.card-glass {
        @include glass;
      }

      &.card-interactive {
        background: var(--surface);
        cursor: pointer;

        &:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          box-shadow: var(--el-1);
        }
      }
    }
  `],
})
export class CardComponent {
  @Input() variant: CardVariant = 'surface';
  @Input() interactive: boolean = false;
  @Input() padding: string = 'var(--sp-6)';
}
