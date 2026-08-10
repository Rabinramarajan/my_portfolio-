import { DestroyRef, inject } from '@angular/core';

export interface AsyncTeardown {
  /** True once the host view has been destroyed. */
  readonly destroyed: boolean;
  /**
   * Registers cleanup for work that finished asynchronously. Safe to call at
   * any point: if the view is already gone, the teardown runs immediately.
   */
  register(teardown: () => void): void;
}

/**
 * Cleanup registration that survives an `await`.
 *
 * `DestroyRef.onDestroy()` throws `NG0911: View has already been destroyed` if
 * it is called after the view is gone — which is exactly what happens when a
 * directive awaits a lazily-imported library (GSAP, Three.js) and the user
 * navigates away before the import resolves.
 *
 * This registers the single real `onDestroy` hook *synchronously*, during
 * construction, and gives async code a safe place to hand its teardown to
 * afterwards.
 *
 * Must be called from an injection context.
 */
export function asyncTeardown(): AsyncTeardown {
  const destroyRef = inject(DestroyRef);

  let destroyed = false;
  let pending: (() => void) | null = null;

  destroyRef.onDestroy(() => {
    destroyed = true;
    pending?.();
    pending = null;
  });

  return {
    get destroyed() {
      return destroyed;
    },
    register(teardown: () => void) {
      if (destroyed) {
        teardown();
        return;
      }
      pending = teardown;
    },
  };
}
