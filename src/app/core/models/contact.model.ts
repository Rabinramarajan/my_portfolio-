import type { AccentColor, IconName } from '../types/common.types';

/** Contact channel row (email, phone, location, website). */
export interface ContactChannel {
  readonly id: string;
  readonly icon: IconName;
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly accent?: AccentColor;
}

/** Availability bullet ("Freelance Projects", ...). */
export interface AvailabilityItem {
  readonly id: string;
  readonly label: string;
}

/** contact.json payload. */
export interface ContactConfig {
  readonly channels: readonly ContactChannel[];
  readonly availableFor: readonly AvailabilityItem[];
  readonly location: {
    readonly label: string;
    readonly mapUrl: string;
    readonly mapImage?: string;
  };
  readonly quote?: { readonly text: string; readonly author: string };
  readonly responseTime: string;
}
