import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from './icon.component';

let inputIdCounter = 0;
let textareaIdCounter = 0;

type InputType = 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'date';
type InputState = 'default' | 'focus' | 'error' | 'success';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="input-wrapper" [class]="'input-' + state">
      @if (label) {
        <label [for]="id" class="input-label">{{ label }}</label>
      }
      <div class="input-field">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value || ''"
          (input)="onChange($event)"
          (focus)="state = 'focus'"
          (blur)="onBlur()"
          class="input-element"
        />
        @if (state === 'error' && errorMessage) {
          <app-icon name="alert-circle" [size]="16" class="input-icon-error" />
        }
        @if (state === 'success') {
          <app-icon name="check" [size]="16" class="input-icon-success" />
        }
      </div>
      @if (state === 'error' && errorMessage) {
        <span class="input-error">{{ errorMessage }}</span>
      }
      @if (helper) {
        <span class="input-helper">{{ helper }}</span>
      }
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);

      .input-label {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text);
      }

      .input-field {
        position: relative;
        display: flex;
        align-items: center;

        .input-element {
          width: 100%;
          padding: var(--sp-3) var(--sp-4);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          color: var(--text);
          font-size: var(--text-base);
          font-family: var(--font-body);
          transition: all var(--dur-fast) var(--ease-out);

          &::placeholder {
            color: var(--text-muted);
          }

          &:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px rgb(110 86 207 / 0.15);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        .input-icon-error,
        .input-icon-success {
          position: absolute;
          right: var(--sp-3);
          pointer-events: none;
        }

        .input-icon-error {
          color: var(--error);
        }

        .input-icon-success {
          color: var(--success);
        }
      }

      /* STATES */
      &.input-error {
        .input-element {
          border-color: var(--error);
          background: rgb(239 68 68 / 0.05);
        }
      }

      &.input-success {
        .input-element {
          border-color: var(--success);
        }
      }

      .input-error {
        font-size: var(--text-xs);
        color: var(--error);
      }

      .input-helper {
        font-size: var(--text-xs);
        color: var(--text-muted);
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() id: string = `input-${++inputIdCounter}`;
  @Input() type: InputType = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() value: string | null = null;
  @Input() errorMessage: string = '';
  @Input() helper: string = '';
  @Input() state: InputState = 'default';

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() blur = new EventEmitter<void>();

  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value || null);
  }

  onBlur(): void {
    this.state = this.errorMessage ? 'error' : 'default';
    this.blur.emit();
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      fn(input.value || null);
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onBlur = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

// Textarea variant
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="input-wrapper" [class]="'input-' + state">
      @if (label) {
        <label [for]="id" class="input-label">{{ label }}</label>
      }
      <textarea
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value || ''"
        [rows]="rows"
        (input)="onChange($event)"
        (focus)="state = 'focus'"
        (blur)="onBlur()"
        class="textarea-element"
      ></textarea>
      @if (state === 'error' && errorMessage) {
        <span class="input-error">{{ errorMessage }}</span>
      }
    </div>
  `,
  styles: [`
    .textarea-element {
      width: 100%;
      padding: var(--sp-3) var(--sp-4);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      color: var(--text);
      font-size: var(--text-base);
      font-family: var(--font-body);
      font-weight: var(--fw-normal);
      line-height: var(--lh-normal);
      resize: vertical;
      transition: all var(--dur-fast) var(--ease-out);

      &::placeholder {
        color: var(--text-muted);
      }

      &:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgb(110 86 207 / 0.15);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() id: string = `textarea-${++textareaIdCounter}`;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() rows: number = 4;
  @Input() value: string | null = null;
  @Input() errorMessage: string = '';
  @Input() state: InputState = 'default';

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() blur = new EventEmitter<void>();

  onChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.valueChange.emit(this.value || null);
  }

  onBlur(): void {
    this.state = this.errorMessage ? 'error' : 'default';
    this.blur.emit();
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = (event: Event) => {
      const textarea = event.target as HTMLTextAreaElement;
      fn(textarea.value || null);
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onBlur = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
