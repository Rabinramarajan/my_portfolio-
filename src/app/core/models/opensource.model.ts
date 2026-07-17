import type { IsoDate, AccentColor, IconName } from '../types/common.types';

/** Open source contribution entry. */
export interface OpenSourceContribution {
  readonly id: string;
  readonly projectName: string;
  readonly description: string;
  readonly role: string;
  readonly contributionType:
    'Bug Fix' | 'Feature' | 'Documentation' | 'Performance' | 'Maintenance';
  readonly date: IsoDate;
  readonly link: string;
  readonly icon?: IconName;
  readonly accent?: AccentColor;
}

/** opensource.json payload. */
export interface OpenSourceConfig {
  readonly items: readonly OpenSourceContribution[];
}
