/**
 * Cross-cutting utility & primitive types.
 * Keep design-system-facing unions here so components stay configurable.
 */

/** Icon name registered in the app icon registry (see core/config/icons.data). */
export type IconName = string;

/** ISO date string, e.g. "2024-05-15". */
export type IsoDate = string;

/** A value that may be absent. */
export type Nullable<T> = T | null;

/** Brand accent used across cards, tags, progress, glows. */
export type AccentColor =
  | 'purple'
  | 'violet'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'orange'
  | 'red'
  | 'amber';

/** Semantic status used by alerts / badges. */
export type StatusVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

/** Percentage 0–100. */
export type Percentage = number;

/** A single point in a time-series chart (label + numeric value). */
export interface GrowthPoint {
  readonly label: string;
  readonly value: number;
}

/** External link descriptor. */
export interface ExternalLink {
  readonly label: string;
  readonly url: string;
  readonly icon?: IconName;
  readonly external?: boolean;
}
