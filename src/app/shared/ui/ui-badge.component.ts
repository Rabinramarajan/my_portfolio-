import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Design-system badge / tag.
 * Usage:
 *   <ui-badge>Angular</ui-badge>
 *   <ui-badge tone="amber" dot>Work in Progress</ui-badge>
 */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dot()) { <span class="ui-badge__dot" aria-hidden="true"></span> }
    <ng-content />
  `,
  host: {
    class: 'ui-badge',
    '[class.ui-badge--accent]': "tone() === 'accent'",
    '[class.ui-badge--amber]': "tone() === 'amber'",
    '[class.ui-badge--emerald]': "tone() === 'emerald'",
    '[class.ui-badge--rose]': "tone() === 'rose'",
  },
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-hover);
      background: rgba(99, 102, 241, 0.1);
      color: var(--text-secondary);
      white-space: nowrap;
    }
    :host(.ui-badge--accent)  { background: rgba(99,102,241,0.12); border-color: var(--border-hover); color: var(--text-secondary); }
    :host(.ui-badge--amber)   { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); color: var(--accent-amber); }
    :host(.ui-badge--emerald) { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); color: var(--accent-emerald); }
    :host(.ui-badge--rose)    { background: rgba(244,63,94,0.1); border-color: rgba(244,63,94,0.3); color: var(--accent-rose); }
    .ui-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  `],
})
export class UiBadgeComponent {
  readonly tone = input<'accent' | 'amber' | 'emerald' | 'rose'>('accent');
  readonly dot = input(false);
}
