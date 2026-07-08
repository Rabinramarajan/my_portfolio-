import { Directive, ElementRef, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { shouldReduceEffects } from './animation-utils';

/**
 * Floating Text Directive
 * Animated floating text with vertical bouncing motion
 */
@Directive({
  selector: '[appFloatingText]',
  standalone: true,
})
export class FloatingTextDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly ngZone = inject(NgZone);
  private animationId: number | null = null;
  private time = 0;
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    const element = this.el.nativeElement;
    element.style.position = 'relative';

    if (this.shouldDisable) {
      return;
    }

    this.animate();
  }

  private animate() {
    this.ngZone.runOutsideAngular(() => {
      this.time += 0.02;
      const element = this.el.nativeElement;
      const yOffset = Math.sin(this.time) * 6;
      const opacity = 0.8 + Math.cos(this.time * 0.5) * 0.2;

      element.style.transform = `translateY(${yOffset}px)`;
      element.style.opacity = `${opacity}`;

      this.animationId = requestAnimationFrame(() => this.animate());
    });
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
