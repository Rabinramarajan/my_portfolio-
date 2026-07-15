import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AccentColor, accentVar } from '../../../../core';


/**
 * A single timeline row: a two-line marker, a connector line with a glowing
 * node, and projected content. Set `last` to stop the connector line.
 */
@Component({
  selector: 'app-timeline-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timeline-item.html',
  styles: `
    :host {
      display: block;
    }
    .ti {
      display: flex;
      gap: 1rem;
    }
    .ti__marker {
      width: 4rem;
      flex-shrink: 0;
      padding-top: 0.25rem;
      text-align: right;
    }
    .ti__primary {
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 700;
      color: var(--color-fg);
      margin: 0;
    }
    .ti__secondary {
      font-size: 0.875rem;
      color: var(--color-fg-muted);
      margin: 0;
    }
    .ti__connector {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.5rem;
    }
    .ti__node {
      height: 0.875rem;
      width: 0.875rem;
      flex-shrink: 0;
      border-radius: 9999px;
    }
    .ti__line {
      margin-top: 0.25rem;
      width: 1px;
      flex: 1;
      background: var(--color-border-subtle);
    }
    .ti__content {
      min-width: 0;
      flex: 1;
    }
    .ti__content--gap {
      padding-bottom: 2rem;
    }
    @media (min-width: 768px) {
      .ti__marker {
        width: 5rem;
      }
    }
  `,
})
export class TimelineItem {
  readonly markerPrimary = input.required<string>();
  readonly markerSecondary = input<string | null>(null);
  readonly accent = input<AccentColor>('purple');
  readonly last = input(false);

  protected readonly nodeStyle = computed(() => {
    const c = accentVar(this.accent());
    return { background: c, boxShadow: `0 0 12px ${c}` };
  });
}
