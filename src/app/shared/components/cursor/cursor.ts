import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { asyncTeardown } from '../../utils/async-teardown';

/**
 * Custom cursor that follows mouse position.
 * Uses CSS variables for positioning - simple and reliable.
 */
@Component({
  selector: 'app-cursor',
  templateUrl: './cursor.html',
  styleUrl: './cursor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cursor {
  private readonly teardown = asyncTeardown();
  private readonly containerRef = viewChild<ElementRef>('container');

  constructor() {
    afterNextRender(() => void this.init());
  }

  private async init(): Promise<void> {
    const container = (this.containerRef() as ElementRef<HTMLElement>)?.nativeElement;
    if (!container || this.teardown.destroyed) return;

    const onMove = (event: MouseEvent) => {
      container.style.setProperty('--cursor-x', `${event.clientX}px`);
      container.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    document.addEventListener('mousemove', onMove, { passive: true });

    this.teardown.register(() => {
      document.removeEventListener('mousemove', onMove);
    });
  }
}
