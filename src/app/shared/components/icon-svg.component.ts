import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SVG Icon Component — renders Heroicons-style icons
 * Usage: <app-icon-svg name="building" [size]="24" />
 */
@Component({
  selector: 'app-icon-svg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      [attr.viewBox]="viewBox"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon-svg"
      [class]="'icon-' + name"
      aria-hidden="true"
    >
      <ng-container [ngSwitch]="name">
        <!-- Building / Government -->
        <ng-container *ngSwitchCase="'building'">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </ng-container>

        <!-- Smartphone / Mobile -->
        <ng-container *ngSwitchCase="'smartphone'">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <path d="M12 18h.01"></path>
        </ng-container>

        <!-- Zap / Lightning -->
        <ng-container *ngSwitchCase="'zap'">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </ng-container>

        <!-- Phone -->
        <ng-container *ngSwitchCase="'phone'">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </ng-container>

        <!-- Target -->
        <ng-container *ngSwitchCase="'target'">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="12" r="5"></circle>
          <circle cx="12" cy="12" r="9"></circle>
        </ng-container>

        <!-- Rocket -->
        <ng-container *ngSwitchCase="'rocket'">
          <path d="M22 2L11 13"></path>
          <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
        </ng-container>

        <!-- Wrench / Tools -->
        <ng-container *ngSwitchCase="'wrench'">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </ng-container>

        <!-- Map Pin / Location -->
        <ng-container *ngSwitchCase="'map-pin'">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </ng-container>

        <!-- Briefcase -->
        <ng-container *ngSwitchCase="'briefcase'">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 7v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
        </ng-container>

        <!-- Layers / Stack -->
        <ng-container *ngSwitchCase="'layers'">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </ng-container>

        <!-- Default fallback -->
        <ng-container *ngSwitchDefault>
          <circle cx="12" cy="12" r="1"></circle>
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
        </ng-container>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .icon-svg {
      flex-shrink: 0;
      color: inherit;
      transition: transform 150ms ease;
    }

    :host-context(.icon-group:hover) .icon-svg {
      transform: scale(1.05);
    }
  `]
})
export class IconSvgComponent {
  @Input() name: string = 'zap';
  @Input() size: number = 24;
  @Input() strokeWidth: number = 2;

  get viewBox(): string {
    return '0 0 24 24';
  }
}
