import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { trackByValue } from '../../../../core';


export interface RadioOption {
  readonly label: string;
  readonly value: string;
  readonly disabled?: boolean;
}

/** Accessible radio group; two-way bound via `value`. */
@Component({
  selector: 'app-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rg" role="radiogroup" [attr.aria-label]="label()">
      @for (option of options(); track trackByValue($index, option)) {
        <label class="rg__opt" [class.rg__opt--disabled]="option.disabled">
          <input
            type="radio"
            class="rg__input"
            [name]="name()"
            [value]="option.value"
            [checked]="option.value === value()"
            [disabled]="option.disabled ?? false"
            (change)="value.set(option.value)"
          />
          <span class="rg__mark" [class.rg__mark--checked]="option.value === value()">
            @if (option.value === value()) {
              <span class="rg__dot"></span>
            }
          </span>
          <span class="rg__label">{{ option.label }}</span>
        </label>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .rg {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }
    .rg__opt {
      display: inline-flex;
      cursor: pointer;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.875rem;
      user-select: none;
    }
    .rg__opt--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .rg__input {
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
    .rg__mark {
      display: flex;
      height: 1.25rem;
      width: 1.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle);
      transition: border-color 0.15s;
    }
    .rg__mark--checked {
      border-color: var(--color-brand-purple);
    }
    .rg__input:focus-visible + .rg__mark {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand-purple) 60%, transparent);
    }
    .rg__dot {
      height: 0.625rem;
      width: 0.625rem;
      border-radius: 9999px;
      background: var(--color-brand-purple);
    }
    .rg__label {
      color: var(--color-fg);
    }
  `,
})
export class RadioGroup {
  readonly options = input.required<readonly RadioOption[]>();
  readonly value = model('');
  readonly name = input('radio-group');
  readonly label = input<string | null>(null);

  protected readonly trackByValue = trackByValue;
}
