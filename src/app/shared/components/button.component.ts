import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [type]="type"
      [class]="'btn btn-' + variant + ' btn-' + size"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
      [attr.aria-label]="ariaLabel"
    >
      @if (loading) {
        <app-icon name="loader" [size]="16" class="btn-loader" />
      }
      @if (iconLeft && !loading) {
        <app-icon [name]="iconLeft" [size]="iconSize" />
      }
      <span class="btn-text">{{ label }}</span>
      @if (iconRight && !loading) {
        <app-icon [name]="iconRight" [size]="iconSize" />
      }
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      font-family: var(--font-body);
      font-weight: var(--fw-medium);
      border: 1px solid transparent;
      border-radius: var(--r-md);
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease-out);
      white-space: nowrap;
      user-select: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      /* SIZES */
      &.btn-sm {
        padding: var(--sp-2) var(--sp-3);
        font-size: var(--text-sm);
      }

      &.btn-md {
        padding: var(--sp-3) var(--sp-4);
        font-size: var(--text-base);
      }

      &.btn-lg {
        padding: var(--sp-4) var(--sp-6);
        font-size: var(--text-lg);
      }

      /* VARIANTS */
      &.btn-primary {
        background: var(--accent);
        color: var(--bg);
        font-weight: var(--fw-semibold);

        &:hover:not(:disabled) {
          background: var(--accent-hover);
          box-shadow: var(--el-glow);
        }

        &:active:not(:disabled) {
          transform: scale(0.98);
        }
      }

      &.btn-outline {
        background: transparent;
        color: var(--text);
        border-color: var(--border);

        &:hover:not(:disabled) {
          background: var(--surface-hover);
          border-color: var(--border-hover);
        }
      }

      &.btn-ghost {
        background: transparent;
        color: var(--accent);

        &:hover:not(:disabled) {
          background: rgb(110 86 207 / 0.1);
        }
      }

      &.btn-icon {
        padding: var(--sp-2);
        border-radius: var(--r-md);
        background: transparent;
        color: var(--text-secondary);

        &:hover:not(:disabled) {
          background: var(--surface-hover);
          color: var(--text);
        }
      }

      .btn-text {
        @media (max-width: 480px) {
          &:empty {
            display: none;
          }
        }
      }

      .btn-loader {
        animation: spin 1s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ButtonComponent {
  @Input() label: string = 'Button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() iconLeft: string | null = null;
  @Input() iconRight: string | null = null;
  @Input() iconSize: number = 18;
  @Input() ariaLabel: string = this.label;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
