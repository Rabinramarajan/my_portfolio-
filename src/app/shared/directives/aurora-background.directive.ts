import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';
import { shouldReduceEffects } from './animation-utils';

/**
 * Aurora Background Animation Directive
 * Smooth animated gradient waves with blue and purple flowing lights
 */
@Directive({
  selector: '[appAuroraBackground]',
  standalone: true,
})
export class AuroraBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private animationId: number | null = null;
  private time = 0;
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    this.setupAuroraStyle();
    if (!this.shouldDisable) {
      this.animate();
    }
  }

  private setupAuroraStyle() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    // Fade in over the first 300ms of the hero load sequence
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 300ms ease';
    requestAnimationFrame(() => (canvas.style.opacity = '0.15'));

    this.el.nativeElement.style.position = 'relative';
    this.el.nativeElement.style.overflow = 'hidden';
    this.el.nativeElement.appendChild(canvas);

    // Store for animation
    (this.el.nativeElement as any).__auroraCanvas = canvas;
  }

  private animate() {
    if (this.shouldDisable) return;

    const canvas = (this.el.nativeElement as any).__auroraCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.time += 0.0015;

    // Clear canvas
    ctx.fillStyle = 'rgba(8, 13, 24, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated aurora waves
    for (let i = 0; i < 5; i++) {
      const wave = Math.sin(this.time + i * 0.5) * 100 + 200;
      const hue = (i * 60 + this.time * 20) % 360;

      const gradient = ctx.createLinearGradient(0, wave - 100, 0, wave + 100);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, 0.3)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, wave - 100, canvas.width, 200);
    }

    // Static single frame under prefers-reduced-motion
    if (!this.shouldDisable) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
