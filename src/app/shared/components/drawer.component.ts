import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div class="drawer-overlay" (click)="close()"></div>
    }
    <div [class]="'drawer drawer-' + position + (isOpen() ? ' drawer-open' : '')">
      <div class="drawer-header">
        <h2 class="drawer-title">{{ title }}</h2>
        <button class="drawer-close" (click)="close()" aria-label="Close drawer">
          <app-icon name="x" [size]="20" />
        </button>
      </div>
      <div class="drawer-content">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 0.5);
      z-index: calc(var(--z-overlay) - 1);
      animation: fadeIn 150ms ease-out;
    }

    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: min(400px, 100vw);
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform var(--dur-base) var(--ease-out);
      z-index: var(--z-overlay);

      &.drawer-open {
        transform: translateX(0);
      }

      &.drawer-right {
        right: 0;
        left: auto;
        border-right: none;
        border-left: 1px solid var(--border);
        transform: translateX(100%);

        &.drawer-open {
          transform: translateX(0);
        }
      }

      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-6);
        border-bottom: 1px solid var(--border);

        .drawer-title {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: var(--fw-semibold);
        }

        .drawer-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--sp-1);
          display: flex;
          align-items: center;

          &:hover {
            color: var(--text);
          }
        }
      }

      .drawer-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--sp-6);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
})
export class DrawerComponent {
  @Input() title: string = 'Drawer';
  @Input() position: 'left' | 'right' = 'left';
  isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}
