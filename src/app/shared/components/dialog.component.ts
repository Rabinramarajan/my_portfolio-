import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

let dialogIdCounter = 0;

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div class="dialog-overlay" (click)="close()"></div>
      <div class="dialog-wrapper">
        <div class="dialog" role="dialog" [attr.aria-labelledby]="titleId">
          <div class="dialog-header">
            <h2 [id]="titleId" class="dialog-title">{{ title }}</h2>
            <button class="dialog-close" (click)="close()" aria-label="Close dialog">
              <app-icon name="x" [size]="20" />
            </button>
          </div>
          <div class="dialog-content">
            <ng-content />
          </div>
          <div class="dialog-footer">
            <ng-content select="[dialog-actions]" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 0.5);
      z-index: calc(var(--z-modal) - 1);
      animation: fadeIn 150ms ease-out;
    }

    .dialog-wrapper {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      animation: slideUp 250ms ease-out;
      padding: var(--sp-4);
    }

    .dialog {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--el-2);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-6);
      border-bottom: 1px solid var(--border);

      .dialog-title {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--fw-semibold);
      }

      .dialog-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--sp-1);
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: var(--text);
        }
      }
    }

    .dialog-content {
      padding: var(--sp-6);
      overflow-y: auto;
      flex: 1;
    }

    .dialog-footer {
      padding: var(--sp-6);
      border-top: 1px solid var(--border);
      display: flex;
      gap: var(--sp-3);
      justify-content: flex-end;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
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
export class DialogComponent {
  @Input() title: string = 'Dialog';
  @Input() isOpen = signal(false);
  @Output() closed = new EventEmitter<void>();

  titleId = `dialog-${++dialogIdCounter}`;

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  open() {
    this.isOpen.set(true);
  }
}
