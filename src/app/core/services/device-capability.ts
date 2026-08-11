import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

interface NetworkInformation {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/**
 * Single authority on how much motion and GPU work this device should be asked
 * to do. Every animated feature gates on the signals here rather than sniffing
 * `window` itself, so the fallback story stays consistent — and SSR-safe, since
 * every value has a conservative server-side default.
 */
@Injectable({ providedIn: 'root' })
export class DeviceCapability {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** `prefers-reduced-motion: reduce`. Assumed true on the server so SSR markup is static. */
  readonly prefersReducedMotion = signal(true);
  /** Fine pointer + hover — the only environment where a custom cursor makes sense. */
  readonly hasPrecisePointer = signal(false);
  readonly isTouch = signal(false);
  readonly viewportWidth = signal(1440);
  private readonly lowPowerHardware = signal(false);
  private readonly saveData = signal(false);

  readonly isMobile = computed(() => this.viewportWidth() < 768);
  readonly isTablet = computed(() => this.viewportWidth() >= 768 && this.viewportWidth() < 1024);

  /** Master switch for scroll animation, parallax and reveals. */
  readonly animationsEnabled = computed(() => this.isBrowser && !this.prefersReducedMotion());

  readonly webglEnabled = computed(
    () =>
      this.animationsEnabled() &&
      !this.saveData() &&
      this.supportsWebgl(),
  );

  readonly performanceTier = computed<'high' | 'medium' | 'low' | 'disabled'>(() => {
    if (!this.webglEnabled()) return 'disabled';
    if (this.saveData()) return 'disabled';
    if (this.isMobile()) return 'disabled';
    if (this.lowPowerHardware()) return 'low';
    if (this.isTablet()) return 'medium';
    return 'high';
  });

  readonly customCursorEnabled = computed(() => {
    // Enable custom cursor if animations are enabled and it's not explicitly a touch device
    // Falls back gracefully: if pointer detection fails but no touch is detected, still enable
    const isExplicitlyTouch = this.isTouch();
    const couldHavePrecisePointer = this.hasPrecisePointer() || !isExplicitlyTouch;
    return this.animationsEnabled() && couldHavePrecisePointer && !isExplicitlyTouch;
  });

  /** Called once from the root component, in the browser only. */
  initialize(): () => void {
    if (!this.isBrowser) return () => undefined;

    const view = this.document.defaultView!;
    const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = view.matchMedia('(hover: hover) and (pointer: fine)');
    const coarse = view.matchMedia('(pointer: coarse)');

    // `sync` also stamps `data-cursor` on <html>: global CSS reads it to hide
    // the native pointer, and anything outside Angular — tests included — gets
    // a reliable signal that the client has taken over from the server render.
    const sync = () => {
      this.prefersReducedMotion.set(motion.matches);
      this.hasPrecisePointer.set(pointer.matches);
      this.isTouch.set(coarse.matches || 'ontouchstart' in view);
      this.viewportWidth.set(view.innerWidth);
      this.document.documentElement.setAttribute(
        'data-cursor',
        this.customCursorEnabled() ? 'custom' : 'native',
      );
    };

    const connection = (view.navigator as Navigator & { connection?: NetworkInformation })
      .connection;
    this.saveData.set(Boolean(connection?.saveData) || /2g/.test(connection?.effectiveType ?? ''));
    // `deviceMemory` and `hardwareConcurrency` are coarse but the only signals
    // available before we have committed to rendering anything expensive.
    const memory = (view.navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    this.lowPowerHardware.set(memory <= 4 || (view.navigator.hardwareConcurrency ?? 8) <= 4);

    sync();
    motion.addEventListener('change', sync);
    pointer.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    view.addEventListener('resize', sync, { passive: true });

    return () => {
      motion.removeEventListener('change', sync);
      pointer.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
      view.removeEventListener('resize', sync);
    };
  }

  private supportsWebgl(): boolean {
    if (!this.isBrowser) return false;
    try {
      const canvas = this.document.createElement('canvas');
      return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }
}
