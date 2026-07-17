import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import type {
  ContentDensity,
  FontSettings,
  LayoutStyle,
  PersonalizationSettings,
  ThemeMode,
} from '../models/personalization.model';
import { DEFAULT_PERSONALIZATION_SETTINGS } from '../models/personalization.model';
import type { AccentColor } from '../types/common.types';

const STORAGE_KEY = 'portfolio-personalization';

/** Manages personalization settings with localStorage persistence. */
@Injectable({ providedIn: 'root' })
export class PersonalizationService {
  private readonly document = inject(DOCUMENT);

  private readonly settings = signal<PersonalizationSettings>(
    this.loadFromStorage() ?? DEFAULT_PERSONALIZATION_SETTINGS,
  );

  readonly theme = signal<ThemeMode>(this.settings().theme);
  readonly accentColor = signal<AccentColor>(this.settings().accentColor);
  readonly font = signal<FontSettings>(this.settings().font);
  readonly layout = signal<LayoutStyle>(this.settings().layout);
  readonly contentDensity = signal<ContentDensity>(this.settings().contentDensity);
  readonly accessibility = signal(this.settings().accessibility);
  readonly soundEnabled = signal(this.settings().soundEnabled);
  readonly animationsEnabled = signal(this.settings().animationsEnabled);

  constructor() {
    effect(() => {
      this.applyTheme(this.theme());
    });

    effect(() => {
      this.applyAccentColor(this.accentColor());
    });

    effect(() => {
      this.applyFont(this.font());
    });

    effect(() => {
      this.applyLayout(this.layout());
    });

    effect(() => {
      this.applyContentDensity(this.contentDensity());
    });

    effect(() => {
      this.applyAccessibility(this.accessibility());
    });

    effect(() => {
      this.persistSettings();
    });

    this.initializeTheme();
  }

  private loadFromStorage(): PersonalizationSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private persistSettings(): void {
    try {
      const current: PersonalizationSettings = {
        theme: this.theme(),
        accentColor: this.accentColor(),
        font: this.font(),
        layout: this.layout(),
        contentDensity: this.contentDensity(),
        accessibility: this.accessibility(),
        soundEnabled: this.soundEnabled(),
        animationsEnabled: this.animationsEnabled(),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      console.warn('Failed to persist personalization settings');
    }
  }

  private initializeTheme(): void {
    if (this.theme() === 'auto') {
      const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
      if (prefersDark?.matches) {
        this.document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        this.document.documentElement.setAttribute('data-theme', 'light');
      }
    } else {
      this.document.documentElement.setAttribute('data-theme', this.theme());
    }
  }

  private applyTheme(theme: ThemeMode): void {
    if (theme === 'auto') {
      const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
      this.document.documentElement.setAttribute(
        'data-theme',
        prefersDark?.matches ? 'dark' : 'light',
      );
    } else {
      this.document.documentElement.setAttribute('data-theme', theme);
    }
  }

  private applyAccentColor(color: AccentColor): void {
    this.document.documentElement.setAttribute('data-accent', color);
  }

  private applyFont(font: FontSettings): void {
    const fontFamily = font.dyslexiaFriendly ? 'dyslexic' : font.family;
    this.document.documentElement.setAttribute('data-font', fontFamily);
    this.document.documentElement.setAttribute('data-line-height', font.lineHeight);
    this.document.documentElement.setAttribute('data-letter-spacing', font.letterSpacing);
  }

  private applyLayout(layout: LayoutStyle): void {
    this.document.documentElement.setAttribute('data-layout', layout);
  }

  private applyContentDensity(density: ContentDensity): void {
    this.document.documentElement.setAttribute('data-density', density);
  }

  private applyAccessibility(profile: typeof DEFAULT_PERSONALIZATION_SETTINGS.accessibility): void {
    if (profile.enabled) {
      this.document.documentElement.setAttribute('data-a11y', 'enabled');
      if (profile.highContrast) {
        this.document.documentElement.setAttribute('data-contrast', 'high');
      }
      if (profile.largerText) {
        this.document.documentElement.setAttribute('data-large-text', 'true');
      }
      if (profile.reduceMotion) {
        this.document.documentElement.setAttribute('data-reduce-motion', 'true');
      }
    } else {
      this.document.documentElement.removeAttribute('data-a11y');
      this.document.documentElement.removeAttribute('data-contrast');
      this.document.documentElement.removeAttribute('data-large-text');
      this.document.documentElement.removeAttribute('data-reduce-motion');
    }
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
  }

  setAccentColor(color: AccentColor): void {
    this.accentColor.set(color);
  }

  setFont(font: Partial<FontSettings>): void {
    this.font.update((current) => ({ ...current, ...font }));
  }

  setLayout(layout: LayoutStyle): void {
    this.layout.set(layout);
  }

  setContentDensity(density: ContentDensity): void {
    this.contentDensity.set(density);
  }

  setAccessibility(
    accessibility: Partial<typeof DEFAULT_PERSONALIZATION_SETTINGS.accessibility>,
  ): void {
    this.accessibility.update((current) => ({ ...current, ...accessibility }));
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled.set(enabled);
  }

  setAnimationsEnabled(enabled: boolean): void {
    this.animationsEnabled.set(enabled);
  }

  resetToDefaults(): void {
    this.theme.set(DEFAULT_PERSONALIZATION_SETTINGS.theme);
    this.accentColor.set(DEFAULT_PERSONALIZATION_SETTINGS.accentColor);
    this.font.set(DEFAULT_PERSONALIZATION_SETTINGS.font);
    this.layout.set(DEFAULT_PERSONALIZATION_SETTINGS.layout);
    this.contentDensity.set(DEFAULT_PERSONALIZATION_SETTINGS.contentDensity);
    this.accessibility.set(DEFAULT_PERSONALIZATION_SETTINGS.accessibility);
    this.soundEnabled.set(DEFAULT_PERSONALIZATION_SETTINGS.soundEnabled);
    this.animationsEnabled.set(DEFAULT_PERSONALIZATION_SETTINGS.animationsEnabled);
  }
}
