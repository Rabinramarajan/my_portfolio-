import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Central GSAP configuration. Registering the ScrollTrigger plugin here (a
 * single side-effecting import) guarantees every animation directive shares one
 * registered instance. The app is client-only (no SSR), so touching `window`
 * at import time is safe.
 */
gsap.registerPlugin(ScrollTrigger);

/**
 * Motion tokens — mirror the former ANIMATION_TOKENS so the GSAP animations feel
 * identical to the CSS ones they replace. Durations are in seconds (GSAP unit).
 */
export const MOTION = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
  },
  ease: {
    decelerate: 'power2.out',
    accelerate: 'power1.in',
    emphasized: 'back.out(1.4)',
  },
  /** Per-item delay for staggered list reveals (seconds). */
  stagger: 0.06,
  /** Vertical travel for fade/rise reveals (px). */
  rise: 16,
  /** Fraction of the viewport at which a scroll reveal fires (`top X%`). */
  triggerStart: 'top 88%',
} as const;

/** True when the user has asked the OS to minimise non-essential motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export { gsap, ScrollTrigger };
