import { Injectable, computed, inject } from '@angular/core';

import type { PortfolioProject } from '../models/portfolio.models';
import { PortfolioContentService } from './portfolio-content.service';

/**
 * Read model for all portfolio content.
 *
 * Thin facade over `PortfolioContentService` — components depend on the store,
 * and the store depends on the content source, so swapping the repository (or
 * moving to an API) never touches a component.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly content = inject(PortfolioContentService);

  readonly profile = this.content.profile;
  readonly projects = this.content.projects;
  readonly services = this.content.services;
  readonly experience = this.content.experience;
  readonly skills = this.content.skills;
  readonly process = this.content.process;
  readonly testimonials = this.content.testimonials;
  /** Section photography and ambient footage. */
  readonly media = this.content.media;

  readonly hero = this.content.hero;
  readonly about = this.content.about;
  readonly availability = this.content.availability;
  readonly contact = this.content.contact;
  readonly siteSettings = this.content.siteSettings;
  readonly sections = this.content.sections;
  readonly uiCopy = this.content.uiCopy;
  readonly pricingPlans = this.content.pricingPlans;

  /** Only `featured` projects, in authored order. */
  readonly featuredProjects = computed(() => this.projects().filter((project) => project.featured));
  readonly hasTestimonials = computed(() => this.testimonials().length > 0);

  bySlug(slug: string): PortfolioProject | undefined {
    return this.projects().find((project) => project.slug === slug);
  }

  /** Next project in publication order, wrapping around — powers the case-study footer. */
  nextProject(slug: string): PortfolioProject | undefined {
    const all = this.projects();
    const index = all.findIndex((project) => project.slug === slug);
    return index === -1 ? undefined : all[(index + 1) % all.length];
  }
}
