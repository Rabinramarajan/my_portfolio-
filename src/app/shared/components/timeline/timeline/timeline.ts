import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Ordered vertical timeline container. Compose with app-timeline-item. */
@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ol class="tl"><ng-content /></ol>`,
  styles: `
    :host {
      display: block;
    }
    .tl {
      display: flex;
      flex-direction: column;
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class Timeline {}
