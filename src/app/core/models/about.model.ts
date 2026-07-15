import type { AccentColor } from '../types/common.types';

/** A coloured phrase in the About subtitle (e.g. "Curious mind."). */
export interface AboutSubtitlePart {
  readonly text: string;
  readonly accent?: AccentColor | 'default';
}

/** A single milestone in the "My Journey" timeline. */
export interface JourneyMilestone {
  readonly id: string;
  readonly year: string;
  readonly description: string;
}

/** about.json payload (identity, whatIDo & values come from other JSON). */
export interface AboutConfig {
  readonly badge: string;
  readonly subtitleParts: readonly AboutSubtitlePart[];
  readonly bio: string;
  readonly signature: string;
  readonly quote: { readonly text: string };
  readonly journey: readonly JourneyMilestone[];
}
