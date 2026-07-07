import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Lucide icon component — wraps SVG icons with consistent styling.
 * Usage: <app-icon name="chevron-right" size="24" stroke="1.5" />
 */

const LUCIDE_ICONS: Record<string, string> = {
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="M15 18l-6-6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'x': '<path d="M18 6 6 18M6 6l12 12"/>',
  'menu': '<path d="M3 6h18M3 12h18M3 18h18"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrow-external': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
  'loader': '<circle cx="12" cy="12" r="10" style="animation: spin 1s linear infinite"/>',
  'star': '<polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26 12 2"/>',
  'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 0-9 9"/>',
  'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'layers': '<polygon points="12 2 20.59 6.41 12 10.82 3.41 6.41 12 2"/><polygon points="12 10.82 20.59 15.23 12 19.64 3.41 15.23 12 10.82"/><polygon points="12 19.64 20.59 24.05 12 28.46 3.41 24.05 12 19.64"/>',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      [attr.viewBox]="'0 0 24 24'"
      fill="none"
      [attr.stroke]="stroke || 'currentColor'"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.class]="'icon icon-' + name"
      [attr.aria-label]="ariaLabel"
    >
      <g [innerHTML]="getSvgPath()"></g>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      flex-shrink: 0;
    }
  `],
})
export class IconComponent {
  @Input() name: string = 'chevron-right';
  @Input() size: number = 24;
  @Input() stroke: string | null = null;
  @Input() strokeWidth: number = 1.5;
  @Input() ariaLabel: string = this.name;

  getSvgPath() {
    return LUCIDE_ICONS[this.name] || LUCIDE_ICONS['chevron-right'];
  }
}
