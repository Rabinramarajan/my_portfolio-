import type { IconName } from '../types/common.types';

export type SocialPlatform =
  'github' | 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'email' | 'whatsapp';

/** Social channel used in sidebar, footer, contact, linkedin pages. */
export interface SocialLink {
  readonly id: string;
  readonly platform: SocialPlatform;
  readonly label: string;
  readonly icon: IconName;
  readonly url: string;
  readonly handle?: string;
}

/** socials.json payload. */
export interface SocialsConfig {
  readonly heading?: string;
  readonly links: readonly SocialLink[];
}
