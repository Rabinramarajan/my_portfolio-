import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cursor.component.html',
  styleUrl: './cursor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CursorComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  cursorX = signal(0);
  cursorY = signal(0);
  trailX = signal(0);
  trailY = signal(0);
  isHovering = signal(false);
  isClicking = signal(false);
  isVisible = signal(false);

  private animationFrameId: number | null = null;
  private readonly TRAIL_SPEED = 0.15;
  private observer: MutationObserver | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.addEventListeners();
      this.ngZone.runOutsideAngular(() => {
        this.animate();
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.removeEventListeners();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  private addEventListeners(): void {
    this.document.addEventListener('mousemove', this.onMouseMove);
    this.document.addEventListener('mouseenter', this.onMouseEnter);
    this.document.addEventListener('mouseleave', this.onMouseLeave);
    this.document.addEventListener('mousedown', this.onMouseDown);
    this.document.addEventListener('mouseup', this.onMouseUp);
    
    this.observeInteractiveElements();
  }

  private removeEventListeners(): void {
    this.document.removeEventListener('mousemove', this.onMouseMove);
    this.document.removeEventListener('mouseenter', this.onMouseEnter);
    this.document.removeEventListener('mouseleave', this.onMouseLeave);
    this.document.removeEventListener('mousedown', this.onMouseDown);
    this.document.removeEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.cursorX.set(e.clientX);
    this.cursorY.set(e.clientY);
    this.isVisible.set(true);
  };

  private onMouseEnter = (): void => {
    this.isVisible.set(true);
  };

  private onMouseLeave = (): void => {
    this.isVisible.set(false);
  };

  private onMouseDown = (): void => {
    this.isClicking.set(true);
  };

  private onMouseUp = (): void => {
    this.isClicking.set(false);
  };

  private observeInteractiveElements(): void {
    this.observer = new MutationObserver(() => {
      this.attachHoverListeners();
    });

    this.observer.observe(this.document.body, { childList: true, subtree: true });
    this.attachHoverListeners();
  }

  private attachHoverListeners(): void {
    const interactiveElements = this.document.querySelectorAll('a, button, [data-cursor-hover]');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.isHovering.set(true));
      el.addEventListener('mouseleave', () => this.isHovering.set(false));
    });
  }

  private animate = (): void => {
    const currentTrailX = this.trailX();
    const currentTrailY = this.trailY();
    const targetX = this.cursorX();
    const targetY = this.cursorY();

    const newTrailX = currentTrailX + (targetX - currentTrailX) * this.TRAIL_SPEED;
    const newTrailY = currentTrailY + (targetY - currentTrailY) * this.TRAIL_SPEED;

    this.trailX.set(newTrailX);
    this.trailY.set(newTrailY);
    
    this.cdr.markForCheck();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
