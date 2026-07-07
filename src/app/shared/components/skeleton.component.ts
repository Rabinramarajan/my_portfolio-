import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SkeletonShape = 'text' | 'avatar' | 'button' | 'card';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'skeleton skeleton-' + shape" [style.width]="width" [style.height]="height"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--surface-hover) 0%,
        var(--surface) 50%,
        var(--surface-hover) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
      border-radius: var(--r-md);

      &.skeleton-text {
        height: 1rem;
        border-radius: var(--r-sm);
      }

      &.skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--r-full);
      }

      &.skeleton-button {
        height: 40px;
        border-radius: var(--r-md);
        min-width: 100px;
      }

      &.skeleton-card {
        height: 200px;
        border-radius: var(--r-lg);
      }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() shape: SkeletonShape = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
}
