import type { IsoDate, AccentColor, IconName } from '../types/common.types';

/** Tech talk or conference presentation entry. */
export interface TechTalk {
  readonly id: string;
  readonly title: string;
  readonly eventName: string;
  readonly date: IsoDate;
  readonly description: string;
  readonly link?: string;
  readonly videoUrl?: string;
  readonly slidesUrl?: string;
  readonly location?: string;
  readonly icon?: IconName;
  readonly accent?: AccentColor;
}

/** talks.json payload. */
export interface TalksConfig {
  readonly items: readonly TechTalk[];
}
