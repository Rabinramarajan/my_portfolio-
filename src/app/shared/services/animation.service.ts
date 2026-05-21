import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Premium animation utility service
 * Handles smooth, GPU-accelerated animations inspired by Apple, Vercel, Stripe, etc.
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  private readonly doc = inject(DOCUMENT);
  
  /**
   * Smooth easing functions for premium animations
   */
  easing = {
    // Cubic Bezier easing - smooth and natural
    easeInOutCubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    
    // Bounce and elastic
    easeOutElastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeOutBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Smooth and spring-like
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.42, 0, 0.58, 1)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
    
    // Linear for continuous motion
    linear: 'linear',
  };

  /**
   * Interpolate between two values smoothly
   */
  interpolate(
    start: number,
    end: number,
    progress: number,
    easeFunction: (t: number) => number = this.easeOutCubic.bind(this)
  ): number {
    return start + (end - start) * easeFunction(progress);
  }

  /**
   * Custom easing function - cubic Bezier
   */
  easeOutCubic(t: number): number {
    const f = t - 1;
    return f * f * f + 1;
  }

  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Animate mouse position for smooth motion
   */
  smoothMouseFollower(
    mouseX: number,
    mouseY: number,
    currentX: number,
    currentY: number,
    smoothing: number = 0.15
  ) {
    return {
      x: currentX + (mouseX - currentX) * smoothing,
      y: currentY + (mouseY - currentY) * smoothing,
    };
  }

  /**
   * Calculate distance between two points
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Request animation frame with cleanup
   */
  requestFrame(callback: FrameRequestCallback): () => void {
    const id = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(id);
  }

  /**
   * Intersection Observer for scroll animations
   */
  observeIntersection(
    element: Element,
    callback: (isVisible: boolean) => void,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): () => void {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.unobserve(element);
  }

  /**
   * Apply GPU-accelerated transform
   */
  setTransform(
    element: HTMLElement,
    x: number = 0,
    y: number = 0,
    scale: number = 1,
    rotate: number = 0
  ): void {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
  }

  /**
   * Stagger animation delay for sequential effects
   */
  getStaggerDelay(index: number, baseDelay: number = 0.05): string {
    return `${index * baseDelay}s`;
  }
}
