import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Subtle technology tag (Angular, TypeScript, NgRx…). */
@Component({
  selector: 'app-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      border-radius: 0.375rem;
      border: 1px solid var(--color-border-subtle);
      background: rgb(255 255 255 / 5%);
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 500;
      color: var(--color-fg-muted);
    }
  `,
})
export class Tag {}
