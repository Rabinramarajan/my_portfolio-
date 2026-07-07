import { Component, Input, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip-wrapper" (mouseenter)="show()" (mouseleave)="hide()">
      <ng-content />
      @if (isVisible()) {
        <div [class]="'tooltip tooltip-' + position" role="tooltip">
          {{ text }}
        </div>
      }
    </div>
  `,
  styles: [`
    .tooltip-wrapper {
      position: relative;
      display: inline-block;
    }

    .tooltip {
      position: absolute;
      background: var(--text);
      color: var(--bg);
      padding: var(--sp-2) var(--sp-3);
      border-radius: var(--r-sm);
      font-size: var(--text-xs);
      font-weight: var(--fw-medium);
      white-space: nowrap;
      z-index: var(--z-overlay);
      animation: fadeIn 150ms ease-out;
      pointer-events: none;

      &.tooltip-top {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: var(--sp-2);

        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: var(--text);
        }
      }

      &.tooltip-bottom {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: var(--sp-2);

        &::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-bottom-color: var(--text);
        }
      }

      &.tooltip-left {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-right: var(--sp-2);
      }

      &.tooltip-right {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: var(--sp-2);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
})
export class TooltipComponent {
  @Input() text: string = 'Tooltip';
  @Input() position: TooltipPosition = 'top';

  isVisible = signal(false);

  show() {
    this.isVisible.set(true);
  }

  hide() {
    this.isVisible.set(false);
  }
}
