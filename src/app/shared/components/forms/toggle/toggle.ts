import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { AccentColor, accentVar } from '../../../../core';

/** Accessible on/off switch; two-way bound via `checked`. */
@Component({
  selector: 'app-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label()"
      [disabled]="disabled()"
      class="tg"
      [style.background]="checked() ? accentColor() : 'var(--color-border-subtle)'"
      (click)="toggle()"
    >
      <span class="tg__thumb" [class.tg__thumb--on]="checked()"></span>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .tg {
      position: relative;
      display: inline-flex;
      height: 1.5rem;
      width: 2.75rem;
      flex-shrink: 0;
      align-items: center;
      border-radius: 9999px;
      border: 0;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .tg:disabled {
      opacity: 0.4;
    }
    .tg__thumb {
      display: inline-block;
      height: 1.25rem;
      width: 1.25rem;
      transform: translateX(0.125rem);
      border-radius: 9999px;
      background: #fff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 20%);
      transition: transform 0.15s;
    }
    .tg__thumb--on {
      transform: translateX(1.25rem);
    }
  `,
})
export class Toggle {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly accent = input<AccentColor>('green');
  readonly label = input<string | null>(null);

  protected accentColor(): string {
    return accentVar(this.accent());
  }

  protected toggle(): void {
    if (!this.disabled()) {
      this.checked.set(!this.checked());
    }
  }
}
