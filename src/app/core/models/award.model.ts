import type { IsoDate, AccentColor, IconName } from '../types/common.types';

/** Award or achievement entry. */
export interface Award {
  readonly id: string;
  readonly title: string;
  readonly issuer: string;
  readonly date: IsoDate;
  readonly description: string;
  readonly icon?: IconName;
  readonly accent?: AccentColor;
  readonly link?: string;
}

/** awards.json payload. */
export interface AwardsConfig {
  readonly items: readonly Award[];
}
