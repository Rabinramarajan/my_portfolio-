import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

type ToastType = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isVisible()) {
      <div [class]="'toast toast-' + type" role="status">
        <app-icon [name]="getIconName()" [size]="18" class="toast-icon" />
        <span class="toast-message">{{ message }}</span>
        <button class="toast-close" (click)="close()" aria-label="Dismiss">
          <app-icon name="x" [size]="16" />
        </button>
      </div>
    }
  `,
  styles: [`
    .toast {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4) var(--sp-6);
      border-radius: var(--r-md);
      border-left: 4px solid;
      animation: slideInUp 300ms ease-out;
      box-shadow: var(--el-2);

      &.toast-info {
        background: rgb(59 130 246 / 0.1);
        border-left-color: #3b82f6;
        color: #1e40af;
      }

      &.toast-success {
        background: rgb(16 185 129 / 0.1);
        border-left-color: var(--success);
        color: var(--success);
      }

      &.toast-warning {
        background: rgb(245 158 11 / 0.1);
        border-left-color: var(--warning);
        color: var(--warning);
      }

      &.toast-error {
        background: rgb(239 68 68 / 0.1);
        border-left-color: var(--error);
        color: var(--error);
      }

      .toast-message {
        flex: 1;
        font-weight: var(--fw-medium);
      }

      .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--sp-1);
        color: inherit;
        display: flex;
        align-items: center;

        &:hover {
          opacity: 0.7;
        }
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class ToastComponent {
  @Input() message: string = 'Toast message';
  @Input() type: ToastType = 'info';
  @Input() duration: number = 3000;

  isVisible = signal(true);

  private iconMap = {
    info: 'info',
    success: 'check',
    warning: 'alert-circle',
    error: 'alert-circle',
  };

  constructor() {
    setTimeout(() => this.close(), this.duration);
  }

  getIconName(): string {
    return this.iconMap[this.type] || 'info';
  }

  close() {
    this.isVisible.set(false);
  }
}
