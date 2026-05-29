import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-back-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <button class="back-to-top" (click)="scrollService.scrollToTop()" aria-label="Back to top" title="Back to top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    }
  `,
  styles: [`
    .back-to-top {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 400;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.9);
      color: white;
      border: 1px solid rgba(139, 92, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .back-to-top:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
      background: rgba(99, 102, 241, 1);
    }
    @keyframes fadeScaleIn {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    @media (max-width: 480px) {
      .back-to-top { bottom: 80px; right: 16px; width: 42px; height: 42px; }
    }
  `]
})
export class BackToTopComponent {
  protected readonly scrollService = inject(ScrollService);
  protected readonly isVisible = computed(() => this.scrollService.scrollY() > 400);
}
