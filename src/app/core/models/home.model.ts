import type { IconName } from '../types/common.types';

/** A "What I do" highlight card in the hero. */
export interface HeroHighlight {
  readonly id: string;
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
}

/** A hero call-to-action button (maps to AnimatedButton inputs). */
export interface HeroCta {
  readonly id: string;
  readonly label: string;
  readonly variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  readonly icon?: IconName;
  readonly iconPosition?: 'left' | 'right';
  readonly route?: string;
  readonly href?: string;
}

/** home.json payload — hero-specific content (identity comes from profile.json). */
export interface HomeConfig {
  readonly hero: {
    readonly availabilityLabel: string;
    readonly headlineLead: string;
    readonly headlineHighlight: string;
    readonly subtitle: string;
    readonly ctas: readonly HeroCta[];
    readonly highlights: readonly HeroHighlight[];
    readonly techHeading: string;
    readonly techProgress: number;
  };
}
