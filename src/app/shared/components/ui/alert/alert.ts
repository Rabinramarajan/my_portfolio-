import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { StatusVariant, IconName } from '../../../../core';
import { Icon } from '../icon/icon';


const VARIANT: Readonly<Record<StatusVariant, IconName>> = {
  success: 'CheckCircle2',
  info: 'Info',
  warning: 'AlertTriangle',
  danger: 'XCircle',
  neutral: 'Info',
};

/** Inline status alert with icon and optional dismiss. */
@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="alert" [class]="'alert--' + variant()" role="alert">
      <app-icon [name]="icon()" [size]="18" aria-hidden="true" />
      <span class="alert__body"><ng-content /></span>
      @if (dismissible()) {
        <button type="button" class="alert__dismiss" aria-label="Dismiss" (click)="dismissed.emit()">
          <app-icon name="X" [size]="16" aria-hidden="true" />
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .alert {
      --c: var(--color-brand-blue);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid color-mix(in srgb, var(--c) 25%, transparent);
      background: color-mix(in srgb, var(--c) 10%, transparent);
      color: var(--c);
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }
    .alert--success {
      --c: var(--color-success);
    }
    .alert--warning {
      --c: var(--color-warning);
    }
    .alert--danger {
      --c: var(--color-danger);
    }
    .alert--neutral {
      color: var(--color-fg-muted);
      background: rgb(255 255 255 / 5%);
      border-color: var(--color-border-subtle);
    }
    .alert__body {
      flex: 1;
    }
    .alert__dismiss {
      opacity: 0.7;
      transition: opacity 0.2s;
      cursor: pointer;
      background: none;
      border: 0;
      color: inherit;
      padding: 0;
      display: inline-flex;
    }
    .alert__dismiss:hover {
      opacity: 1;
    }
  `,
})
export class Alert {
  readonly variant = input<StatusVariant>('info');
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  protected readonly icon = computed(() => VARIANT[this.variant()]);
}
