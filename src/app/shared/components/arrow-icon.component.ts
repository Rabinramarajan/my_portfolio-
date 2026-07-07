import { Component } from '@angular/core';

/**
 * Arrow Icon Component — Accessible Right Arrow
 * Replaces text arrow (→) with SVG for screen readers
 * aria-hidden prevents announcement of arrow shape
 */
@Component({
  selector: 'app-arrow-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="arrow-icon"
      aria-hidden="true"
      width="1em"
      height="1em"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .arrow-icon {
      margin-left: 0.5em;
      vertical-align: -0.125em;
      transition: transform 0.3s ease;
    }

    :host-context(a:hover) .arrow-icon,
    :host-context(button:hover) .arrow-icon {
      transform: translateX(4px);
    }
  `]
})
export class ArrowIconComponent {}
