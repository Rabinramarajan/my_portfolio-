import type { AccentColor } from '../types/common.types';
import type { ThemeMode } from './theme.model';

export type { ThemeMode };

/** Font family options. */
export type FontFamily = 'inter' | 'roboto' | 'poppins' | 'opensans' | 'dyslexic';

/** Layout style options. */
export type LayoutStyle = 'default' | 'minimal' | 'spacious';

/** Content density mode. */
export type ContentDensity = 'compact' | 'normal' | 'expanded';

/** Accessibility profile. */
export interface AccessibilityProfile {
  readonly enabled: boolean;
  readonly highContrast: boolean;
  readonly largerText: boolean;
  readonly reduceMotion: boolean;
  readonly fontSize: 'normal' | 'large' | 'xlarge';
}

/** Font settings. */
export interface FontSettings {
  readonly family: FontFamily;
  readonly dyslexiaFriendly: boolean;
  readonly lineHeight: 'normal' | 'relaxed' | 'loose';
  readonly letterSpacing: 'normal' | 'wide' | 'wider';
}

/** Personalization preferences. */
export interface PersonalizationSettings {
  readonly theme: ThemeMode;
  readonly accentColor: AccentColor;
  readonly font: FontSettings;
  readonly layout: LayoutStyle;
  readonly contentDensity: ContentDensity;
  readonly accessibility: AccessibilityProfile;
  readonly soundEnabled: boolean;
  readonly animationsEnabled: boolean;
  readonly lastUpdated: string;
}

/** Default personalization settings. */
export const DEFAULT_PERSONALIZATION_SETTINGS: PersonalizationSettings = {
  theme: 'auto',
  accentColor: 'blue',
  font: {
    family: 'inter',
    dyslexiaFriendly: false,
    lineHeight: 'normal',
    letterSpacing: 'normal',
  },
  layout: 'default',
  contentDensity: 'normal',
  accessibility: {
    enabled: false,
    highContrast: false,
    largerText: false,
    reduceMotion: false,
    fontSize: 'normal',
  },
  soundEnabled: true,
  animationsEnabled: true,
  lastUpdated: new Date().toISOString(),
};
