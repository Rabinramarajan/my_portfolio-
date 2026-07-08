import { Directive, ElementRef, OnInit, OnDestroy, Input, inject, NgZone } from '@angular/core';
import { shouldReduceEffects } from './animation-utils';

/**
 * Stagger Animation Directive
 * Staggers child elements with cascading fade-in animations
 */
@Directive({
  selector: '[appStagger]',
  standalone: true,
})
export class StaggerDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly ngZone = inject(NgZone);
  @Input() staggerDelay = 50;
  @Input() staggerDuration = 400;
  @Input() staggerMs = 50;
  @Input() staggerStartMs = 0;
  private animationIds: number[] = [];
  private shouldDisable = shouldReduceEffects();

  ngOnInit() {
    const element = this.el.nativeElement;
    const children = Array.from(element.children) as HTMLElement[];

    if (this.shouldDisable || children.length === 0) {
      return;
    }

    const delay = this.staggerMs || this.staggerDelay;
    const startDelay = this.staggerStartMs || 0;

    children.forEach((child, index) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(10px)';
      child.style.transition = `all ${this.staggerDuration}ms ease-out`;

      const totalDelay = startDelay + index * delay;
      this.ngZone.runOutsideAngular(() => {
        const id = window.setTimeout(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, totalDelay) as unknown as number;

        this.animationIds.push(id);
      });
    });
  }

  ngOnDestroy() {
    this.animationIds.forEach((id) => clearTimeout(id));
    this.animationIds = [];
  }
}
