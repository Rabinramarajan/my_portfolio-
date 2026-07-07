import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="'badge badge-' + variant + ' badge-' + size"
      [class.badge-dot]="dot"
      [attr.role]="'status'"
    >
      @if (dot) {
        <span class="badge-dot-icon"></span>
      }
      <ng-content />
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-1) var(--sp-2);
      border-radius: var(--r-full);
      font-size: var(--text-xs);
      font-weight: var(--fw-semibold);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;

      /* SIZES */
      &.badge-sm {
        padding: 3px 8px;
        font-size: 11px;
      }

      &.badge-md {
        padding: var(--sp-1) var(--sp-3);
        font-size: var(--text-xs);
      }

      /* VARIANTS */
      &.badge-default {
        background: rgb(110 86 207 / 0.15);
        color: var(--accent);
      }

      &.badge-accent {
        background: rgb(110 86 207 / 0.2);
        color: var(--accent);
      }

      &.badge-success {
        background: rgb(16 185 129 / 0.15);
        color: var(--success);
      }

      &.badge-warning {
        background: rgb(245 158 11 / 0.15);
        color: var(--warning);
      }

      &.badge-error {
        background: rgb(239 68 68 / 0.15);
        color: var(--error);
      }

      /* DOT */
      .badge-dot-icon {
        width: 6px;
        height: 6px;
        border-radius: var(--r-full);
        background: currentColor;
        animation: pulse 2s ease-in-out infinite;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() dot: boolean = false;
}
