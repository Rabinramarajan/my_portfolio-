import { Injectable, InjectionToken, inject, signal } from '@angular/core';

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
import { PRICING_PLANS } from '../config/hire.content';
import type {
  AboutContent,
  AvailabilityContent,
  ContactContent,
  HeroContent,
  PortfolioExperience,
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
import type { PortfolioRepository } from '../repository/portfolio.repository';
import { StaticPortfolioRepository } from '../repository/static-portfolio.repository';

/**
 * Swap point for the content source. Provide `HttpPortfolioRepository` here and
 * the whole site reads from the content API instead of the authored config.
 */
export const PORTFOLIO_REPOSITORY = new InjectionToken<PortfolioRepository>(
  'PortfolioRepository',
);

/**
 * Loads the portfolio content bundle through a repository and exposes it as
 * signals. Seeded synchronously from the authored config so first paint and
 * SSR never wait on a request; `refresh()` re-hydrates from the repository
 * (useful once the source is remote).
 */
@Injectable({ providedIn: 'root' })
export class PortfolioContentService {
  private readonly repository =
    inject(PORTFOLIO_REPOSITORY, { optional: true }) ?? inject(StaticPortfolioRepository);

  readonly profile = signal<PortfolioProfile>(PROFILE);
  readonly projects = signal<readonly PortfolioProject[]>(PROJECTS);
  readonly services = signal<readonly PortfolioService[]>(SERVICES);
  readonly experience = signal<readonly PortfolioExperience[]>(EXPERIENCE);
  readonly skills = signal<readonly PortfolioSkillCluster[]>(SKILLS);
  readonly process = signal<readonly PortfolioProcessStep[]>(PROCESS);
  readonly testimonials = signal<readonly PortfolioTestimonial[]>(TESTIMONIALS);
  readonly media = signal<SiteMedia>(SITE_MEDIA);

  readonly hero = signal<HeroContent>(HERO);
  readonly about = signal<AboutContent>(ABOUT);
  readonly availability = signal<AvailabilityContent>(AVAILABILITY);
  readonly contact = signal<ContactContent>(CONTACT);
  readonly siteSettings = signal<SiteSettings>(SITE_SETTINGS);
  readonly sections = signal<SectionsContent>(SECTIONS);
  readonly uiCopy = signal<UiCopy>(UI_COPY);
  readonly pricingPlans = signal<readonly PricingPlan[]>(PRICING_PLANS);

  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.refresh();
  }

  /** Re-hydrates every signal from the configured repository. */
  async refresh(): Promise<void> {
    if (this.loaded() || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const content = await this.repository.load();
      this.profile.set(content.profile);
      this.projects.set(content.projects);
      this.services.set(content.services);
      this.experience.set(content.experience);
      this.skills.set(content.skills);
      this.process.set(content.process);
      this.testimonials.set(content.testimonials);
      this.media.set(content.media);
      this.hero.set(content.hero);
      this.about.set(content.about);
      this.availability.set(content.availability);
      this.contact.set(content.contact);
      this.siteSettings.set(content.siteSettings);
      this.sections.set(content.sections);
      this.uiCopy.set(content.uiCopy);
      this.pricingPlans.set(content.pricingPlans);
      this.loaded.set(true);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to load portfolio content.');
    } finally {
      this.loading.set(false);
    }
  }
}
