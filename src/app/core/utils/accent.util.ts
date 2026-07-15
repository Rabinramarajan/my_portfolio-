import type { AccentColor } from '../types/common.types';

/**
 * Maps an {@link AccentColor} to its themed CSS custom property.
 * Keeps components free of hardcoded hex values — they consume tokens only.
 */
export const ACCENT_VAR: Readonly<Record<AccentColor, string>> = {
  purple: 'var(--color-brand-purple)',
  violet: 'var(--color-brand-violet)',
  blue: 'var(--color-brand-blue)',
  cyan: 'var(--color-brand-cyan)',
  green: 'var(--color-success)',
  orange: 'var(--color-warning)',
  red: 'var(--color-danger)',
  amber: 'var(--color-warning)',
};

/** Resolve an accent (with a safe default) to its CSS var reference. */
export function accentVar(accent: AccentColor | undefined, fallback: AccentColor = 'purple'): string {
  return ACCENT_VAR[accent ?? fallback];
}
