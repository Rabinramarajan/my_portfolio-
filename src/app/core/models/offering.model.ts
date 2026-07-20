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

/** One step in the "My Approach" process timeline. */
export interface ApproachStep {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}

/** offerings.json payload. */
export interface OfferingsConfig {
  readonly items: readonly Offering[];
  readonly approach?: readonly ApproachStep[];
}
