import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

/** Wraps a trigger and reveals a tooltip on hover/focus (CSS-driven, a11y role). */
@Component({
  selector: 'app-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tt">
      <ng-content />
      <span role="tooltip" class="tt__bubble" [class]="placementClass()">
        {{ text() }}
      </span>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .tt {
      position: relative;
      display: inline-flex;
    }
    .tt__bubble {
      pointer-events: none;
      position: absolute;
      z-index: 40;
      border-radius: 0.5rem;
      background: var(--color-brand-purple);
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      white-space: nowrap;
      color: #fff;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .tt:hover .tt__bubble,
    .tt:focus-within .tt__bubble {
      opacity: 1;
    }
    .tt__bubble--top {
      bottom: 100%;
      left: 50%;
      margin-bottom: 0.5rem;
      transform: translateX(-50%);
    }
    .tt__bubble--bottom {
      top: 100%;
      left: 50%;
      margin-top: 0.5rem;
      transform: translateX(-50%);
    }
    .tt__bubble--left {
      right: 100%;
      top: 50%;
      margin-right: 0.5rem;
      transform: translateY(-50%);
    }
    .tt__bubble--right {
      left: 100%;
      top: 50%;
      margin-left: 0.5rem;
      transform: translateY(-50%);
    }
  `,
})
export class Tooltip {
  readonly text = input.required<string>();
  readonly placement = input<TooltipPlacement>('right');

  protected placementClass(): string {
    return `tt__bubble--${this.placement()}`;
  }
}
