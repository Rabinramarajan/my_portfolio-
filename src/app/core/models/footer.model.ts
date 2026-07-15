import type { ExternalLink } from '../types/common.types';
import type { NavGroup } from './navigation.model';

/** footer.json payload. */
export interface FooterConfig {
  readonly description: string;
  readonly groups: readonly NavGroup[];
  readonly newsletter: {
    readonly heading: string;
    readonly caption: string;
    readonly placeholder: string;
  };
  readonly quote: { readonly text: string; readonly author: string };
  readonly bottomLinks: readonly ExternalLink[];
  readonly copyright: string;
}
