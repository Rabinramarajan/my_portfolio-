import type { AccentColor } from '../types/common.types';

/** Technology chip / grid tile (icon-driven). */
export interface Technology {
  readonly id: string;
  readonly name: string;
  /** Path to the brand SVG/PNG asset. */
  readonly logo: string;
  readonly accent?: AccentColor;
  readonly url?: string;
}

/** technologies.json payload. */
export interface TechnologiesConfig {
  /** "Top Technologies" strip (Home). */
  readonly top: readonly Technology[];
  /** "Popular Technologies" grid (Skills). */
  readonly popular: readonly Technology[];
  /** Full "Tech Arsenal" grid (About). */
  readonly arsenal: readonly Technology[];
}
