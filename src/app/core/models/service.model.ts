import type { AccentColor, IconName } from '../types/common.types';

/** Offered service / core value (About "Core Values", Hire Me). */
export interface ServiceItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly accent?: AccentColor;
}

/** services.json payload. */
export interface ServicesConfig {
  readonly items: readonly ServiceItem[];
}
