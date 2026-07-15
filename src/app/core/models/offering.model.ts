import type { AccentColor, IconName } from '../types/common.types';

/** A freelance service offering shown on the Services page. */
export interface Offering {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly accent?: AccentColor;
  /** Concrete deliverables / what's included. */
  readonly features: readonly string[];
}

/** offerings.json payload. */
export interface OfferingsConfig {
  readonly items: readonly Offering[];
}
