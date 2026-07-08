import { Directive, ElementRef, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';
import { shouldReduceEffects } from './animation-utils';

/**
 * Scroll Animation Trigger Directive
 * Cinematic section reveals with fade-up and blur-to-clear transitions
 */
@Directive({
  selector: '[appScrollTrigger]',
  standalone: true,
})
export class ScrollTriggerDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private unobserve: (() => void) | null = null;
  @Input('appScrollTrigger') direction: 'up' | 'down' | 'left' | 'right' | '' | string = '';
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    this.setupInitialState();
    this.observeScroll();
  }

  private setupInitialState() {
    const element = this.el.nativeElement;

    if (this.shouldDisable) {
      element.style.opacity = '1';
      element.style.transform = 'translate(0, 0)';
      element.style.filter = 'blur(0px)';
      return;
    }

    element.style.opacity = '0';

    let transformStr = 'translateY(24px)';
    if (this.direction === 'left') {
      transformStr = 'translateX(-24px)';
    } else if (this.direction === 'right') {
      transformStr = 'translateX(24px)';
    } else if (this.direction === 'down') {
      transformStr = 'translateY(-24px)';
    }

    element.style.transform = transformStr;
    element.style.filter = 'blur(10px)';
    element.style.transition = `all 0.6s ${this.animation.easing.easeOutCubic}`;
  }

  private observeScroll() {
    const element = this.el.nativeElement;
    this.unobserve = this.animation.observeIntersection(
      element,
      (isVisible) => {
        if (isVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translate(0, 0)';
          element.style.filter = 'blur(0px)';
        }
      },
      { threshold: 0.2 }
    );
  }

  ngOnDestroy() {
    if (this.unobserve) {
      this.unobserve();
    }
  }
}
