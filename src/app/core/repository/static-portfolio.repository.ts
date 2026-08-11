import { Injectable } from '@angular/core';

import { PRICING_PLANS } from '../config/hire.content';
import {
  ABOUT,
  AVAILABILITY,
  CONTACT,
  EXPERIENCE,
  HERO,
  PROCESS,
  PROFILE,
  PROJECTS,
  SECTIONS,
  SERVICES,
  SITE_MEDIA,
  SITE_SETTINGS,
  SKILLS,
  TESTIMONIALS,
  UI_COPY,
} from '../config/portfolio.content';
import type { PortfolioContent, PortfolioRepository } from './portfolio.repository';

/**
 * Serves content straight from the authored config. This is the default source:
 * zero network, fully typed, and the same bundle shape the content API returns.
 */
@Injectable({ providedIn: 'root' })
export class StaticPortfolioRepository implements PortfolioRepository {
  readonly kind = 'static' as const;

  load(): Promise<PortfolioContent> {
    return Promise.resolve({
      profile: PROFILE,
      projects: PROJECTS,
      services: SERVICES,
      experience: EXPERIENCE,
      skills: SKILLS,
      process: PROCESS,
      testimonials: TESTIMONIALS,
      media: SITE_MEDIA,
      hero: HERO,
      about: ABOUT,
      availability: AVAILABILITY,
      contact: CONTACT,
      siteSettings: SITE_SETTINGS,
      sections: SECTIONS,
      uiCopy: UI_COPY,
      pricingPlans: PRICING_PLANS,
    });
  }
}
