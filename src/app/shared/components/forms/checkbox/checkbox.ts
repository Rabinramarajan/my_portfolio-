import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Icon } from '../../ui/icon/icon';


/** Accessible checkbox with a custom indicator; two-way bound via `checked`. */
@Component({
  selector: 'app-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <label class="cb" [class.cb--disabled]="disabled()">
      <input
        type="checkbox"
        class="cb__input"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="checked.set($any($event.target).checked)"
      />
      <span class="cb__box" [class.cb__box--checked]="checked()">
        @if (checked()) {
          <app-icon name="Check" [size]="14" class="cb__check" aria-hidden="true" />
        }
      </span>
      <span class="cb__label"><ng-content /></span>
    </label>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .cb {
      display: inline-flex;
      cursor: pointer;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.875rem;
      user-select: none;
    }
    .cb--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .cb__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .cb__box {
      display: flex;
      height: 1.25rem;
      width: 1.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      border: 1px solid var(--color-border-subtle);
      transition:
        border-color 0.15s,
        background-color 0.15s;
    }
    .cb__box--checked {
      border-color: transparent;
      background: var(--color-brand-purple);
    }
    .cb__input:focus-visible + .cb__box {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand-purple) 60%, transparent);
    }
    .cb__check {
      color: #fff;
    }
    .cb__label {
      color: var(--color-fg);
    }
  `,
})
export class Checkbox {
  readonly checked = model(false);
  readonly disabled = input(false);
}
