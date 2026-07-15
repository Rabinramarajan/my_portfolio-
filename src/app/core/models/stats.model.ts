import type { AccentColor, IconName } from '../types/common.types';

/** A metric tile (e.g. "4+ Years Experience", "50+ Projects"). */
export interface StatItem {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly icon?: IconName;
  readonly accent?: AccentColor;
}

/** Named collections of stats keyed by page/context (stats.json). */
export type StatsConfig = Readonly<Record<string, readonly StatItem[]>>;
