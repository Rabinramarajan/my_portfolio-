import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';
import { shouldReduceEffects } from './animation-utils';

/**
 * Magnetic Button Directive
 * Buttons move toward cursor with glow and ripple effects
 */
@Directive({
  selector: '[appMagneticButton]',
  standalone: true,
})
export class MagneticButtonDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private animationId: number | null = null;
  private boundEnter: (() => void) | null = null;
  private boundMove: ((e: MouseEvent) => void) | null = null;
  private boundLeave: (() => void) | null = null;
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    const element = this.el.nativeElement;
    element.style.position = 'relative';
    element.style.overflow = 'visible';

    if (this.shouldDisable) {
      return;
    }

    this.boundEnter = () => this.setupGlow();
    this.boundMove = (e: MouseEvent) => this.handleMouseMove(e);
    this.boundLeave = () => this.handleMouseLeave();

    element.addEventListener('mouseenter', this.boundEnter as EventListener);
    element.addEventListener('mousemove', this.boundMove as EventListener);
    element.addEventListener('mouseleave', this.boundLeave as EventListener);
  }

  private setupGlow() {
    const element = this.el.nativeElement;
    element.style.boxShadow = `0 0 30px 0 rgba(168, 85, 247, 0.5),
                               0 0 60px 0 rgba(59, 130, 246, 0.3)`;
  }

  private handleMouseMove(event: MouseEvent) {
    const element = this.el.nativeElement;
    const rect = element.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    const distance = Math.min(15, this.animation.distance(mouseX, mouseY, centerX, centerY) / 30);

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    this.animation.setTransform(element, moveX, moveY, 1.02);
  }

  private handleMouseLeave() {
    const element = this.el.nativeElement;
    element.style.transform = 'translate3d(0, 0, 0) scale(1)';
    element.style.boxShadow = 'none';
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    const element = this.el.nativeElement;
    if (this.boundEnter) {
      element.removeEventListener('mouseenter', this.boundEnter as EventListener);
      this.boundEnter = null;
    }
    if (this.boundMove) {
      element.removeEventListener('mousemove', this.boundMove as EventListener);
      this.boundMove = null;
    }
    if (this.boundLeave) {
      element.removeEventListener('mouseleave', this.boundLeave as EventListener);
      this.boundLeave = null;
    }
  }
}
