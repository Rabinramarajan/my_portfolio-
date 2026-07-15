import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal, type Signal } from '@angular/core';

import type { ThemeMode } from '../models';

const STORAGE_KEY = 'portfolio-theme';
const DEFAULT_MODE: ThemeMode = 'dark';

/**
 * Signal-based theme controller.
 *
 * - Single source of truth: {@link mode} (a writable signal).
 * - An `effect` mirrors the signal to `<html data-theme>` + localStorage.
 * - Falls back to persisted value, then system preference, then default.
 *
 * No RxJS, no zone.js — pure signals.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly _mode = signal<ThemeMode>(this.resolveInitialMode());

  /** Current theme (read-only view). */
  readonly mode: Signal<ThemeMode> = this._mode.asReadonly();

  /** Convenience flag for templates/icons. */
  readonly isDark = computed(() => this._mode() === 'dark');

  constructor() {
    effect(() => {
      const mode = this._mode();
      const root = this.document.documentElement;
      root.setAttribute('data-theme', mode);
      root.style.colorScheme = mode;
      this.persist(mode);
    });
  }

  /** Explicitly set the theme. */
  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  /** Toggle between dark and light. */
  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  private resolveInitialMode(): ThemeMode {
    const stored = this.safeReadStorage();
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    const prefersLight = this.document.defaultView?.matchMedia?.(
      '(prefers-color-scheme: light)',
    ).matches;
    return prefersLight ? 'light' : DEFAULT_MODE;
  }

  private safeReadStorage(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private persist(mode: ThemeMode): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable (SSR / privacy mode) — ignore */
    }
  }
}
