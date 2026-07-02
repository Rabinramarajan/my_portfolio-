import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-scroll-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-progress" [style.width.%]="scrollService.scrollProgress()" role="progressbar" [attr.aria-valuenow]="scrollService.scrollProgress()"></div>
  `,
  styles: [`
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
      z-index: 9998;
      transition: width 50ms linear;
      border-radius: 0 2px 2px 0;
    }
  `]
})
export class ScrollProgressComponent {
  protected readonly scrollService = inject(ScrollService);
}
