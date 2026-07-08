import { Directive, ElementRef, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { AnimationService } from '../services/animation.service';
import { shouldReduceEffects } from './animation-utils';

/**
 * Mouse Follow Glow Directive
 * Creates soft radial glow that follows cursor
 */
@Directive({
  selector: '[appMouseFollowGlow]',
  standalone: true,
})
export class MouseFollowGlowDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private readonly ngZone = inject(NgZone);
  private glowElement: HTMLElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private animationId: number | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private isVisible = true;
  private intersectionObserver: IntersectionObserver | null = null;
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    if (this.shouldDisable) return;

    this.setupGlow();
    this.setupMouseTracking();
    this.setupVisibilityObserver();
    this.animateGlow();
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
          } else if (this.isVisible && this.animationId === null) {
            this.animateGlow();
          }
        });
      },
      { threshold: 0.1 }
    );

    this.intersectionObserver.observe(this.el.nativeElement);
  }

  private setupGlow() {
    this.glowElement = document.createElement('div');
    this.glowElement.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(60px);
      z-index: 1;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(this.glowElement);
  }

  private setupMouseTracking() {
    this.boundMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };

    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
  }

  private animateGlow() {
    if (!this.glowElement) return;

    const smooth = this.animation.smoothMouseFollower(
      this.mouseX,
      this.mouseY,
      this.targetX,
      this.targetY,
      0.1
    );

    this.targetX = smooth.x;
    this.targetY = smooth.y;

    // Run DOM update outside zone to avoid change detection
    this.ngZone.runOutsideAngular(() => {
      this.glowElement!.style.left = `${this.targetX - 150}px`;
      this.glowElement!.style.top = `${this.targetY - 150}px`;
      this.animationId = requestAnimationFrame(() => this.animateGlow());
    });
  }

  ngOnDestroy() {
    if (this.glowElement) {
      this.glowElement.remove();
    }
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
      this.boundMouseMove = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
