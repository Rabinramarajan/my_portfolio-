import type { IsoDate, AccentColor, IconName } from '../types/common.types';

/** Community contribution entry (mentoring, speaking, organizing, etc.). */
export interface CommunityContribution {
  readonly id: string;
  readonly title: string;
  readonly type: 'Mentoring' | 'Speaking' | 'Organizing' | 'Volunteering' | 'Teaching';
  readonly description: string;
  readonly organization?: string;
  readonly date: IsoDate;
  readonly link?: string;
  readonly icon?: IconName;
  readonly accent?: AccentColor;
}

/** community.json payload. */
export interface CommunityConfig {
  readonly items: readonly CommunityContribution[];
}
