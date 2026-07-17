/** Supported UI themes. */
export type ThemeMode = 'dark' | 'light' | 'auto';

/** theme.json payload — runtime-tunable theme metadata. */
export interface ThemeConfig {
  readonly defaultMode: ThemeMode;
  readonly storageKey: string;
  readonly enableSystemPreference: boolean;
}
