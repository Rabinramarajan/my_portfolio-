import type { IconName } from '../types/common.types';

/** A single primary navigation entry (sidebar / navbar). */
export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly route: string;
  readonly exact?: boolean;
  readonly badge?: string;
}

/** Grouped links used by the footer columns. */
export interface NavGroup {
  readonly id: string;
  readonly title: string;
  readonly items: readonly NavLink[];
}

/** Footer / resource link (may be internal route or external url). */
export interface NavLink {
  readonly label: string;
  readonly route?: string;
  readonly url?: string;
  readonly external?: boolean;
  readonly icon?: IconName;
}

/** Root navigation payload (navigation.json). */
export interface NavigationConfig {
  readonly primary: readonly NavItem[];
  /** Reduced set for the Home top navbar; falls back to `primary`. */
  readonly navbar?: readonly NavItem[];
}
