/**
 * Shared utilities for animation directives
 */

export function shouldReduceEffects(): boolean {
  if (typeof navigator === 'undefined') return false;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowEndDevice = (navigator.hardwareConcurrency ?? 4) < 4;
  const dataSaver = (navigator as any).connection?.saveData === true;
  return prefersReduced || lowEndDevice || dataSaver;
}
