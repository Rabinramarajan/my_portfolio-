import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Timeline Item Component
@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-item">
      <div class="timeline-dot">
        <span class="dot-inner"></span>
      </div>
      <div class="timeline-content">
        <h3 class="timeline-title">{{ title }}</h3>
        @if (date) {
          <span class="timeline-date">{{ date }}</span>
        }
        <p class="timeline-description">{{ description }}</p>
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .timeline-item {
      display: flex;
      gap: var(--sp-6);
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 11px;
        top: 40px;
        width: 2px;
        height: calc(100% + var(--sp-6));
        background: var(--accent);
      }

      .timeline-dot {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        z-index: 1;

        .dot-inner {
          width: 12px;
          height: 12px;
          border-radius: var(--r-full);
          background: var(--accent);
          border: 2px solid var(--surface);
        }
      }

      .timeline-content {
        flex: 1;
        padding-top: var(--sp-1);

        .timeline-title {
          margin: 0 0 var(--sp-1);
          font-size: var(--text-base);
          font-weight: var(--fw-semibold);
          color: var(--text);
        }

        .timeline-date {
          display: inline-block;
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-bottom: var(--sp-2);
        }

        .timeline-description {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--lh-normal);
        }
      }
    }
  `],
})
export class TimelineItemComponent {
  @Input() title: string = 'Event';
  @Input() date: string = '';
  @Input() description: string = '';
}

// Stat Tile Component
@Component({
  selector: 'app-stat-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-tile">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      @if (description) {
        <p class="stat-description">{{ description }}</p>
      }
    </div>
  `,
  styles: [`
    .stat-tile {
      padding: var(--sp-6);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      text-align: center;
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        border-color: var(--border-hover);
        background: var(--surface-hover);
      }

      .stat-value {
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: var(--fw-semibold);
        color: var(--accent);
        line-height: var(--lh-tight);
        margin-bottom: var(--sp-2);
      }

      .stat-label {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        margin-bottom: var(--sp-2);
      }

      .stat-description {
        margin: 0;
        font-size: var(--text-xs);
        color: var(--text-muted);
        line-height: var(--lh-normal);
      }
    }
  `],
})
export class StatTileComponent {
  @Input() value: string = '0';
  @Input() label: string = 'Metric';
  @Input() description: string = '';
}
