import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private readonly doc = inject(DOCUMENT);

  easing = {
    easeInOutCubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutElastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeOutBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.42, 0, 0.58, 1)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
    linear: 'linear',
  };

  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  interpolate(
    start: number,
    end: number,
    progress: number,
    easeFunction: (t: number) => number = this.easeOutCubic.bind(this)
  ): number {
    return start + (end - start) * easeFunction(progress);
  }

  easeOutCubic(t: number): number {
    const f = t - 1;
    return f * f * f + 1;
  }

  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  smoothMouseFollower(
    mouseX: number,
    mouseY: number,
    currentX: number,
    currentY: number,
    smoothing = 0.15
  ) {
    return {
      x: currentX + (mouseX - currentX) * smoothing,
      y: currentY + (mouseY - currentY) * smoothing,
    };
  }

  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  observeIntersection(
    element: Element,
    callback: (isVisible: boolean) => void,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): () => void {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    }, options);
    observer.observe(element);
    return () => observer.disconnect();
  }

  setTransform(element: HTMLElement, x = 0, y = 0, scale = 1, rotate = 0): void {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
  }

  getStaggerDelay(index: number, baseDelay = 0.05): string {
    return `${index * baseDelay}s`;
  }
}
