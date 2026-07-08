import { Directive, ElementRef, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { shouldReduceEffects } from './animation-utils';

/**
 * Grid Background Directive
 * Animated glowing grid with pulse effects and hover reactivity
 */
@Directive({
  selector: '[appGridBackground]',
  standalone: true,
})
export class GridBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly ngZone = inject(NgZone);
  private animationId: number | null = null;
  private time = 0;
  private isVisible = true;
  private intersectionObserver: IntersectionObserver | null = null;
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    this.setupGrid();
    this.setupVisibilityObserver();
    if (!this.shouldDisable) {
      this.animate();
    } else {
      this.drawStaticGrid();
    }
  }

  private setupVisibilityObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (!this.isVisible && this.animationId !== null) {
            this.ngZone.runOutsideAngular(() => {
              cancelAnimationFrame(this.animationId!);
              this.animationId = null;
            });
          } else if (this.isVisible && this.animationId === null && !this.shouldDisable) {
            this.animate();
          }
        });
      },
      { threshold: 0.1 }
    );

    this.intersectionObserver.observe(this.el.nativeElement);
  }

  private setupGrid() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      opacity: 0.15;
    `;

    this.el.nativeElement.style.position = 'relative';
    this.el.nativeElement.appendChild(canvas);
    (this.el.nativeElement as any).__gridCanvas = canvas;
  }

  private drawStaticGrid() {
    const canvas = (this.el.nativeElement as any).__gridCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(8, 13, 24, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let i = 0; i < canvas.width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < canvas.height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
    for (let i = gridSize; i < canvas.width; i += gridSize) {
      for (let j = gridSize; j < canvas.height; j += gridSize) {
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      const canvas = (this.el.nativeElement as any).__gridCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.time += 0.01;
      ctx.fillStyle = 'rgba(8, 13, 24, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(this.time) * 0.1})`;
      ctx.lineWidth = 1;

      const gridSize = 50;
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw glowing intersection points
      ctx.fillStyle = `rgba(59, 130, 246, ${0.5 + Math.sin(this.time * 2) * 0.2})`;
      for (let i = gridSize; i < canvas.width; i += gridSize) {
        for (let j = gridSize; j < canvas.height; j += gridSize) {
          ctx.beginPath();
          ctx.arc(i, j, 2 + Math.sin(this.time + i + j) * 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    });
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
