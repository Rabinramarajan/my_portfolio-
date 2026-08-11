import type {
  AboutContent,
  AvailabilityContent,
  ContactContent,
  HeroContent,
  PortfolioExperience,
  PortfolioMedia,
  PortfolioProcessStep,
  PortfolioProfile,
  PortfolioProject,
  PortfolioService,
  PortfolioSkillCluster,
  PortfolioTestimonial,
  PricingPlan,
  SectionsContent,
  SiteMedia,
  SiteSettings,
  UiCopy,
} from '../models/portfolio.models';

/**
 * One snapshot of everything the site renders, shaped like the content API so
 * a static source and a remote one can hand back the same thing.
 */
export interface PortfolioContent {
  readonly profile: PortfolioProfile;
  readonly projects: readonly PortfolioProject[];
  readonly services: readonly PortfolioService[];
  readonly experience: readonly PortfolioExperience[];
  readonly skills: readonly PortfolioSkillCluster[];
  readonly process: readonly PortfolioProcessStep[];
  readonly testimonials: readonly PortfolioTestimonial[];
  readonly media: SiteMedia;
  readonly hero: HeroContent;
  readonly about: AboutContent;
  readonly availability: AvailabilityContent;
  readonly contact: ContactContent;
  readonly siteSettings: SiteSettings;
  readonly sections: SectionsContent;
  readonly uiCopy: UiCopy;
  readonly pricingPlans: readonly PricingPlan[];
}

/**
 * Source of portfolio content. `StaticPortfolioRepository` reads the authored
 * config; `HttpPortfolioRepository` fetches the same shape from the content
 * API, so swapping sources never touches a component.
 */
export interface PortfolioRepository {
  readonly kind: 'static' | 'http';
  load(): Promise<PortfolioContent>;
}

/** Convenience type for a media entry without a photo slot. */
export type { PortfolioMedia };
